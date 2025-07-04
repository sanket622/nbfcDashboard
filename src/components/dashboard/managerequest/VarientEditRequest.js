import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Button
} from '@mui/material';
import {useSnackbar} from 'notistack';
import {
    fetchEditRequests, approveEditRequest, rejectEditRequest
} from '../../../redux/managerequest/variantRequestSlice';
import ActivateModal from './ActivateModal'; // reuse or copy your modal
import DeleteModal from './DeleteModal';

const VariantEditRequest = () => {
    const {enqueueSnackbar} = useSnackbar();
    const dispatch = useDispatch();
    const {editRequests, loading} = useSelector(state => state.variantRequest);

    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        dispatch(fetchEditRequests());
    }, [dispatch]);

    const openApprove = (item) => {
        setSelected(item);
        setApproveModal(true);
    };
    const openReject = (item) => {
        setSelected(item);
        setRejectModal(true);
    };

    const handleApprove = () => {
        dispatch(approveEditRequest(selected.id, enqueueSnackbar));
        setApproveModal(false);
    };

    const handleReject = (reason) => {
        dispatch(rejectEditRequest(selected.id, reason, enqueueSnackbar));
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
                            {['Sno.', 'Variant Id', 'Variant Name', 'Variant Code', 'Type', 'Requested by', 'Created At', 'Status', 'Actions'].map(h => (
                                <TableCell key={h} sx={{color: '#0000FF', fontSize: '14px'}}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center"><CircularProgress/></TableCell></TableRow>
                        ) : editRequests.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No edit requests
                                found.</TableCell></TableRow>
                        ) : editRequests.map((item, idx) => (
                            <TableRow key={item.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{item.variantProduct?.variantId}</TableCell>
                                <TableCell>{item.variantName}</TableCell>
                                <TableCell>{item.variantProduct?.variantCode}</TableCell>
                                <TableCell>{item.variantType}</TableCell>
                                <TableCell>{item.productManager?.name}</TableCell>
                                <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    {item.isApproved
                                        ? 'Approved'
                                        : item.isRejected
                                            ? 'Rejected'
                                            : 'Pending'}
                                </TableCell>
                                <TableCell>
                                    {!(item.isApproved || item.isRejected) ? (
                                        <>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                onClick={() => openApprove(item)}
                                                sx={{mr: 1, textTransform: 'none'}}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => openReject(item)}
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
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {approveModal && (
                <ActivateModal
                    selectedUser={{name: selected.variantName}}
                    setActivateModal={setApproveModal}
                    updateUserStatus={handleApprove}
                />
            )}
            {rejectModal && (
                <DeleteModal
                    selectedUser={{name: selected.variantName}}
                    setDeleteModal={setRejectModal}
                    handleDelete={handleReject}
                />
            )}
        </>
    );
};

export default VariantEditRequest;
