import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    totalEmployees: 0,
    totalApplicants:0,
    loading: false,
    error: null,
};

const cardSlice = createSlice({
    name: 'employeeCard',
    initialState,
    reducers: {
        setTotalEmployees: (state, action) => {
            state.totalEmployees = action.payload;
        },
        setTotalApplicant: (state, action) => {
            state.totalApplicant = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    setTotalEmployees,
    setTotalApplicant,
    setLoading,
    setError,
} = cardSlice.actions;

export default cardSlice.reducer;

const getToken = () => localStorage.getItem("accessToken");

export const fetchTotalEmployeeCard = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const res = await axios.get(
            "https://api.earnplus.net/api/v1/employer/auth/getCountsForEmployer",
            { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const totalEmployees = res?.data?.data?.totalEmployees;
        dispatch(setTotalEmployees(totalEmployees));
        const totalApplicants = res?.data?.data?.totalApplicants;
        dispatch(setTotalApplicant(totalApplicants));
    } catch (err) {
        dispatch(setError(err.message));
    } finally {
        dispatch(setLoading(false));
    }
};
