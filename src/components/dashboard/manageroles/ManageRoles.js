import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, IconButton, Pagination, PaginationItem } from '@mui/material';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    CircularProgress,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignRoleDialog from './AssignRoleDialog';
import EditAssignRole from './EditAssignRole';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAssociateSubAdmin, fetchAssociateSubAdmins, fetchModulesByRole, fetchRoles, resetAssignRoleState, updateAssociateSubAdmin, updateAssociateSubAdminStatus } from '../../../redux/managerole/roleModuleSlice';
import ReusableTable from '../../../components/subcompotents/ReusableTable';
import EditIcon from '@mui/icons-material/Edit';
import ActivateModal from './ActivateModal';
import DeactivateModal from './DeactivateModal';
import DeleteModal from './DeleteModal';
import { useSnackbar } from 'notistack';
import { Delete } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const ChevronLeftIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const ChevronRightIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const ManageRoles = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [assignRoleOpen, setAssignRoleOpen] = useState(false);
    const [editAssignRoleOpen, setEditAssignRoleOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deactivateModal, setDeactivateModal] = useState(false);
    const [activateModal, setActivateModal] = useState(false);
    const [editForm, setEditForm] = useState({
        userName: '',
        role: null,
        module: [],
        mobile: ''
    });

    const { enqueueSnackbar } = useSnackbar();

    const dispatch = useDispatch();
    const { associateSubAdmins, loading, error, totalCount, totalPages, roles, modules, success } = useSelector((state) => state.roleModule);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        dispatch(fetchAssociateSubAdmins(page, rowsPerPage));
    }, [dispatch, page, rowsPerPage]);

    useEffect(() => {
        if (success) {
            dispatch(fetchAssociateSubAdmins(page, rowsPerPage));
        }
    }, [success, dispatch]);

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setDeleteModal(true);
    };

    const openDeactivateModal = (user) => {
        setSelectedUser(user);
        setDeactivateModal(true);
    };

    const openActivateModal = (user) => {
        setSelectedUser(user);
        setActivateModal(true);
    };
    const schema = yup.object().shape({
        userName: yup.string().required('User name is required'),
        role: yup.object().nullable().required('Role is required'),
        module: yup.array().min(1, 'At least one module is required'),
        mobile: yup.string().required('Mobile is required'),
    });

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            userName: '',
            role: null,
            module: [],
            mobile: '',
        },
    });

    const onEditFormSubmit = async (data) => {
        if (!selectedEmployee?.id) {
            enqueueSnackbar('No Sub Admin selected', { variant: 'error' });
            return;
        }
        const payload = {
            name: data.userName,
            mobile: data.mobile,
            role: data.role.id,
            modules: data.module.map((m) => m.id),
        };
        dispatch(updateAssociateSubAdmin(selectedEmployee.id, payload, enqueueSnackbar, () => {
            setEditAssignRoleOpen(false)
        }));
    };

    const handleDelete = async () => {
        try {
            const result = await dispatch(deleteAssociateSubAdmin(selectedUser.id));

            if (result?.success === true) {
                enqueueSnackbar('User deleted successfully', { variant: 'success' });
            } else {
                throw new Error(result.payload || 'Failed to delete user');
            }
        } catch (error) {
            enqueueSnackbar(error.message || 'Failed to delete user', { variant: 'error' });
        } finally {
            setDeleteModal(false);
        }
    };

    const updateUserStatus = async (id, isActive) => {
        try {
            const result = await dispatch(updateAssociateSubAdminStatus(id, isActive));

            if (result?.success === true) {
                enqueueSnackbar(`User ${isActive ? 'activated' : 'deactivated'} successfully`, {
                    variant: 'success',
                });
            } else {
                throw new Error(result?.payload || 'Failed to update user status');
            }
        } catch (error) {
            enqueueSnackbar(error?.message || 'Failed to update user status', { variant: 'error' });
        }
    };

    useEffect(() => {
        dispatch(fetchRoles());
    }, [dispatch]);

    const selectedRole = watch('role');


    useEffect(() => {
        if (selectedRole?.id) {
            dispatch(fetchModulesByRole(selectedRole.id));
        }
    }, [selectedRole?.id, dispatch]);

    const columns = [
        {
            key: 'sno',
            label: 'Sno.',
            render: (_, __, index) =>
                (page - 1) * rowsPerPage + index + 1,
        },
        {
            key: 'name',
            label: 'Name',
        },
        {
            key: 'email',
            label: 'Email',
        },
        {
            key: 'mobile',
            label: 'Phone Number',
        },
        {
            key: 'status',
            label: 'Status',
            render: (_, row) => (
                <button
                    onClick={() =>
                        row.isActive
                            ? openDeactivateModal(row)
                            : openActivateModal(row)
                    }
                    style={{
                        background: row.isActive ? '#5577FD' : '#22C900',
                        color: 'white',
                        padding: '4px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                    }}
                >
                    {row.isActive ? 'Deactivate' : 'Activate'}
                </button>
            ),
        },
        {
            key: 'edit',
            label: 'Edit',
            render: (_, row) => (
                <IconButton
                    sx={{ color: '#0000FF', padding: '6px' }}
                    onClick={() => {
                        setSelectedEmployee(row);
                        reset({
                            userName: row.name || '',
                            role: row.role
                                ? { id: row.role.id, label: row.role.roleName }
                                : null,
                            module:
                                row.modules?.map((m) => ({
                                    id: m.id,
                                    label: m.moduleName,
                                })) || [],
                            mobile: row.mobile || '',
                        });
                        setEditAssignRoleOpen(true);
                    }}
                >
                    <EditIcon />
                </IconButton>
            ),
        },
        {
            key: 'delete',
            label: 'Delete',
            render: (_, row) => (
                <IconButton
                    color="error"
                    size="small"
                    onClick={() => openDeleteModal(row)}
                >
                    <Delete />
                </IconButton>
            ),
        },
    ];
    const headerActions = (
        <Button
            startIcon={<PersonAddIcon />}
            onClick={() => {
                console.log('Add Roles clicked');
                dispatch(resetAssignRoleState());
                setAssignRoleOpen(true);
            }}
            sx={{
                background: '#0000FF',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { background: '#0000FF' },
            }}
        >
            Add Roles
        </Button>
    );


    return (

        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <ReusableTable
                title="Manage Roles"
                headerActions={headerActions}
                columns={columns}
                data={associateSubAdmins}
                loading={loading}
                error={error}
                page={page}
                rowsPerPage={rowsPerPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={handleChangePage}
            />


            {assignRoleOpen && (
                <AssignRoleDialog
                    open={assignRoleOpen}
                    onClose={() => setAssignRoleOpen(false)}
                    onSuccess={() => {
                        dispatch(fetchAssociateSubAdmins(page, rowsPerPage));
                    }}
                />
            )}


            {editAssignRoleOpen && (
                <EditAssignRole
                    open={editAssignRoleOpen}
                    onClose={() => setEditAssignRoleOpen(false)}
                    control={control}
                    errors={errors}
                    onSubmit={handleSubmit(onEditFormSubmit)}
                    roles={roles}
                    modules={modules}
                />
            )}

            {activateModal && (
                <ActivateModal
                    selectedUser={selectedUser}
                    setActivateModal={setActivateModal}
                    updateUserStatus={updateUserStatus}
                    open={activateModal}
                />
            )}

            {deactivateModal && (
                <DeactivateModal
                    selectedUser={selectedUser}
                    setDeactivateModal={setDeactivateModal}
                    updateUserStatus={updateUserStatus}
                    open={deactivateModal}
                />
            )}

            {deleteModal && (
                <DeleteModal
                    selectedUser={selectedUser}
                    handleDelete={handleDelete}
                    setDeleteModal={setDeleteModal}
                    open={deleteModal}
                />
            )}
        </Paper>


    );
};

export default ManageRoles;
