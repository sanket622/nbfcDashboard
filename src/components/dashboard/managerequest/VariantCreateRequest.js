import { useEffect, useState } from 'react';
import {
    Paper, Button, Dialog, DialogTitle, DialogContent,
    CircularProgress, Grid, Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from 'react-redux';
import ReusableTable from '../../subcompotents/ReusableTable';
import {
    fetchPendingVariantCreateRequests,
    fetchVariantCreateRequestDetails,
    handleVariantCreateRequestApproval,
} from '../../../redux/managerequest/variantCreateRequestSlice';
import ActivateModal from './ActivateModal';
import DeleteModal from './DeleteModal';

const VariantCreateRequest = () => {
    const dispatch = useDispatch();

    const {
        requests,
        loading,
        details,
        detailsLoading,
        page,
        limit,
        totalPages,
    } = useSelector((s) => s.variantCreateRequest);
    const { enqueueSnackbar } = useSnackbar();
    const [viewOpen, setViewOpen] = useState(false);
    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        dispatch(fetchPendingVariantCreateRequests({ page, limit }));
    }, [dispatch, page, limit]);


    const handleApprove = async () => {
        const res = await dispatch(
            handleVariantCreateRequestApproval({
                variantProductId: selectedRow.id,
                action: 'APPROVE',
            })
        );

        if (handleVariantCreateRequestApproval.fulfilled.match(res)) {
            enqueueSnackbar(res.payload.message, { variant: 'success' });
            setApproveModal(false);
            dispatch(fetchPendingVariantCreateRequests({ page, limit }));
        } else {
            enqueueSnackbar(res.payload, { variant: 'error' });
        }
    };
    const handleReject = async () => {
        const res = await dispatch(
            handleVariantCreateRequestApproval({
                variantProductId: selectedRow.id,
                action: 'REJECT',
            })
        );

        if (handleVariantCreateRequestApproval.fulfilled.match(res)) {
            enqueueSnackbar(res.payload.message, { variant: 'success' });
            setRejectModal(false);
            dispatch(fetchPendingVariantCreateRequests({ page, limit }));
        } else {
            enqueueSnackbar(res.payload, { variant: 'error' });
        }
    };
    const openChanges = async (row) => {
        setSelectedRow(row);
        setViewOpen(true);
        dispatch(fetchVariantCreateRequestDetails(row.id));
    };
    const formatLabel = (key) =>
        key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase());

    const renderValue = (value) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return null;
        return String(value);
    };
    const RenderSection = ({ title, data }) => {
        if (!data || typeof data !== 'object') return null;

        return (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>

                <Grid container spacing={2}>
                    {Object.entries(data).map(([key, value]) => {
                        if (typeof value === 'object') return null;

                        return (
                            <Grid item xs={6} key={key}>
                                <b>{formatLabel(key)}:</b> {renderValue(value)}
                            </Grid>
                        );
                    })}
                </Grid>
            </Paper>
        );
    };

    const columns = [
        { key: 'sno', label: 'Sno.', render: (_, __, i) => i + 1 },
        { key: 'variantName', label: 'Variant Name' },
        { key: 'variantId', label: 'Variant ID' },
        {
            key: 'productManager',
            label: 'Product Manager',
            render: (_, r) =>
                `${r.productManager?.name} (${r.productManager?.email})`,
        },

        {
            key: 'changes',
            label: 'View Proposed Changes',
            render: (_, row) => (
                <Button
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                    onClick={() => openChanges(row)}
                >
                    <VisibilityIcon />
                </Button>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => {
                            setSelectedRow(row);
                            setApproveModal(true);
                        }}
                    >
                        Approve
                    </Button>

                    <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                            setSelectedRow(row);
                            setRejectModal(true);
                        }}
                    >
                        Reject
                    </Button>
                </div>
            ),
        },
        // {
        //     key: 'actions',
        //     label: 'Actions',
        //     render: (_, r) => (
        //         <>
        //             <Button
        //                 size="small"
        //                 color="success"
        //                 startIcon={<CheckCircleIcon />}
        //                 onClick={() => openConfirm(r, 'APPROVE')}
        //             >
        //                 Approve
        //             </Button>
        //             <Button
        //                 size="small"
        //                 color="error"
        //                 startIcon={<CancelIcon />}
        //                 onClick={() => openConfirm(r, 'REJECT')}
        //             >
        //                 Reject
        //             </Button>
        //         </>
        //     ),
        // },
    ];

    return (
        <Paper sx={{ p: 3 }}>
            <ReusableTable
                title="Variant Create Requests"
                columns={columns}
                data={requests}
                loading={loading}
                totalPages={totalPages}
            />

            {/* VIEW DETAILS */}
            <Dialog
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Variant Request Details</DialogTitle>

                <DialogContent dividers sx={{ backgroundColor: '#fafafa' }}>
                    {detailsLoading ? (
                        <CircularProgress />
                    ) : (
                        details && (
                            <>
                                <RenderSection title="Basic Details" data={details} />

                                <RenderSection
                                    title="Financial Parameters"
                                    data={details.VariantProductParameter}
                                />

                                <RenderSection
                                    title="Other Charges"
                                    data={details.VariantProductOtherCharges}
                                />

                                <RenderSection
                                    title="Repayment Details"
                                    data={details.VariantProductRepayment}
                                />
                            </>
                        )
                    )}
                </DialogContent>
            </Dialog>

            {/* APPROVE / REJECT */}
            {approveModal && (
                <ActivateModal
                    selectedUser={{ name: selectedRow?.variantName }}
                    setActivateModal={setApproveModal}
                    updateUserStatus={handleApprove}
                />
            )}
            {rejectModal && (
                <DeleteModal
                    selectedUser={{ name: selectedRow?.variantName }}
                    setDeleteModal={setRejectModal}
                    handleDelete={handleReject}
                />
            )}

        </Paper>
    );
};

export default VariantCreateRequest;