// File: Login.js

import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import logoImage from "../../assets/logo/logo2.png";
import backgroundImage from "../../assets/banner/login-banner.png"
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { useState, useContext, useEffect } from "react";
import './Login.css';
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient"
import { showError, showSuccess } from "../../util/alert";

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
    const [showCurrentPass, setShowCurrentPass] = useState(false);

    // Context
    const { backendURL, setIsLoggedIn, setUserData } = useContext(AppContext);
    const navigate = useNavigate();

    // Nội dung động
    const buttonText = isCreateAccount ? "Đăng Ký" : "Đăng Nhập";

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
                    showSuccess("Đăng ký thành công!");
                    toast.success("Account created successfully. Please check your email for OTP to verify your account.");
                    setVerificationMode(true);
                    // Keep email, password, name for verification/resend, clear others
                    setPhoneNumber("");
                    setAddress("");
                    setDateOfBirth("");
                } else {
                    showError("Đăng ký thất bại!");
                    toast.error("Registration failed. Try again.");
                }
            } else {
                // Login logic
                const response = await axiosClient.post("/auth/login", { email, password });
                console.log(response);
                const role = response.data.roles[0].authority;
                if (response.status === 200) {
                    localStorage.setItem("accessToken", response.data.token);
                    localStorage.setItem("role", role);
                    setIsLoggedIn(true);
                    setUserData(response.data.user);
                    showSuccess("Đăng nhập thành công!");
                    toast.success("Login successful!");
                    navigate(role === 'ROLE_USER' ? "/" : "/admin",);
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
                showError("Thao tác không thành công ! " + errMsg);
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
                showSuccess("Xác nhận thành công!");
                toast.success("Account verified successfully! You can now log in.");
                setVerificationMode(false);
                setOtp("");
                setIsCreateAccount(false);
                navigate('/login');
            } else {
                toast.error("Invalid OTP. Please try again.");
                showshowError("OTP không hợp lệ ! Vui lòng nhập lại !");
            }
        } catch (error) {
            toast.error("Verification failed. Please check your OTP.");
            showError("Xác nhận thất bại ! Vui lòng kiểm tra lại OTP của bạn !");
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
                showSuccess("OTP đã được gửi đến cho bạn. Hãy kiểm tra email !")
            }
        } catch (error) {
            toast.error("OTP gửi không thành công. Vui lòng gửi lại !");
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
            Bạn đã có tài khoản?{" "}
            <span className="login-toggle-link" onClick={handleToggle}>
                Đăng nhập
            </span>{" "}
            ❤️
        </>
    ) : (
        <>
            Bạn chưa có tài khoản?{" "}
            <span className="login-toggle-link" onClick={handleToggle}>
                Đăng ký
            </span>{" "}
            ❤️
        </>
    );

    return (
        <div className="login-container">
            {/* Left Side - Form */}
            <div className="login-left">
                <div className="login-form-wrapper">
                    {/* Logo */}
                    <Link to="/" className="logo-link">
                        <img src={logoImage} alt="logo" className="logo" />
                        <h1>{!isCreateAccount ? "CHÀO MỪNG BẠN ĐẾN VỚI ELITEBOOKS" : "TẠO TÀI KHOẢN CỦA BẠN"}</h1>
                    </Link>

                    {/* Form Card */}
                    <div className="form-card">
                        <p className="form-subtitle">
                            {verificationMode
                                ? 'Kiểm tra email của bạn để lấy mã xác nhận'
                                : (isCreateAccount
                                    ? 'Hãy đăng ký để khám phá cùng chúng tôi'
                                    : 'Đăng nhập để tiếp tục'
                                )
                            }
                        </p>

                        {verificationMode ? (
                            <div className="verification-section">
                                <p className="verification-text">
                                    Nhập mã OTP được gửi đến email của bạn <strong>({email})</strong>
                                </p>
                                <div className="form-group">
                                    <label htmlFor="otp" className="form-label">
                                        Mã OTP
                                    </label>
                                    <input
                                        type="text"
                                        id="otp"
                                        className="form-input"
                                        placeholder="Enter 6-digit OTP"
                                        onChange={(e) => setOtp(e.target.value)}
                                        value={otp}
                                        maxLength="6"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="submit-btn"
                                    onClick={handleVerifyOtp}
                                    disabled={loading}
                                >
                                    {loading ? "Verifying..." : "Verify Account"}
                                </button>
                                <button
                                    type="button"
                                    className="resend-btn"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                >
                                    Gửi lại OTP
                                </button>
                                <p className="toggle-text">
                                    <span className="toggle-link" onClick={() => setVerificationMode(false)}>
                                        ← Quay về Login
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={onSubmitHandler} className="login-form">
                                {/* Sign Up Fields */}
                                {isCreateAccount && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="fullName" className="form-label">
                                                Họ và tên
                                            </label>
                                            <input
                                                type="text"
                                                id="fullName"
                                                className="form-input"
                                                placeholder="Nhập họ và tên của bạn...."
                                                required
                                                onChange={(e) => setName(e.target.value)}
                                                value={name}
                                            />
                                        </div>

                                        <div className="form-row-login">
                                            <div className="form-col">
                                                <label htmlFor="phoneNumber" className="form-label">
                                                    Số điện thoại
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="phoneNumber"
                                                    className="form-input"
                                                    placeholder="+84 123 456 789"
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    value={phoneNumber}
                                                />
                                            </div>

                                            <div className="form-col">
                                                <label htmlFor="dateOfBirth" className="form-label">
                                                    Ngày sinh
                                                </label>
                                                <input
                                                    type="date"
                                                    id="dateOfBirth"
                                                    className="form-input"
                                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                                    value={dateOfBirth}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="address" className="form-label">
                                                Địa chỉ
                                            </label>
                                            <input
                                                type="text"
                                                id="address"
                                                className="form-input"
                                                placeholder="123 Main Street, City"
                                                onChange={(e) => setAddress(e.target.value)}
                                                value={address}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Email Field */}
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        Email 
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-input"
                                        placeholder="example@email.com"
                                        required
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">
                                        Mật khẩu
                                    </label>
                                    <div className="form-input-wrapper password-wrapper">
                                        <input
                                            type={showCurrentPass ? "text" : "password"}
                                            id="password"
                                            className="form-input pr-10"
                                            placeholder="••••••••"
                                            required
                                            onChange={(e) => setPassword(e.target.value)}
                                            value={password}
                                        />

                                        <span
                                            className="toggle-password"
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                        >
                                            {showCurrentPass ? <FaEyeSlash /> : <IoEyeSharp />}
                                        </span>
                                    </div>
                                </div>


                                {/* Forgot Password Link */}
                                {!isCreateAccount && (
                                    <div className="forgot-password">
                                        <Link to="/reset-password" className="forgot-link">
                                            Quên mật khẩu?
                                        </Link>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : buttonText}
                                </button>

                                {/* Divider */}
                                <div className="divider">
                                    <span>or continue with</span>
                                </div>
                            </form>
                        )}

                        {/* Toggle Text */}
                        {!verificationMode && (
                            <p className="toggle-text">{toggleJSX}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side - Background Image */}
            <div className="login-right">
                <img src={backgroundImage} alt="background" className="background-image" />
            </div>
        </div>
    );
};

export default Login;