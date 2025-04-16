import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.protected
  );

  if (!loading && isAuthenticated) {
    return <Navigate to={"/email-verify"} replace />;
  }
  return <>{children}</>;
};

export default PublicRoute;
