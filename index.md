config/mongodb.js:
import mongoose from "mongoose";

const connectDB = async () => {
mongoose.connection.on("connected", () => {
// event when we connected with db we get the msg
console.log("database connected");
});

const db_uri = process.env.MONGODB_URI;

await mongoose.connect(db_uri);
};

export default connectDB;
config/nodemailer.js:
import nodemailer from "nodemailer";

const transpoter = nodemailer.createTransport({
host: "smtp-relay.brevo.com",
port: 587,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASSWORD,
},
});
export default transpoter;
controllers/authController.js:
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transpoter from "../config/nodemailer.js";

export const register = async (req, res) => {
const { name, email, password } = req.body;

if (!name || !email || !password) {
return res.json({ success: false, message: "Missing Details" });
}

try {
const existingUser = await userModel.findOne({ email });
if (existingUser) {
return res.json({ success: false, message: "User already exists" });
}

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      // when we run this project on live server then it will run on https then it will be true, while running in local environment/development environment it will run on http it mean not secureit will be false, then make it true or false make env.
      secure: process.env.NODE_ENV === "production", // so secure will be false for development env it will true in production env.
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d in milli-second
    });

    // Sending Welcome Email
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to website",
      text: Welcome to website.Your account  has been created with email id ${email},
    };
    await transpoter.sendMail(mailOption);

    return res.json({ success: true });

} catch (error) {
res.json({ success: false, message: error.message });
}
};

export const login = async (req, res) => {
const { email, password } = req.body;

if (!email || !password) {
return res.json({
success: false,
message: "Email and password are required",
});
}
try {
const user = await userModel.findOne({ email });
if (!user) {
return res.json({ success: false, message: "Invalid Email" });
}

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true });

} catch (error) {
return res.json({ success: false, message: error.message });
}
};

export const logout = async (req, res) => {
try {
res.clearCookie("token", {
httpOnly: true,
secure: process.env.NODE_ENV === "production",
sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
});

    return res.json({ success: true, message: "User logout" });

} catch (error) {
return res.json({ success: false, message: error.message });
}
};

// now create api end point using this controller function for that we create route

// Send Verification OTP to the user Email,
export const sendVerifyOTP = async (req, res) => {
try {
// actially we get the userID from the token and token store in cookies so we need a middleware that will get the cookie and from that we will find the token and from that token we will find the userId, and userId will be added in the req.body that will done using function so that we will create a middleware in middleware folder
const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "User already verified" });
    }
    // script generate one OTP that will send on users email id
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: Your OTP is ${otp}. Verify your account using this OTP.,
    };
    await transpoter.sendMail(mailOption);
    res.json({
      success: true,
      message: "Verification OTP send on Email",
    });

} catch (error) {
return res.json({ success: false, message: error.message });
}
};

// Verify email using otp
export const verifyEmail = async (req, res) => {
const { userId, otp } = req.body;

if (!userId || !otp) {
return res.json({ success: false, message: "Missing Details" });
}

try {
const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid Otp" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "Otp Expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email Verified successfully" });

} catch (error) {
return res.json({ success: false, message: error.message });
}
};

// Check if user is authenticated
export const isAuthenticated = async (req, res) => {
try {
return res.json({ success: true });
} catch (error) {
return res.json({ success: false, message: error.message });
}
};

// send password reset otp
export const sendResetOtp = async (req, res) => {
const { email } = req.body;

if (!email) {
return res.json({ success: false, message: "Email is required" });
}
try {
const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: Your OTP for resetting your password is ${otp}. Use this Otp to proceed with resetting your password.,
    };
    await transpoter.sendMail(mailOption);

    return res.json({ success: true, message: "OTP send to your email." });

} catch (error) {
return res.json({ success: false, message: error.message });
}
};

// reset user password
export const resetPassword = async (req, res) => {
const { email, otp, newPassword } = req.body;

if (!email || !otp || !newPassword) {
return res.json({
success: false,
message: "Email, Otp and newPassword are required.",
});
}

try {
const user = await userModel.findOne({ email });
if (!user) {
return res.json({ success: false, message: "User not found" });
}

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTp" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });

} catch (error) {
return res.json({ success: false, message: error.message });
}
};
controllers/userController.js:
import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
try {
const { userId } = req.body;
const user = await userModel.findById(userId);
if (!user) {
return res.json({ success: false, message: "User not found " });
}
res.json({
success: true,
userData: {
name: user.name,
isAccountVerified: user.isAccountVerified,
email: user.email,
},
});
} catch (error) {
return res.json({ success: false, message: error.message });
}
};
middlewares/userAuth.js:
// now we add the fucntion that will find the token from the cookie and from that token will find the userId so here let add.
import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
const { token } = req.cookies;

if (!token) {
return res.json({ success: false, message: "Not Authorized Login Again" });
}

try {
const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
console.log(tokenDecode, "tokenDecode");

    if (tokenDecode.id) {
      console.log(tokenDecode.id);
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }
    next(); // If everything is successful, passes control to the next middleware/route.

} catch (error) {
res.json({ success: false, message: error.message });
}
};

