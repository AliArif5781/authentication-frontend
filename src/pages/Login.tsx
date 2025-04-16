// pages/Login.tsx
import { useState } from "react";
import logo from "../assets/assets/logo.svg";
import person_icon from "../assets/assets/person_icon.svg";
import mail_icon from "../assets/assets/mail_icon.svg";
import lock_icon from "../assets/assets/lock_icon.svg";
import { useNavigate } from "react-router-dom";
import { register, login } from "../services/authServices";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuth } from "../features/protectedSlice";

const Login = () => {
  const [state, setState] = useState<"SignUp" | "Login">("SignUp");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (state === "SignUp") {
        await register(name, email, password);
        toast.success("Registration successful! Please verify your email.", {
          duration: 3000,
        });
        dispatch(setAuth(true));
        navigate("/email-verify");
      } else {
        await login(email, password);
        toast.success("Login successful!", {
          duration: 3000,
        });
        dispatch(setAuth(true));
        navigate("/email-verify");
      }
    } catch (error: any) {
      toast.error(error.message); // Now this will properly show "User already exists"
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "SignUp" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "SignUp" ? "Create your account" : "Login to your account"}
        </p>

        <form onSubmit={handleSubmit}>
          {state === "SignUp" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={person_icon} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="bg-transparent outline-none w-full"
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="bg-transparent outline-none w-full"
              type="email"
              placeholder="Email"
              required
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="bg-transparent outline-none w-full"
              type="password"
              placeholder="Password"
              required
              minLength={6}
            />
          </div>

          {state === "Login" && (
            <p
              onClick={() => navigate("/reset-password")}
              className="mb-4 text-indigo-500 cursor-pointer"
            >
              Forgot Password?
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : state}
          </button>
        </form>

        {state === "SignUp" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => setState("SignUp")}
              className="text-blue-400 cursor-pointer underline"
            >
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
