import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    fetchEditRequests,
    approveEditRequest,
    rejectEditRequest
} from '../../../redux/managerequest/productRequestSlice';
import ActivateModal from './ActivateModal';
import DeleteModal from './DeleteModal';
import { useSnackbar } from 'notistack';
import ReusableTable from '../../subcompotents/ReusableTable';
import ChangesModal from './ChangesModal';
import { normalizeProductChanges } from '../../../utils/normalizeProductChanges';
import RemarkModal from './RemarkModal';

const ProductEditRequest = () => {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const [viewModal, setViewModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [remarkModalOpen, setRemarkModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const { editRequests = [], loading = false, error } = useSelector(
        (state) => state.productRequest || {}
    );

    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        dispatch(fetchEditRequests());
    }, [dispatch]);

    /* ===================== ACTION HANDLERS ===================== */
    const openViewChanges = async (row) => {
        try {
            setViewModal(true);
            setDetailLoading(true);

            const token = localStorage.getItem('accessToken');

            const res = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/associate/masterProductUpdateRequest/getMasterProductUpdateRequestDetail/${row.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const json = await res.json();
            const normalized = normalizeProductChanges(json.data);
            setDetailData(normalized);
        } catch {
            enqueueSnackbar('Failed to fetch changes', { variant: 'error' });
            setViewModal(false);
        } finally {
            setDetailLoading(false);
        }
    };

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
            approveEditRequest(
                selectedRequest?.id,
                enqueueSnackbar
            )
        );
        setApproveModal(false);
    };

    const handleReject = (reason) => {
        dispatch(
            rejectEditRequest(
                selectedRequest?.id,
                reason,
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
            key: 'productId',
            label: 'Product Id',
            render: (_, row) => row?.masterProduct?.productId,
        },
        {
            key: 'masterproductName',
            label: 'Master Product Name',
            render: (_, row) => row?.masterProduct?.productName,
        },
        {
            key: 'masterproductcode',
            label: 'Master Product Code',
            render: (_, row) => row?.masterProduct?.productCode,
        },
        {
            key: 'productName',
            label: 'Product Name',
            render: (_, row) => row?.productName,
        },
        {
            key: 'productDescription',
            label: 'Description',
            render: (_, row) => row?.productDescription,
        },
        {
            key: 'status',
            label: 'Status',
            render: (_, row) =>
                row.isApproved
                    ? 'Approved'
                    : row.isRejected
                        ? 'Rejected'
                        : 'Pending',
        },
        {
            key: 'requestedBy',
            label: 'Requested By',
            render: (_, row) =>
                `${row.requestedBy?.name} (${row.requestedBy?.email})`,
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
            key: 'changes',
            label: 'View Proposed Changes',
            render: (_, row) => (
                <Button
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                    onClick={() => openViewChanges(row)}
                >
                    <VisibilityIcon />
                </Button>
            ),
        },

        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) =>
                !(row.isApproved || row.isRejected) ? (
                    <div style={{ display: 'flex', gap: 8 }}>
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
        },
    ];

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <ReusableTable
                title="Product Edit Requests"
                columns={columns}
                data={editRequests}
                loading={loading}
                error={error}
                showSearch={false}
                showFilter={false}
            />

            {/* APPROVE → Activate Modal */}
            {approveModal && (
                <ActivateModal
                    selectedUser={{
                        name: selectedRequest?.masterProduct?.productName,
                    }}
                    setActivateModal={setApproveModal}
                    updateUserStatus={handleApprove}
                />
            )}

            {/* REJECT → Delete Modal (Reason Required) */}
            {rejectModal && (
                <DeleteModal
                    selectedUser={{
                        name: selectedRequest?.masterProduct?.productName,
                    }}
                    setDeleteModal={setRejectModal}
                    handleDelete={handleReject}
                />
            )}

            {viewModal && (
                <ChangesModal
                    open={viewModal}
                    onClose={() => setViewModal(false)}
                    data={detailData}
                    loading={detailLoading}
                />
            )}

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

export default ProductEditRequest;
