import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button
} from '@mui/material';
import {
    fetchEditRequests,
    approveEditRequest,
    rejectEditRequest
} from '../../../redux/managerequest/productRequestSlice';
import ActivateModal from './ActivateModal';
import DeleteModal from './DeleteModal';
import {useSnackbar} from 'notistack';
import {useNavigate} from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';

const ProductEditRequest = () => {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const dispatch = useDispatch();
    const {editRequests = [], loading = false} = useSelector((state) => state.productRequest || {});

    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        dispatch(fetchEditRequests());
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
        dispatch(approveEditRequest(selectedRequest?.id, enqueueSnackbar));
        setApproveModal(false);
    };

    // Reject
    const handleReject = (reason) => {
        dispatch(rejectEditRequest(selectedRequest?.id, reason, enqueueSnackbar));
        setRejectModal(false);
    };

    return (
        <>
            <TableContainer component={Paper}
                            sx={{
                                overflowX: 'auto',
                                borderRadius: 2,
                                '&::-webkit-scrollbar': {height: '8px'},
                                '&::-webkit-scrollbar-thumb': {backgroundColor: '#0000FF', borderRadius: '4px'},
                                '&::-webkit-scrollbar-track': {backgroundColor: '#f1f1f1'},
                            }}
            >
                <Table>
                    <TableHead sx={{background: '#F5F5FF'}}>
                        <TableRow>
                            {['Sno.', 'Product Id', 'Product Name', 'Description', 'Status', 'Requested by', 'Created At', 'Actions'].map((header) => (
                                <TableCell key={header} sx={{fontSize: '14px', color: '#0000FF'}}>{header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center"><CircularProgress/></TableCell></TableRow>
                        ) : editRequests.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No edit requests
                                found.</TableCell></TableRow>
                        ) : (
                            editRequests.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item?.masterProduct?.productId}</TableCell>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell>{item.productDescription}</TableCell>
                                    <TableCell>
                                        {item.isApproved
                                            ? 'Approved'
                                            : item.isRejected
                                                ? 'Rejected'
                                                : 'Pending'}
                                    </TableCell>

                                    <TableCell>{item.productManager?.name}</TableCell>
                                    <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                    {/* <TableCell>
                                        <IconButton
                                            onClick={() => navigate(`/viewproducteditdetail/${item.id}`)}
                                            color="primary"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell> */}

                                    <TableCell>
                                        {!(item.isApproved || item.isRejected) ? (
                                            <>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => openApproveModal(item)}
                                                    sx={{mr: 1, textTransform: 'none'}}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => openRejectModal(item)}
                                                    sx={{textTransform: 'none'}}
                                                >
                                                    Reject
                                                </Button>

                                            </>
                                        ) : (
                                            <span style={{color: '#888'}}>No Action</span>
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
                    selectedUser={{name: selectedRequest.productName}}
                    setActivateModal={setApproveModal}
                    updateUserStatus={() => handleApprove()}
                />
            )}

            {rejectModal && (
                <DeleteModal
                    selectedUser={{name: selectedRequest.productName}}
                    setDeleteModal={setRejectModal}
                    handleDelete={(reason) => handleReject(reason)}
                />
            )}

        </>
    );
};

export default ProductEditRequest;
