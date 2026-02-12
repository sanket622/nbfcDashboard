import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Button, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReusableTable from '../../subcompotents/ReusableTable';
import ActivateModal from './ActivateModal';
import DeleteModal from './DeleteModal';
import ChangesModal from './ChangesModal';

import {
    fetchEditRequests,
    approveEditRequest,
    rejectEditRequest,
} from '../../../redux/managerequest/variantRequestSlice';
import RemarkModal from './RemarkModal';

const VariantEditRequest = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { editRequests = [], loading = false, error } = useSelector(
        (state) => state.variantRequest || {}
    );

    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [viewModal, setViewModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [remarkModalOpen, setRemarkModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        dispatch(fetchEditRequests());
    }, [dispatch]);

    const openViewChanges = async (row) => {
        try {
            setViewModal(true);
            setDetailLoading(true);

            const accessToken = localStorage.getItem('accessToken');

            const res = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/associate/variantProductUpdateRequest/getVariantProductUpdateRequestDetail/${row.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const json = await res.json();
            setDetailData(json.data);
        } catch (err) {
            enqueueSnackbar('Failed to fetch change details', { variant: 'error' });
            setViewModal(false);
        } finally {
            setDetailLoading(false);
        }
    };


    /* ===================== ACTION HANDLERS ===================== */
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
            key: 'variantId',
            label: 'Variant Id',
            render: (_, row) => row?.variantProduct?.variantId,
        },
        {
            key: 'variantName',
            label: 'Variant Name',
            render: (_, row) => row?.variantName,
        },
        {
            key: 'variantCode',
            label: 'Variant Code',
            render: (_, row) => row?.variantProduct?.variantCode,
        },
        {
            key: 'variantType',
            label: 'Type',
            render: (_, row) => row?.productType,
        },
        {
            key: 'requestedBy',
            label: 'Requested By',
            render: (_, row) =>
                `${row.requestedBy?.name || '-'} (${row.requestedBy?.email || '-'})`,
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
            render: (_, row) =>
                row.isApproved
                    ? 'Approved'
                    : row.isRejected
                        ? 'Rejected'
                        : 'Pending',
        },

        {
            key: 'changes',
            label: 'View Proposed Changes',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'none' }}
                        onClick={() => openViewChanges(row)}
                    >
                        <VisibilityIcon />
                    </Button>

                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    {!(row.isApproved || row.isRejected) ? (
                        <>
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
                        </>
                    ) : (
                        <span style={{ color: '#888' }}>No Action</span>
                    )}
                </div>
            ),
        }

    ];

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <ReusableTable
                title="Variant Edit Requests"
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
                        name: selectedRequest?.variantName,
                    }}
                    setActivateModal={setApproveModal}
                    updateUserStatus={handleApprove}
                />
            )}

            {/* REJECT → Delete Modal */}
            {rejectModal && (
                <DeleteModal
                    selectedUser={{
                        name: selectedRequest?.variantName,
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

export default VariantEditRequest;
