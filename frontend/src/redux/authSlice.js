import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api/client";

const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  loading: false,
  error: null
};

function persistAuth({ user, token }) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
}

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to login");
  }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to register");
  }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Session expired");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = null;
        localStorage.setItem("hasRegistered", "true");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        localStorage.setItem("hasRegistered", "true");
        persistAuth(action.payload);
      })
      .addMatcher(
        (action) => ["auth/login/pending", "auth/register/pending"].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => ["auth/login/rejected", "auth/register/rejected"].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
