import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    editRequests: [],
    deleteRequests: [],
    loading: false,
    error: null,
};

const variantRequestSlice = createSlice({
    name: 'variantRequest',
    initialState,
    reducers: {
        fetchStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchEditSuccess(state, action) {
            state.loading = false;
            state.editRequests = action.payload;
        },
        fetchDeleteSuccess(state, action) {
            state.loading = false;
            state.deleteRequests = action.payload;
        },
        fetchFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchStart,
    fetchEditSuccess,
    fetchDeleteSuccess,
    fetchFailure,
} = variantRequestSlice.actions;

const api = axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_URL}`,
});

// Fetch variant edit requests
export const fetchEditRequests = () => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        const res = await api.get(
            '/associate/variantProduct/getAllVariantProductUpdateRequests',
            { headers: { Authorization: `Bearer ${token}` } }
        );
        dispatch(fetchEditSuccess(res.data.data));
    } catch (err) {
        dispatch(fetchFailure(err.message));
    }
};

// Fetch variant delete requests
export const fetchDeleteRequests = () => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        const res = await api.get(
            '/associate/variantProduct/getVariantProductDeleteRequests',
            { headers: { Authorization: `Bearer ${token}` } }
        );
        dispatch(fetchDeleteSuccess(res.data.data));
    } catch (err) {
        dispatch(fetchFailure(err.message));
    }
};

// Approve variant edit
export const approveEditRequest = (id, enqueueSnackbar) => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        await api.patch(
            `/associate/variantProduct/approveVariantProductUpdateRequest/${id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        enqueueSnackbar('Edit request approved.', { variant: 'success' });
        dispatch(fetchEditRequests());
    } catch (err) {
        enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
        dispatch(fetchFailure(err.message));
    }
};

// Reject variant edit
export const rejectEditRequest = (id, reason, enqueueSnackbar) => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        await api.patch(
            '/associate/variantProduct/rejectVariantProductUpdateRequest',
            { requestId: id, reason },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        enqueueSnackbar('Edit request rejected.', { variant: 'success' });
        dispatch(fetchEditRequests());
    } catch (err) {
        enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
        dispatch(fetchFailure(err.message));
    }
};

// Approve/reject variant delete
export const handleDeleteRequest = (id, action, reason = '', enqueueSnackbar) => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        await api.patch(
            '/associate/variantProduct/handleVariantProductDeleteRequest',
            { requestId: id, action, reason },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        enqueueSnackbar(
            `Delete request ${action === 'APPROVED' ? 'approved' : 'rejected'}.`,
            { variant: 'success' }
        );
        dispatch(fetchDeleteRequests());
    } catch (err) {
        enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
        dispatch(fetchFailure(err.message));
    }
};

export default variantRequestSlice.reducer;
