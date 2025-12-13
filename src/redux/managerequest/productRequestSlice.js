import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    editRequests: [],
    deleteRequests: [],
    loading: false,
    error: null,
    productDetails: null,
};

const productRequestSlice = createSlice({
    name: 'productRequest',
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
        setProductDetails(state, action) {
            state.loading = false;
            state.productDetails = action.payload;
        },

    },
});

export const {
    fetchStart,
    fetchEditSuccess,
    fetchDeleteSuccess,
    fetchFailure,
      setProductDetails,
} = productRequestSlice.actions;

export const fetchEditRequests = () => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/associate/masterProduct/getAllMasterProductUpdateRequests`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(fetchEditSuccess(res.data.data));
    } catch (err) {
        dispatch(fetchFailure(err.message));
    }
};

export const fetchDeleteRequests = () => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/associate/masterProduct/getMasterProductDeleteRequests`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(fetchDeleteSuccess(res.data.data));
    } catch (err) {
        dispatch(fetchFailure(err.message));
    }
};

// Approve Edit Request
export const approveEditRequest = (id, enqueueSnackbar) => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        await axios.patch(
            `${process.env.REACT_APP_BACKEND_URL}/associate/masterProduct/approveMasterProductUpdateRequest/${id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        enqueueSnackbar('Edit request approved successfully.', { variant: 'success' });
        dispatch(fetchEditRequests());
    } catch (err) {
        enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
        dispatch(fetchFailure(err.message));
    }
};

// Reject Edit Request
export const rejectEditRequest = (id, reason, enqueueSnackbar) => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        await axios.patch(
            `${process.env.REACT_APP_BACKEND_URL}/associate/masterProduct/rejectMasterProductUpdateRequest/${id}`,
            { reason },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        enqueueSnackbar('Edit request rejected.', { variant: 'success' });
        dispatch(fetchEditRequests());
    } catch (err) {
        enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
        dispatch(fetchFailure(err.message));
    }
};

// Handle Delete Request
export const handleDeleteRequest = (requestId, action, reason = '', enqueueSnackbar) => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        await axios.patch(
            `${process.env.REACT_APP_BACKEND_URL}/associate/masterProduct/handleMasterProductDeleteRequest`,
            { requestId, action, reason },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const msg = action === 'APPROVED' ? 'Delete request approved.' : 'Delete request rejected.';
        enqueueSnackbar(msg, { variant: action === 'APPROVED' ? 'success' : 'success' });
        dispatch(fetchDeleteRequests());
    } catch (err) {
        enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
        dispatch(fetchFailure(err.message));
    }
};

export const fetchEditRequestDetails = (id) => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/associate/masterProduct/getMasterProductUpdateRequestDetails/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        dispatch(setProductDetails(res.data.data));
    } catch (err) {
        dispatch(fetchFailure(err.message));
    }
};



export default productRequestSlice.reducer;
