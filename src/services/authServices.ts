import api from "../api";

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const response = await api.post(
      "/auth/register",
      {
        name,
        email,
        password,
      },
      { withCredentials: true }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Registration failed");
    }
    console.log(response, "response Register");
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Registration Failed");
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post(
      "/auth/login",
      { email, password },
      { withCredentials: true }
    );
    if (response.data.success !== true) {
      throw new Error(response.data.message || "Login failed");
    }
    // console.log(response, "login response");

    return response.data;
  } catch (error: any) {
    console.log(error, "authServices login");
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || "Login failed");
  }
};

export const logout = async () => {
  try {
    const response = await api.post(
      "/auth/logout",
      {},
      { withCredentials: true }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Logout failed");
    }
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || "Logout failed");
  }
};

export const sendVerifyOTP = async () => {
  try {
    const response = await api.post("/auth/send-verify-otp");
    console.log(response, "sendVerifyOTP");

    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to send verification OTP";
  }
};

export const verifyEmailWithOTP = async (otp: string) => {
  try {
    const response = await api.post("/auth/verify-account", { otp });
    if (!response.data.success) {
      throw new Error(response.data.message || "Verification failed");
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Verification failed");
  }
};

export const sendResetOtp = async (email: string) => {
  try {
    const response = await api.post("/auth/send-reset-otp", { email });
    console.log(response);
    return response.data;
  } catch (error: any) {
    // throw error.response?.data?.message || "Failed to send reset OTP";
    throw new Error(
      error.response?.data?.message || "Failed to send reset OTP"
    );
  }
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  try {
    const response = await api.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Password reset failed";
  }
};

export const checkAuth = async () => {
  try {
    const response = await api.post("/auth/is-auth");
    // console.log(response, "respose {checkAuth}");
    return response.data.success; // checkAuth
  } catch (error) {
    return false;
  }
};
