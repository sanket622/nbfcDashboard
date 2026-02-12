import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, CircularProgress, Grid, Typography, Divider } from '@mui/material';
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
                <DialogTitle>Product Delete Request Details</DialogTitle>

                <DialogContent dividers>
                    {detailsLoading ? (
                        <CircularProgress />
                    ) : (
                        requestDetails && (
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography><b>Product Name:</b> {requestDetails.masterProduct?.productName}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography><b>Product Code:</b> {requestDetails.masterProduct?.productCode}</Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography><b>Category:</b> {requestDetails.masterProduct?.productCategory?.categoryName}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography><b>Loan Type:</b> {requestDetails.masterProduct?.loanType?.name}</Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography><b>Product Partner:</b> {requestDetails.masterProduct?.productPartner?.name}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography><b>Status:</b> {requestDetails.status}</Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography><b>Reason of Rejection:</b> {requestDetails?.rejectionReason || 'Not Available'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography><b>Product Code:</b> {requestDetails.masterProduct?.productCode}</Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography><b>Description:</b> {requestDetails.masterProduct?.productDescription}</Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography><b>Master Product Status:</b> {requestDetails.masterProduct?.status}</Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography><b>Delete Reason:</b> {requestDetails.reason}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Requested By:</b> {requestDetails.requestedBy?.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Email:</b> {requestDetails.requestedBy?.email}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Mobile:</b> {requestDetails.requestedBy?.mobile}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Created At:</b> {new Date(requestDetails.createdAt).toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>
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
