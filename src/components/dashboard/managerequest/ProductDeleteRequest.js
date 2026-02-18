import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, CircularProgress, Grid, Typography, Divider, Box, Chip } from '@mui/material';
import axios from 'axios';

import CancelIcon from '@mui/icons-material/Cancel';
import { useDispatch, useSelector } from 'react-redux';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Paper } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { fetchDeleteRequests, handleDeleteRequest } from '../../../redux/managerequest/productRequestSlice';
import ActivateModal from './ActivateModal';
import DeleteModal from './DeleteModal';
import { useSnackbar } from 'notistack';
import ReusableTable from '../../subcompotents/ReusableTable';
import RemarkModal from './RemarkModal';

const ProductDeleteRequest = () => {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const { deleteRequests = [], loading = false, error } = useSelector(
        (state) => state.productRequest || {}
    );

    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [viewModal, setViewModal] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [requestDetails, setRequestDetails] = useState(null);
    const [remarkModalOpen, setRemarkModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const openViewDetails = async (row) => {
        try {
            setViewModal(true);
            setDetailsLoading(true);

            const token = localStorage.getItem('accessToken');

            const res = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/associate/masterProductDeleteRequest/getMasterProductDeleteRequestDetail/${row.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setRequestDetails(res.data.data);
        } catch (err) {
            enqueueSnackbar(err?.response?.data?.message, { variant: 'error' });
        } finally {
            setDetailsLoading(false);
        }
    };



    useEffect(() => {
        dispatch(fetchDeleteRequests());
    }, [dispatch]);

    const openApproveModal = (item) => {
        setSelectedRequest(item);
        setApproveModal(true);
    };

    const openRejectModal = (item) => {
        setSelectedRequest(item);
        setRejectModal(true);
    };

    const handleApprove = () => {
        dispatch(
            handleDeleteRequest(
                selectedRequest?.id,
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
                selectedRequest?.id,
                'REJECT',
                reason,
                enqueueSnackbar
            )
        );
        setRejectModal(false);
    };

    const columns = [
        {
            key: 'sno',
            label: 'Sno.',
            render: (_, __, index) => index + 1,
        },
        {
            key: 'productName',
            label: 'Product Name',
            render: (_, row) => row.masterProduct?.productName,
        },
        {
            key: 'productCode',
            label: 'Product Code',
            render: (_, row) => row.masterProduct?.productCode,
        },
        {
            key: 'description',
            label: 'Description',
            render: (_, row) => row.masterProduct?.productDescription,
        },
        {
            key: 'productId',
            label: 'Product ID',
            render: (_, row) => row.masterProduct?.productId,
        },
        {
            key: 'reason',
            label: 'Reason',
        },
        {
            key: 'status',
            label: 'Status',
        },
        {
            key: 'requestedBy',
            label: 'Requested By',
            render: (_, row) => `${row.requestedBy?.name} (${row.requestedBy?.email})`,
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
                row.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            sx={{ textTransform: 'none' }}
                            onClick={() => openApproveModal(row)}
                        >
                            Approve
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<CancelIcon />}
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
        }

    ];

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <ReusableTable
                title="Product Delete Requests"
                columns={columns}
                data={deleteRequests}
                loading={loading}
                error={error}
                showSearch={false}
                showFilter={false}
            />

            {approveModal && (
                <ActivateModal
                    selectedUser={{
                        name: selectedRequest?.masterProduct?.productName,
                    }}
                    setActivateModal={setApproveModal}
                    updateUserStatus={handleApprove}
                />
            )}

            {rejectModal && (
                <DeleteModal
                    selectedUser={{
                        name: selectedRequest?.masterProduct?.productName,
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
                    Product Delete Request Details
                </DialogTitle>

                <DialogContent dividers sx={{ bgcolor: '#fafafa', p: 3 }}>
                    {detailsLoading ? (
                        <Box display="flex" justifyContent="center" p={5}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        requestDetails && (
                            <>
                                <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={600} color="error" mb={2}>
                                        Request Information
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Request ID</Typography>
                                            <Typography fontWeight={500}>{requestDetails.id}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Request Status</Typography>
                                            <Chip label={requestDetails.status} color={requestDetails.status === 'PENDING' ? 'warning' : requestDetails.status === 'APPROVED' ? 'success' : 'error'} size="small" />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Master Product ID</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProductId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Requested By ID</Typography>
                                            <Typography fontWeight={500}>{requestDetails.requestedById}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Delete Reason</Typography>
                                            <Typography fontWeight={500} sx={{ bgcolor: '#fff3cd', p: 1.5, borderRadius: 1, mt: 0.5 }}>{requestDetails.reason}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Request Rejection Reason</Typography>
                                            <Typography fontWeight={500}>{requestDetails?.rejectionReason || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Created At</Typography>
                                            <Typography fontWeight={500}>{new Date(requestDetails.createdAt).toLocaleString()}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Updated At</Typography>
                                            <Typography fontWeight={500}>{new Date(requestDetails.updatedAt).toLocaleString()}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Request Deleted</Typography>
                                            <Typography fontWeight={500}>{requestDetails.isDeleted ? 'Yes' : 'No'}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
                                        Product Information
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product ID</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.productId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Name</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.productName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Code</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.productCode}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Version</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.versionId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Manager ID</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.productManagerId}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Description</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.productDescription}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Status</Typography>
                                            <Chip label={requestDetails.masterProduct?.status} color="primary" size="small" />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Rejection Reason</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.rejectionReason || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Created At</Typography>
                                            <Typography fontWeight={500}>{new Date(requestDetails.masterProduct?.createdAt).toLocaleString()}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Updated At</Typography>
                                            <Typography fontWeight={500}>{new Date(requestDetails.masterProduct?.updatedAt).toLocaleString()}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Deleted</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.isDeleted ? 'Yes' : 'No'}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
                                        Category & Type
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Category</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.productCategory?.categoryName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Category ID</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.productCategoryId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Loan Type</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.loanType?.name}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Loan Type ID</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.loanTypeId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Partner</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.productPartner?.name}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Partner ID</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?.partnerId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Variants Count</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?._count?.VariantProduct || 0}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Loan Applications</Typography>
                                            <Typography fontWeight={500}>{requestDetails.masterProduct?._count?.LoanApplication || 0}</Typography>
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
                                            <Typography fontWeight={500}>{requestDetails.requestedBy?.name}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Email</Typography>
                                            <Typography fontWeight={500}>{requestDetails.requestedBy?.email}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Mobile</Typography>
                                            <Typography fontWeight={500}>{requestDetails.requestedBy?.mobile}</Typography>
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

export default ProductDeleteRequest;
