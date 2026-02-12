import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Grid, Typography, CircularProgress, Divider } from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Paper } from '@mui/material';
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
                <DialogTitle>Variant Delete Request Details</DialogTitle>



                <DialogContent dividers>
                    {detailsLoading ? (
                        <CircularProgress />
                    ) : (
                        variantDetails && (
                            <Grid container spacing={2}>
                                {/* Variant Info */}
                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Variant Name:</b>{' '}
                                        {variantDetails.variantProduct?.variantName}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Variant Code:</b>{' '}
                                        {variantDetails.variantProduct?.variantCode}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Variant ID:</b>{' '}
                                        {variantDetails.variantProduct?.variantId}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Variant Type:</b>{' '}
                                        {variantDetails.variantProduct?.variantType}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Remark:</b>{' '}
                                        {variantDetails.variantProduct?.remark}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Master Product Name:</b>{' '}
                                        {variantDetails.variantProduct?.masterProduct?.productName}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Master Product Code:</b>{' '}
                                        {variantDetails.variantProduct?.masterProduct?.productCode}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Product Type:</b>{' '}
                                        {variantDetails.variantProduct?.productType}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Status:</b> {variantDetails.status}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Delete Reason:</b> {variantDetails.reason}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Rejection Reason:</b>{' '}
                                        {variantDetails.rejectionReason || 'Not Available'}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>


                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Requested By:</b>{' '}
                                        {variantDetails.requestedBy?.name}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Email:</b>{' '}
                                        {variantDetails.requestedBy?.email}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Mobile:</b>{' '}
                                        {variantDetails.requestedBy?.mobile}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography>
                                        <b>Created At:</b>{' '}
                                        {variantDetails.createdAt
                                            ? new Date(
                                                variantDetails.createdAt
                                            ).toLocaleString()
                                            : '-'}
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

export default VariantDeleteRequest;
