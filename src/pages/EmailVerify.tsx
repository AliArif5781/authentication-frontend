// components/EmailVerify.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendVerifyOTP, verifyEmailWithOTP } from "../services/authServices";
import { toast } from "react-hot-toast";

const EmailVerify = () => {
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    try {
      setIsSending(true);
      const response = await sendVerifyOTP();
      toast.success(response.message || "OTP sent successfully!");
      setOtpSent(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsVerifying(true);
      const response = await verifyEmailWithOTP(otp);
      console.log(response, "emailVerify");

      // This will only execute if verification succeeded
      toast.success("Email verified successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      // This will catch both network errors and API success:false responses
      toast.error(error.message);

      // Clear the OTP field on failure
      setOtp("");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Email Verification
        </h2>

        {!otpSent ? (
          <>
            <button
              onClick={handleSendOTP}
              disabled={isSending}
              className={`w-full py-2 px-4 rounded-md text-white ${
                isSending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSending ? "Sending OTP..." : "Send Verification OTP"}
            </button>
            <p className="mt-4 text-sm text-gray-600 text-center">
              We'll send a 6-digit code to your email
            </p>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Verification Code
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
              />
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={isVerifying || otp.length !== 6}
              className={`w-full py-2 px-4 rounded-md text-white ${
                isVerifying ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } ${otp.length !== 6 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={handleSendOTP}
                disabled={isSending}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isSending ? "Resending OTP..." : "Resend OTP"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerify;
