import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import EmailVerify from "../pages/EmailVerify";
import ResetPassword from "../pages/ResetPassword";
import LayoutSecong from "../components/LayoutSecong";
import Dashboard from "../pages/Dashboard";
import Header from "../components/Header";
import Logout from "../components/Logout";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";

const router = createBrowserRouter([
  {
    path: "",
    children: [
      {
        path: "",
        element: <LayoutSecong />,
      },
      {
        path: "",
        element: <Header />,
      },
      {
        path: "/login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "/email-verify",
        element: (
          <ProtectedRoute>
            <EmailVerify />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/logout",
        element: <Logout />,
      },
    ],
  },
]);

export default router;
