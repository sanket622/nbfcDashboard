import React, { useEffect } from 'react';
import {
    Button, IconButton, Dialog, DialogContent
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller, useWatch } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AutocompleteFieldComponent from '../../subcompotents/AutocompleteFieldComponent';
import TextFieldComponent from '../../subcompotents/TextFieldComponent';
import {
    fetchRoles,
    fetchModulesByRole,
    updateAssociateSubAdmin,
    resetAssignRoleState,
} from '../../../redux/managerole/roleModuleSlice';
import { useSnackbar } from 'notistack';

const schema = yup.object().shape({
    userName: yup.string().required('User name is required'),
    role: yup.object().nullable().required('Role is required'),
    module: yup.array().min(1, 'At least one module is required'),
    mobile: yup.string().required('Mobile is required'),
});

const EditAssignRole = ({ onClose, open, subAdmin }) => {
    const dispatch = useDispatch();
    const { roles, modules, success, error } = useSelector((state) => state.roleModule);
    const { enqueueSnackbar } = useSnackbar();

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            userName: '',
            email: '',
            role: null,
            module: [],
            mobile: '',
        },
        resolver: yupResolver(schema),
    });

    const selectedRole = useWatch({ control, name: 'role' });

    useEffect(() => {
        dispatch(fetchRoles());
    }, [dispatch]);

    // Fetch modules when role changes
    useEffect(() => {
        if (selectedRole?.id) {
            dispatch(fetchModulesByRole(selectedRole.id));
        }
    }, [selectedRole, dispatch]);

    // Prefill form when subAdmin changes or dialog opens
    useEffect(() => {
        if (subAdmin) {
            reset({
                userName: subAdmin.name || '',
                role: subAdmin.role ? { id: subAdmin.role.id, label: subAdmin.role.roleName } : null,
                module: subAdmin.modules ? subAdmin.modules.map(m => ({ id: m.id, label: m.moduleName })) : [],
                mobile: subAdmin.mobile || '',
            });
        }
    }, [subAdmin, reset]);
    

    useEffect(() => {
        if (success) {
            enqueueSnackbar('Role updated successfully!', { variant: 'success' });
            reset();
            dispatch(resetAssignRoleState());
            onClose();
        }
        if (error) {
            enqueueSnackbar(error, { variant: 'error' });
            dispatch(resetAssignRoleState());
        }
    }, [success, error, enqueueSnackbar, dispatch, reset, onClose]);

    const onSubmit = (data) => {
        if (!subAdmin?.id) {
            enqueueSnackbar('No Sub Admin selected to update', { variant: 'error' });
            return;
        }
        const payload = {
            name: data.userName,
            mobile: data.mobile,
            role: data.role.id,
            modules: data.module.map(m => m.id),
        };

        dispatch(updateAssociateSubAdmin(subAdmin.id, payload));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogContent sx={{ padding: 0 }}>
                <div className="mx-auto bg-white rounded-lg shadow-sm">
                    <div className="flex items-center p-4 border-b border-gray-100 bg-[#F9F9FF]">
                        <IconButton onClick={() => onClose(false)} size="small">
                            <ArrowBack className="text-[#0000FF]" />
                        </IconButton>
                        <h1 className="text-lg font-medium text-gray-900 ml-2">Edit Assign Role</h1>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                        {/* User Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                            <Controller
                                name="userName"
                                control={control}
                                render={({ field }) => (
                                    <TextFieldComponent
                                        {...field}
                                        placeholder="Enter User Name"
                                        error={!!errors.userName}
                                        helperText={errors.userName?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Role Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role Type</label>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <AutocompleteFieldComponent
                                        {...field}
                                        options={roles.map((r) => ({ id: r.id, label: r.roleName }))}
                                        placeholder="Select Role"
                                        error={!!errors.role}
                                        helperText={errors.role?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Modules */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Define Module</label>
                            <Controller
                                name="module"
                                control={control}
                                render={({ field }) => (
                                    <AutocompleteFieldComponent
                                        {...field}
                                        options={modules.map((m) => ({ id: m.id, label: m.moduleName }))}
                                        placeholder="Select Module"
                                        isMulti
                                        error={!!errors.module}
                                        helperText={errors.module?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <Controller
                                name="mobile"
                                control={control}
                                render={({ field }) => (
                                    <TextFieldComponent
                                        {...field}
                                        placeholder="Enter Mobile No."
                                        error={!!errors.mobile}
                                        helperText={errors.mobile?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            startIcon={<PersonAddIcon />}
                            fullWidth
                            sx={{
                                background: '#0000FF',
                                color: 'white',
                                px: 4,
                                py: 1,
                                borderRadius: 2,
                                fontSize: '16px',
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': { background: '#0000FF' },
                            }}
                        >
                            Update Role
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditAssignRole;
