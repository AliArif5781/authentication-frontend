import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  //   user: null | any;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: true, // Start with loading true
  //   user: null,
};

const protectedSlice = createSlice({
  name: "protectedSlice",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      state.loading = false;
    },
    // setUser: (state, action: PayloadAction<any>) => {
    //   state.user = action.payload;
    // },
    // logout: (state) => {
    //   state.isAuthenticated = false;
    //   state.user = null;
    // },
  },
});

export const {
  setAuth,
  //  setUser, logout
} = protectedSlice.actions;
export default protectedSlice.reducer;
