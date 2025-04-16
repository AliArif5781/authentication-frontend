import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "./services/authServices";
import { setAuth } from "./features/protectedSlice";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      // console.log(dispatch(setAuth(isAuthenticated)));
      dispatch(setAuth(isAuthenticated));
    };
    verifyAuth();
  }, [dispatch]);
  return <>{children}</>;
};

export default AuthProvider;
