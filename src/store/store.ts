import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import protectedReducer from "../features/protectedSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    protected: protectedReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
