// redux/variant/variantCreateRequestSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    requests: [],
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    details: null,
    detailsLoading: false,
};

/* ===================== THUNKS ===================== */

export const fetchPendingVariantCreateRequests = createAsyncThunk(
    'variantCreateRequest/fetchList',
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');

            const res = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/associate/variantProductCreateRequest/getPendingVariantProductsForAssociate`,
                {
                    params: { page, limit },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const fetchVariantCreateRequestDetails = createAsyncThunk(
    'variantCreateRequest/fetchDetails',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');

            const res = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/associate/variantProductCreateRequest/getPendingVariantProductDetailForAssociate/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const handleVariantCreateRequestApproval = createAsyncThunk(
    'variantCreateRequest/handleApproval',
    async ({ variantProductId, action }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');

            const res = await axios.patch(
                `${process.env.REACT_APP_BACKEND_URL}/associate/variantProductCreateRequest/handleVariantProductCreationApproval`,
                { variantProductId, action },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return {
                id: variantProductId,
                message: res.data.message,
            };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || 'Action failed'
            );
        }
    }
);

/* ===================== SLICE ===================== */

const variantCreateRequestSlice = createSlice({
    name: 'variantCreateRequest',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPendingVariantCreateRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPendingVariantCreateRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload.data;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchPendingVariantCreateRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchVariantCreateRequestDetails.pending, (state) => {
                state.detailsLoading = true;
            })
            .addCase(fetchVariantCreateRequestDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.details = action.payload;
            })
            .addCase(fetchVariantCreateRequestDetails.rejected, (state) => {
                state.detailsLoading = false;
            });
    },
});

export default variantCreateRequestSlice.reducer;