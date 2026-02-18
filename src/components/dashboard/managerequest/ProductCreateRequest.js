import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    CircularProgress,
    Grid,
    Typography,
    Divider,
    Button,
    Paper,
    Box,
    Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import ReusableTable from '../../subcompotents/ReusableTable';
import { fetchCreateRequests, handleCreateRequestApproval } from '../../../redux/managerequest/productRequestSlice';
import RemarkModal from './RemarkModal';

const ProductCreateRequest = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { createRequests = [], loading = false, error } = useSelector(
        (state) => state.productRequest
    );

    const [viewModal, setViewModal] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [requestDetails, setRequestDetails] = useState(null);
    const [confirmModal, setConfirmModal] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [remarkModalOpen, setRemarkModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        dispatch(fetchCreateRequests());
    }, [dispatch]);

    const openConfirm = (row, action) => {
        setSelectedRequest(row);
        setActionType(action);
        setConfirmModal(true);
    };

    const handleConfirmAction = () => {
        dispatch(
            handleCreateRequestApproval(
                selectedRequest.id,
                actionType,
                enqueueSnackbar
            )
        );
        setConfirmModal(false);
    };


    const openViewDetails = async (row) => {
        try {
            setViewModal(true);
            setDetailsLoading(true);

            const token = localStorage.getItem('accessToken');

            const res = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/associate/masterProductCreateRequest/getPendingMasterProductDetailForAssociate/${row.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRequestDetails(res.data.data);
        } catch (err) {
            enqueueSnackbar(
                err?.response?.data?.message || 'Failed to fetch details',
                { variant: 'error' }
            );
        } finally {
            setDetailsLoading(false);
        }
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
        },
        {
            key: 'productCode',
            label: 'Product Code',
        },
        {
            key: 'productId',
            label: 'Product ID',
        },
        {
            key: 'createdAt',
            label: 'Created At',
            render: (_, row) =>
                row.createdAt ? new Date(row.createdAt).toLocaleString() : '-',
        },
        {
            key: 'productManager',
            label: 'Product Manager',
            render: (_, row) =>
                `${row.productManager?.name} (${row.productManager?.email})`,
        },
        {
            key: 'view',
            label: 'View',
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
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        sx={{ textTransform: 'none' }}
                        onClick={() => openConfirm(row, 'APPROVE')}
                    >
                        Approve
                    </Button>

                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        sx={{ textTransform: 'none' }}
                        onClick={() => openConfirm(row, 'REJECT')}
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
            ),
        },

    ];

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <ReusableTable
                title="Product Create Requests"
                columns={columns}
                data={createRequests}
                loading={loading}
                error={error}
                showSearch={false}
                showFilter={false}
            />

            {/* VIEW DETAILS MODAL */}
            <Dialog
                open={viewModal}
                onClose={() => setViewModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 600 }}>
                    Product Create Request Details
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
                                    <Typography variant="h6" fontWeight={600} color="success" mb={2}>
                                        Product Information
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product ID</Typography>
                                            <Typography fontWeight={500}>{requestDetails.productId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Name</Typography>
                                            <Typography fontWeight={500}>{requestDetails.productName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Product Code</Typography>
                                            <Typography fontWeight={500}>{requestDetails.productCode}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Version</Typography>
                                            <Typography fontWeight={500}>{requestDetails.versionId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Status</Typography>
                                            <Chip label={requestDetails.status} color="primary" size="small" />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Description</Typography>
                                            <Typography fontWeight={500}>{requestDetails.productDescription}</Typography>
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
                                            <Typography fontWeight={500}>{requestDetails.productCategory?.categoryName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Loan Type</Typography>
                                            <Typography fontWeight={500}>{requestDetails.loanType?.name}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Partner</Typography>
                                            <Typography fontWeight={500}>{requestDetails.productPartner?.name}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
                                        Timestamps
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Created At</Typography>
                                            <Typography fontWeight={500}>{new Date(requestDetails.createdAt).toLocaleString()}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Updated At</Typography>
                                            <Typography fontWeight={500}>{new Date(requestDetails.updatedAt).toLocaleString()}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </>
                        )
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={confirmModal}
                onClose={() => setConfirmModal(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    {actionType === 'APPROVE'
                        ? 'Approve Product Creation'
                        : 'Reject Product Creation'}
                </DialogTitle>

                <DialogContent>
                    <Typography>
                        Are you sure you want to{' '}
                        <b>{actionType?.toLowerCase()}</b> this product creation request?
                    </Typography>
                </DialogContent>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, gap: 8 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setConfirmModal(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color={actionType === 'APPROVE' ? 'success' : 'error'}
                        onClick={handleConfirmAction}
                    >
                        Confirm
                    </Button>
                </div>
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

export default ProductCreateRequest;
