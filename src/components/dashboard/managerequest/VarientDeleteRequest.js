import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Grid, Typography, CircularProgress, Divider, Box, Chip, Paper, Button } from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import ReusableTable from '../../subcompotents/ReusableTable';
import ActivateModal from './ActivateModal';
import DeleteModal from './DeleteModal';
import {
    fetchDeleteRequests,
    handleDeleteRequest,
} from '../../../redux/managerequest/variantRequestSlice';
import RemarkModal from './RemarkModal';

const VariantDeleteRequest = () => {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();

    const { deleteRequests = [], loading = false } = useSelector(
        (state) => state.variantRequest || {}
    );

    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selected, setSelected] = useState(null);

    const [viewModal, setViewModal] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [variantDetails, setVariantDetails] = useState(null);
    const [remarkModalOpen, setRemarkModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        dispatch(fetchDeleteRequests());
    }, [dispatch]);

    /* ===================== ACTION HANDLERS ===================== */

    const openViewDetails = async (row) => {
        try {
            setViewModal(true);
            setDetailsLoading(true);

            const token = localStorage.getItem('accessToken');

            const res = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/associate/variantProductDeleteRequest/getVariantProductDeleteRequestDetail/${row.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setVariantDetails(res.data.data);


        } catch (err) {
            enqueueSnackbar(err?.response?.data?.message, { variant: 'error' });
        } finally {
            setDetailsLoading(false);
        }
    };

    const openApproveModal = (item) => {
        setSelected(item);
        setApproveModal(true);
    };

    const openRejectModal = (item) => {
        setSelected(item);
        setRejectModal(true);
    };

    const handleApprove = () => {
        dispatch(
            handleDeleteRequest(
                selected?.id,
                'APPROVE',
                '',
                enqueueSnackbar
            )
        );
        setApproveModal(false);
    };

    const handleReject = (reason) => {
        dispatch(
            handleDeleteRequest(
                selected?.id,
                'REJECT',
                reason || '',
                enqueueSnackbar
            )
        );
        setRejectModal(false);
    };

    /* ===================== TABLE COLUMNS ===================== */
    const columns = [
        {
            key: 'sno',
            label: 'Sno.',
            render: (_, __, index) => index + 1,
        },
        {
            key: 'variantId',
            label: 'Variant Id',
            render: (_, row) => row?.variantProduct?.variantId,
        },
        {
            key: 'variantName',
            label: 'Variant Name',
            render: (_, row) => row?.variantProduct?.variantName,
        },
        {
            key: 'variantType',
            label: 'Variant Type',
            render: (_, row) => row?.variantProduct?.variantType,
        },
        {
            key: 'variantCode',
            label: 'Variant Code',
            render: (_, row) => row?.variantProduct?.variantCode,
        },
        {
            key: 'requestedBy',
            label: 'Requested By',
            render: (_, row) => row?.requestedBy?.name,
        },
        {
            key: 'createdAt',
            label: 'Created At',
            render: (_, row) =>
                row.createdAt
                    ? new Date(row.createdAt).toLocaleString()
                    : '-',
        },
        {
            key: 'status',
            label: 'Status',
            render: (_, row) => row?.status,
        },
        {
            key: 'viewdetails',
            label: 'View Details',
            render: (_, row) => (
                <Button
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                    onClick={() => openViewDetails(row)}
                >
                    <VisibilityIcon />
                </Button>
            ),
        },

        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) =>
                row?.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            color="success"
                            sx={{ textTransform: 'none' }}
                            onClick={() => openApproveModal(row)}
                        >
                            Approve
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<CancelIcon />}
                            color="error"
                            sx={{ textTransform: 'none' }}
                            onClick={() => openRejectModal(row)}
                        >
                            Reject
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                                setSelectedRow(row);
                                setRemarkModalOpen(true);
                            }}
                        >
                            Remark
                        </Button>
                    </div>
                ) : (
                    <span style={{ color: '#888' }}>No Action</span>
                ),
        },
    ];


    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <ReusableTable
                title="Variant Delete Requests"
                columns={columns}
                data={deleteRequests}
                loading={loading}
            />

            {/* APPROVE MODAL */}
            {approveModal && (
                <ActivateModal
                    selectedUser={{
                        name: selected?.variantProduct?.variantName,
                    }}
                    setActivateModal={setApproveModal}
                    updateUserStatus={handleApprove}
                />
            )}

            {/* REJECT MODAL */}
            {rejectModal && (
                <DeleteModal
                    selectedUser={{
                        name: selected?.variantProduct?.variantName,
                    }}
                    setDeleteModal={setRejectModal}
                    handleDelete={handleReject}
                />
            )}

            <Dialog
                open={viewModal}
                onClose={() => setViewModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600 }}>
                    Variant Delete Request Details
                </DialogTitle>

                <DialogContent dividers sx={{ bgcolor: '#fafafa', p: 3 }}>
                    {detailsLoading ? (
                        <Box display="flex" justifyContent="center" p={5}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        variantDetails && (
                            <>
                                <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={600} color="error" mb={2}>
                                        Request Information
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Status</Typography>
                                            <Chip label={variantDetails.status} color={variantDetails.status === 'PENDING' ? 'warning' : variantDetails.status === 'APPROVED' ? 'success' : 'error'} size="small" />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Created At</Typography>
                                            <Typography fontWeight={500}>{variantDetails.createdAt ? new Date(variantDetails.createdAt).toLocaleString() : '-'}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Delete Reason</Typography>
                                            <Typography fontWeight={500} sx={{ bgcolor: '#fff3cd', p: 1.5, borderRadius: 1, mt: 0.5 }}>{variantDetails.reason}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Rejection Reason</Typography>
                                            <Typography fontWeight={500}>{variantDetails.rejectionReason || 'N/A'}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
                                        Variant Information
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Variant ID</Typography>
                                            <Typography fontWeight={500}>{variantDetails.variantProduct?.variantId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Variant Name</Typography>
                                            <Typography fontWeight={500}>{variantDetails.variantProduct?.variantName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Variant Code</Typography>
                                            <Typography fontWeight={500}>{variantDetails.variantProduct?.variantCode}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Variant Type</Typography>
                                            <Typography fontWeight={500}>{variantDetails.variantProduct?.variantType}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Type</Typography>
                                            <Typography fontWeight={500}>{variantDetails.variantProduct?.productType}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Remark</Typography>
                                            <Typography fontWeight={500}>{variantDetails.variantProduct?.remark}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
                                        Master Product
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Name</Typography>
                                            <Typography fontWeight={500}>{variantDetails.variantProduct?.masterProduct?.productName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Code</Typography>
                                            <Typography fontWeight={500}>{variantDetails.variantProduct?.masterProduct?.productCode}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
                                        Requested By
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Name</Typography>
                                            <Typography fontWeight={500}>{variantDetails.requestedBy?.name}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Email</Typography>
                                            <Typography fontWeight={500}>{variantDetails.requestedBy?.email}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Mobile</Typography>
                                            <Typography fontWeight={500}>{variantDetails.requestedBy?.mobile}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </>
                        )
                    )}
                </DialogContent>
            </Dialog>

            {remarkModalOpen && (
                <RemarkModal
                    open={remarkModalOpen}
                    onClose={() => setRemarkModalOpen(false)}
                    requestId={selectedRow?.id}
                />
            )}


        </Paper>
    );
};

export default VariantDeleteRequest;
