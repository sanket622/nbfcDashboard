import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Button
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { fetchDeleteRequests, handleDeleteRequest } from '../../../redux/managerequest/variantRequestSlice';
import DeleteModal from './DeleteModal';

const VariantDeleteRequest = () => {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const { deleteRequests, loading } = useSelector(state => state.variantRequest);

    const [rejectModal, setRejectModal] = useState(false);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        dispatch(fetchDeleteRequests());
    }, [dispatch]);

    const openReject = (item) => { setSelected(item); setRejectModal(true); };
    const openApprove = (item) => { setSelected(item); setRejectModal(false); dispatch(handleDeleteRequest(item.id, 'APPROVED', '', enqueueSnackbar)); };

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
                            {['Sno.','Variant Id','Variant name','Variant Type', 'Variant Code', 'Requested By', 'Created At','Status', 'Actions'].map(h => (
                                <TableCell key={h} sx={{ color: '#0000FF', fontSize: '14px' }}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : deleteRequests.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">No delete requests found.</TableCell></TableRow>
                        ) : deleteRequests.map((item, idx) => (
                            <TableRow key={item.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{item?.variantProduct?.variantId}</TableCell>
                                <TableCell>{item?.variantProduct?.variantName}</TableCell>
                                <TableCell>{item?.variantProduct?.variantType}</TableCell>
                                <TableCell>{item?.variantProduct?.variantCode}</TableCell>
                                <TableCell>{item.requestedBy?.name}</TableCell>
                                <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                <TableCell>{item?.status}</TableCell>
                                <TableCell>
                                    {item?.status === "PENDING" ? (
                                        <>
                                            <Button size="small" variant="contained" color="success" onClick={() => openApprove(item)} sx={{ textTransform: 'none', mr: 1 }}>Approve</Button>
                                            <Button size="small" variant="outlined" color="error" onClick={() => openReject(item)} sx={{ textTransform: 'none' }}>Reject</Button>
                                        </>
                                    ) : (
                                        <span style={{ color: '#888' }}>No Action</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {rejectModal && (
                <DeleteModal
                    selectedUser={{ name: selected.variantProduct?.variantCode }}
                    setDeleteModal={setRejectModal}
                    handleDelete={(reason) => dispatch(handleDeleteRequest(selected.id, 'REJECTED', reason, enqueueSnackbar))}
                />
            )}
        </>
    );
};

export default VariantDeleteRequest;
