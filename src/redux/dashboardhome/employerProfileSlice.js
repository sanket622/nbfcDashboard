import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const employerProfileSlice = createSlice({
  name: 'employerProfile',
  initialState,
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setProfile, setLoading, setError } = employerProfileSlice.actions;
export default employerProfileSlice.reducer;

// Async thunk
const getToken = () => localStorage.getItem("accessToken");

export const fetchEmployerProfile = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await axios.get(
      "https://api.earnplus.net/api/v1/employer/auth/getEmployerProfile",
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    dispatch(setProfile(res.data.data));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};
