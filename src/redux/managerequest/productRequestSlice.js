import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    editRequests: [],
    deleteRequests: [],
    createRequests: [],
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
        fetchCreateSuccess(state, action) {
            state.loading = false;
            state.createRequests = action.payload;
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
    fetchCreateSuccess,
    fetchFailure,
    setProductDetails,
} = productRequestSlice.actions;

export const fetchEditRequests = () => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/associate/masterProductUpdateRequest/getAllMasterProductUpdateRequests?status&page&limit`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(fetchEditSuccess(res.data.data.data));
    } catch (err) {
        dispatch(fetchFailure(err.message));
    }
};

export const fetchDeleteRequests = () => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/associate/masterProductDeleteRequest/getAllMasterProductDeleteRequests`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(fetchDeleteSuccess(res.data.data.data));
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
            `${process.env.REACT_APP_BACKEND_URL}/associate/masterProductUpdateRequest/approveMasterProductUpdateRequest/${id}`,
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
export const rejectEditRequest = (id, rejectionReason, enqueueSnackbar) => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');
        await axios.patch(
            `${process.env.REACT_APP_BACKEND_URL}/associate/masterProductUpdateRequest/rejectMasterProductUpdateRequest/${id}`,
            { rejectionReason },
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
        const res = await axios.patch(
            `${process.env.REACT_APP_BACKEND_URL}/associate/masterProductDeleteRequest/handleMasterProductDeleteRequest`,
            { requestId, action, reason },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        enqueueSnackbar(
            res?.data?.message || 'Action completed successfully',
            { variant: 'success' }
        );
        dispatch(fetchDeleteRequests());
    } catch (err) {
        enqueueSnackbar(err?.response?.data?.message || err.message || 'Something went wrong', { variant: 'error' });
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


export const fetchCreateRequests = (page = 1, limit = 10) => async (dispatch) => {
    dispatch(fetchStart());
    try {
        const token = localStorage.getItem('accessToken');

        const res = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/associate/masterProductCreateRequest/getPendingMasterProductsForAssociate?page=${page}&limit=${limit}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );


        dispatch(fetchCreateSuccess(res.data.data.data));
    } catch (err) {
        dispatch(fetchFailure(err.message));
    }
};


export const handleCreateRequestApproval =
    (masterProductId, action, enqueueSnackbar) => async (dispatch) => {
        dispatch(fetchStart());
        try {
            const token = localStorage.getItem('accessToken');

            const res = await axios.patch(
                `${process.env.REACT_APP_BACKEND_URL}/associate/masterProductCreateRequest/handleMasterProductCreationApproval`,
                {
                    masterProductId,
                    action, 
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            enqueueSnackbar(
                res?.data?.message || `Product ${action.toLowerCase()}d successfully`,
                { variant: 'success' }
            );

          
            dispatch(fetchCreateRequests());
        } catch (err) {
            enqueueSnackbar(
                err?.response?.data?.message || err.message || 'Something went wrong',
                { variant: 'error' }
            );
            dispatch(fetchFailure(err.message));
        }
    };



export default productRequestSlice.reducer;
