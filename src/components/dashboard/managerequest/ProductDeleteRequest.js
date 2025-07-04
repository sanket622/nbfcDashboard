import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button
} from '@mui/material';
import { fetchDeleteRequests, handleDeleteRequest } from '../../../redux/managerequest/productRequestSlice';
import ActivateModal from './ActivateModal';
import DeleteModal from './DeleteModal';
import { useSnackbar } from 'notistack';

const ProductDeleteRequest = () => {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const { deleteRequests = [], loading = false } = useSelector((state) => state.productRequest || {});

    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

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
        dispatch(handleDeleteRequest(selectedRequest?.id, "APPROVED", "", enqueueSnackbar));
        setApproveModal(false);
    };

    const handleReject = (reason) => {
        dispatch(handleDeleteRequest(selectedRequest?.id, "REJECTED", reason, enqueueSnackbar));
        setRejectModal(false);
    };

    return (
        <>
            <TableContainer component={Paper}
                sx={{
                    overflowX: 'auto',
                    borderRadius: 2,
                    '&::-webkit-scrollbar': { height: '8px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#0000FF', borderRadius: '4px' },
                    '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
                }}
            >
                <Table>
                    <TableHead sx={{ background: '#F5F5FF' }}>
                        <TableRow>
                            {['Sno.', 'Product Name', 'Product Code', 'Description', 'Product ID', 'Reason', 'Status', 'Requested By','Created At', 'Actions'].map((header) => (
                                <TableCell key={header} sx={{ fontSize: '14px', color: '#0000FF' }}>{header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={9} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : deleteRequests.length === 0 ? (
                            <TableRow><TableCell colSpan={9} align="center">No delete requests found.</TableCell></TableRow>
                        ) : (
                            deleteRequests.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.masterProduct?.productName}</TableCell>
                                    <TableCell>{item.masterProduct?.productCode}</TableCell>
                                    <TableCell>{item.masterProduct?.productDescription}</TableCell>
                                    <TableCell>{item.masterProduct?.productId}</TableCell>
                                    <TableCell>{item.reason}</TableCell>
                                    <TableCell>{item.status}</TableCell>
                                    <TableCell>{item.requestedBy?.name}</TableCell>
                                    <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        {item.status === "PENDING" ? (
                                            <>
                                                <Button size="small" variant="contained" color="success" onClick={() => openApproveModal(item)} sx={{ textTransform: 'none', mr: 1 }}>Approve</Button>
                                                <Button size="small" variant="outlined" color="error" onClick={() => openRejectModal(item)} sx={{ textTransform: 'none' }}>Reject</Button>
                                            </>
                                        ) : (
                                            <span style={{ color: '#888' }}>No Action</span>
                                        )}
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {approveModal && (
                <ActivateModal
                    selectedUser={{ name: selectedRequest.masterProduct?.productName }}
                    setActivateModal={setApproveModal}
                    updateUserStatus={() => handleApprove()}
                />
            )}

            {rejectModal && (
                <DeleteModal
                    selectedUser={{ name: selectedRequest.productName }}
                    setDeleteModal={setRejectModal}
                    handleDelete={(reason) => handleReject(reason)}
                />
            )}

        </>
    );
};

export default ProductDeleteRequest;
