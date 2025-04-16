import toast from "react-hot-toast";
import { logout } from "../services/authServices";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  return (
    <div>
      <div>
        <button className="bg-gray-700 p-2 rounded-md " onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Logout;