export default userAuth;
models/userModel.js:
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
name: { type: String, required: true },
email: { type: String, required: true, unique: true },
password: { type: String, required: true },
verifyOtp: { type: String, default: "" }, // email/user verification otp. when user created this verifyOTp craeted and default value empty string.
verifyOtpExpireAt: { type: Number, default: 0 },
isAccountVerified: { type: Boolean, default: false },
resetOtp: { type: String, default: "" },
resetOtpExpireAt: { type: Number, default: 0 },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
// they search the user models if userModel avaible this userModel will be use if not avaiable it will create (mongoose.model("user", userSchema);) the userModel

export default userModel;
routes/authRoutes.js:
import express from "express";
import {
isAuthenticated,
login,
logout,
register,
resetPassword,
sendResetOtp,
sendVerifyOTP,
verifyEmail,
} from "../controllers/authController.js";
import userAuth from "../middlewares/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOTP);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.post("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
routes/userRoutes.js:
import expres from "express";
import userAuth from "../middlewares/userAuth.js";
import { getUserData } from "../controllers/userController.js";

const userRoutes = expres.Router();

userRoutes.get("/data", userAuth, getUserData);

export default userRoutes;
.env:
MONGODB_URI="mongodb+srv://new:1234@newfolderclustor0.hfsl6.mongodb.net/new?retryWrites=true&w=majority&appName=newFolderClustor0"
JWT_SECRET= "2648a0d2f52f9d5268867bbbf295bef23ca56354b9dd276631f8a1f1e37b3f65"
NODE_ENV= "development"
PORT=3000
SMTP_USER= "899c64001@smtp-brevo.com"
SMTP_PASSWORD="ArkCaSgm5xbwBjRJ"
SENDER_EMAIL="aa4241376@gmail.com"
index.js:
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT;
// const port = process.env.PORT || 3000;
connectDB();

app.use(express.json()); // All request pass through json.
app.use(cookieParser());
app.use(cors({ credentials: true })); // So we send the cookies in the response from express app.

// API End-Point
app.get("/", (req, res) => {
res.send("api working");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.listen(port, () => {
console.log(server running at port ${port});
});
FRONTEND
pages/Login.tsx:
import { useState } from "react";
import logo from "../assets/assets/logo.svg";
import person_icon from "../assets/assets/person_icon.svg";
import mail_icon from "../assets/assets/mail_icon.svg";
import lock_icon from "../assets/assets/lock_icon.svg";
import { useNavigate } from "react-router-dom";

const Login = () => {
const [state, setState] = useState("SignUp");
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const navigate = useNavigate();
return (
<div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
<img
onClick={() => navigate("/")}
src={logo}
alt=""
className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
/>
<div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
<h2 className="text-3xl font-semibold text-white text-center mb-3 ">
{state === "SignUp" ? "Create Account" : "Login "}
</h2>
<p className="text-center text-sm mb-6">
{" "}
{state === "SignUp" ? "Create your account" : "Login to your account"}
</p>

        {/*  */}
        <form action="">
          {state === "SignUp" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={person_icon} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="bg-transparent outline-none "
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
              className="bg-transparent outline-none "
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
              className="bg-transparent outline-none "
              type="password"
              placeholder="Password"
              required
            />
          </div>

          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-indigo-500 cursor-pointer"
          >
            Forget Password?
          </p>
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            {state}
          </button>
        </form>
        {/*  */}
        {state === "SignUp" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don,t have an account?
            <span
              onClick={() => setState("SignUp")}
              className="text-blue-400 cursor-pointer underline"
            >
              Sign up
            </span>
          </p>
        )}

        {/*  */}
      </div>
    </div>

);
};

export default Login;
pages/EmailVerify.tsx:
const EmailVerify = () => {
return (
<div>
<h1>Email Verify</h1>
</div>
);
};

export default EmailVerify;
pages/ResetPassword.tsx:
const ResetPassword = () => {
return (
<div>
<h1>ResetPassword</h1>
</div>
);
};

export default ResetPassword;
routes/index.tsx:
import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import EmailVerify from "../pages/EmailVerify";
import ResetPassword from "../pages/ResetPassword";
import LayoutSecong from "../components/LayoutSecong";

const router = createBrowserRouter([
{
path: "",
children: [
{
path: "",
element: <LayoutSecong />,
},
{
path: "/login",
element: <Login />,
},
{
path: "/email-verify",
element: <EmailVerify />,
},
{
path: "/reset-password",
element: <ResetPassword />,
},
],
},
]);

export default router;
components/LayoutSecong.tsx:
import Navbar from "./Navbar";
import Header from "./Header";
import bg_img from "/bg_img.png";
const LayoutSecong = () => {
return (
<div
className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
style={{ backgroundImage: url(${bg_img}) }} >
<Navbar />
<Header />
</div>
);
};

export default LayoutSecong;
i already make a backend with full working and also make a ui of frontend in react with typescript , how to connect backend to frontend using axios and also make a login,register , EmailVerify and resetPassword. in frontend global state using redux toolkit.
