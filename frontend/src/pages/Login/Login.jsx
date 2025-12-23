// File: Login.js

import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import logoImage from "../../assets/logo/logo-removebg-preview.png";
import { useState, useContext, useEffect } from "react";
import './Login.css';
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient"

const Login = () => {
    // Khai báo state
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [isCreateAccount, setIsCreateAccount] = useState(location.pathname === '/register' || searchParams.get('register') === 'true');
    const [verificationMode, setVerificationMode] = useState(false);
    const [otp, setOtp] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [loading, setLoading] = useState(false);

    // Context
    const { backendURL, setIsLoggedIn, setUserData } = useContext(AppContext);
    const navigate = useNavigate();

    // Nội dung động
    const buttonText = isCreateAccount ? "Sign Up" : "Login";
    const titleText = "Elitebooks";

    // Xử lý API
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        axios.defaults.withCredentials = true;
        setLoading(true);

        // CẬP NHẬT VALIDATION: Kiểm tra tất cả các trường bắt buộc
        if (!email || !password || (isCreateAccount && (!name || !phoneNumber || !address))) {
            toast.error("Please fill in all required fields (Full Name, Phone, Address).");
            setLoading(false);
            return;
        }

        try {
            if (isCreateAccount) {
                // Register logic
                // CẬP NHẬT PAYLOAD: Sử dụng camelCase để khớp với ProfileRequest DTO
                const payload = {
                    // Tên key là camelCase (fullName, phoneNumber,...)
                    fullName: name,
                    phoneNumber: phoneNumber,
                    address: address,
                    // Các trường Account/Authentication
                    email: email,
                    password: password
                };

                // Thêm dateOfBirth nếu có
                if (dateOfBirth) {
                    payload.dateOfBirth = dateOfBirth;
                }

                const response = await axios.post(`${backendURL}/register`, payload);

                if (response.status === 200 || response.status === 201) {
                    toast.success("Account created successfully. Please check your email for OTP to verify your account.");
                    setVerificationMode(true);
                    // Keep email, password, name for verification/resend, clear others
                    setPhoneNumber("");
                    setAddress("");
                    setDateOfBirth("");
                } else {
                    toast.error("Registration failed. Try again.");
                }
            } else {
                // Login logic
                const response = await axiosClient.post("/api/auth/login", { email, password });
                if (response.status === 200) {
                    localStorage.setItem("accessToken", response.data.token);
                    setIsLoggedIn(true);
                    setUserData(response.data.user);
                    toast.success("Login successful!");
                    navigate("/");
                }
            }
        } catch (error) {
            if (error.response) {
                const data = error.response.data;
                const errMsg =
                    data?.message ||
                    data?.error ||
                    data?.details ||
                    (error.response.status === 401 ? "Invalid credentials." : "Request failed.");
                toast.error(errMsg);
            } else if (error.request) {
                toast.error("Cannot reach the server. Please check your connection.");
            } else {
                toast.error("Unexpected error occurred.");
            }
        } finally {
            setLoading(false);
            if (!isCreateAccount) setPassword("");
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error("Please enter the OTP.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${backendURL}/auth/verify-registration-otp`, { email, otp });
            if (response.status === 200) {
                toast.success("Account verified successfully! You can now log in.");
                setVerificationMode(false);
                setOtp("");
                setIsCreateAccount(false);
                navigate('/login');
            } else {
                toast.error("Invalid OTP. Please try again.");
            }
        } catch (error) {
            toast.error("Verification failed. Please check your OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            const payload = {
                fullName: name || "Dummy",
                phoneNumber: phoneNumber || "0000000000",
                address: address || "Dummy Address",
                email: email,
                password: password
            };
            const response = await axios.post(`${backendURL}/register`, payload);
            if (response.status === 200) {
                toast.success("OTP resent to your email.");
            }
        } catch (error) {
            toast.error("Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        const newIsCreateAccount = !isCreateAccount;
        setIsCreateAccount(newIsCreateAccount);
        navigate(newIsCreateAccount ? '/register' : '/login');
        setName("");
        setEmail("");
        setPassword("");
        setPhoneNumber("");
        setAddress("");
        setDateOfBirth("");
    };

    // Toggle text
    const toggleJSX = isCreateAccount ? (
        <>
            Already have an account?{" "}
            <span className="login-toggle-link" onClick={handleToggle}>
                Login here
            </span>{" "}
            ❤️
        </>
    ) : (
        <>
            Don't have an account?{" "}
            <span className="login-toggle-link" onClick={handleToggle}>
                Sign up
            </span>{" "}
            ❤️
        </>
    );

    return (
        <div className="login-page-wrapper">
            {/* Logo Section */}
            <div className="login-logo-section">
                <Link to="/" className="login-logo-link">
                    <img src={logoImage} alt="logo" className="login-logo-img" />
                </Link>

            </div>

            {/* Form Card */}
            <div className="login-form-card">
                <h2 className="login-title">{titleText}</h2>

                {verificationMode ? (
                    <div className="login-verification-section">
                        <p className="login-verification-text">
                            Please enter the OTP sent to your email ({email}) to verify your account.
                        </p>
                        <div className="login-form-group">
                            <label htmlFor="otp" className="login-label">
                                OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                className="login-input"
                                placeholder="Enter OTP"
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp}
                            />
                        </div>
                        <button
                            type="button"
                            className="login-submit-btn"
                            onClick={handleVerifyOtp}
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify Account"}
                        </button>
                        <button
                            type="button"
                            className="login-resend-btn"
                            onClick={handleResendOtp}
                            disabled={loading}
                        >
                            Resend OTP
                        </button>
                        <p className="login-toggle-text">
                            <span className="login-toggle-link" onClick={() => setVerificationMode(false)}>
                                Back to Login
                            </span>
                        </p>
                    </div>
                ) : (
                    <form onSubmit={onSubmitHandler}>
                        {/* Sign Up Fields */}
                        {isCreateAccount && (
                            <>
                                <div className="login-form-group">
                                    <label htmlFor="fullName" className="login-label">
                                        FullName
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        className="login-input"
                                        placeholder="Enter your full name"
                                        required
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                    />
                                </div>
                                <div className="login-form-row">
                                    <div className="login-form-col-half">
                                        <label htmlFor="phoneNumber" className="login-label-small">
                                            Phone
                                        </label>
                                        <input
                                            type="text"
                                            id="phoneNumber"
                                            className="login-input"
                                            placeholder="Phone number"
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            value={phoneNumber}
                                        />
                                    </div>

                                    <div className="login-form-col-half">
                                        <label htmlFor="dateOfBirth" className="login-label-small">
                                            DOB
                                        </label>
                                        <input
                                            type="date"
                                            id="dateOfBirth"
                                            className="login-input"
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            value={dateOfBirth}
                                        />
                                    </div>
                                </div>

                                <div className="login-form-group">
                                    <label htmlFor="address" className="login-label">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        className="login-input"
                                        placeholder="Enter your address"
                                        onChange={(e) => setAddress(e.target.value)}
                                        value={address}
                                    />
                                </div>
                            </>
                        )}

                        {/* Email Field */}
                        <div className="login-form-group">
                            <label htmlFor="email" className="login-label">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="login-input"
                                placeholder="Enter email"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="login-form-group">
                            <label htmlFor="password" className="login-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="login-input"
                                placeholder="*********"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                            />
                        </div>

                        {/* Forgot Password Link */}
                        {!isCreateAccount && (
                            <div className="login-forgot-password">
                                <Link to="/reset-password" className="login-forgot-link">
                                    Forgot password
                                </Link>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : buttonText}
                        </button>
                    </form>
                )}

                {/* Toggle Text */}
                {!verificationMode && <p className="login-toggle-text">{toggleJSX}</p>}
            </div>
        </div>
    );
};

export default Login;