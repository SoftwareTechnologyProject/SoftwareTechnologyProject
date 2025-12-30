import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import logoImage from "../../assets/logo/logo2.png";
import backgroundImage from "../../assets/banner/login-banner.png"
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { useState, useContext } from "react";
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
    const [resetPasswordMode, setResetPasswordMode] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: enter email, 2: enter OTP and new password
    
    const [otp, setOtp] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    
    // Reset password states
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        if (!email || !password || (isCreateAccount && (!name || !phoneNumber || !address))) {
            toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
            setLoading(false);
            return;
        }

        try {
            if (isCreateAccount) {
                const payload = {
                    fullName: name,
                    phoneNumber: phoneNumber,
                    address: address,
                    email: email,
                    password: password
                };

                if (dateOfBirth) {
                    payload.dateOfBirth = dateOfBirth;
                }

                const response = await axios.post(`${backendURL}/register`, payload);

                if (response.status === 200 || response.status === 201) {
                    showSuccess("Đăng ký thành công!");
                    toast.success("Vui lòng kiểm tra email để lấy mã OTP xác nhận tài khoản.");
                    setVerificationMode(true);
                    setPhoneNumber("");
                    setAddress("");
                    setDateOfBirth("");
                } else {
                    showError("Đăng ký thất bại!");
                    toast.error("Đăng ký thất bại. Vui lòng thử lại.");
                }
            } else {
                const response = await axiosClient.post("/auth/login", { email, password });
                const role = response.data.roles[0].authority;
                if (response.status === 200) {
                    localStorage.setItem("accessToken", response.data.token);
                    localStorage.setItem("role", role);
                    setIsLoggedIn(true);
                    setUserData(response.data.user);
                    showSuccess("Đăng nhập thành công!");
                    toast.success("Đăng nhập thành công!");
                    navigate(role === 'ROLE_USER' ? "/" : "/admin");
                }
            }
        } catch (error) {
            if (error.response) {
                const data = error.response.data;
                const errMsg =
                    data?.message ||
                    data?.error ||
                    data?.details ||
                    (error.response.status === 401 ? "Thông tin đăng nhập không hợp lệ." : "Yêu cầu thất bại.");
                toast.error(errMsg);
                showError("Thao tác không thành công! " + errMsg);
            } else if (error.request) {
                toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối.");
            } else {
                toast.error("Đã xảy ra lỗi không mong muốn.");
            }
        } finally {
            setLoading(false);
            if (!isCreateAccount) setPassword("");
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error("Vui lòng nhập mã OTP.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${backendURL}/auth/verify-registration-otp`, { email, otp });
            if (response.status === 200) {
                showSuccess("Xác nhận thành công!");
                toast.success("Xác nhận tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.");
                setVerificationMode(false);
                setOtp("");
                setIsCreateAccount(false);
            } else {
                toast.error("OTP không hợp lệ. Vui lòng thử lại.");
                showError("OTP không hợp lệ! Vui lòng nhập lại!");
            }
        } catch (error) {
            toast.error("Xác nhận thất bại. Vui lòng kiểm tra mã OTP.");
            showError("Xác nhận thất bại! Vui lòng kiểm tra lại OTP của bạn!");
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
                toast.success("OTP đã được gửi lại đến email của bạn.");
                showSuccess("OTP đã được gửi lại. Hãy kiểm tra email!");
            }
        } catch (error) {
            toast.error("Gửi lại OTP không thành công. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    // Reset Password Handlers
    const handleSendResetOTP = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Vui lòng nhập email của bạn.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${backendURL}/auth/send-reset-otp?email=${email}`);
            if (response.status === 200) {
                toast.success("OTP đã được gửi đến email của bạn.");
                showSuccess("OTP đã được gửi đến email!");
                setResetStep(2);
            }
        } catch (error) {
            toast.error("Gửi OTP thất bại. Vui lòng thử lại.");
            showError("Gửi OTP thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword || !confirmPassword) {
            toast.error("Vui lòng điền đầy đủ các trường.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu không khớp.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${backendURL}/auth/reset-password`, {
                email,
                otp,
                newPassword
            });
            if (response.status === 200) {
                toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
                showSuccess("Đặt lại mật khẩu thành công!");
                setResetPasswordMode(false);
                setResetStep(1);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            }
        } catch (error) {
            toast.error("Đặt lại mật khẩu thất bại. Vui lòng kiểm tra OTP và thử lại.");
            showError("Đặt lại mật khẩu thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        const newIsCreateAccount = !isCreateAccount;
        setIsCreateAccount(newIsCreateAccount);
        setName("");
        setEmail("");
        setPassword("");
        setPhoneNumber("");
        setAddress("");
        setDateOfBirth("");
    };

    const handleForgotPasswordClick = () => {
        setResetPasswordMode(true);
        setResetStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
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
                        <h1>
                            {resetPasswordMode 
                                ? "ĐẶT LẠI MẬT KHẨU" 
                                : (!isCreateAccount ? "CHÀO MỪNG BẠN ĐẾN VỚI ELITEBOOKS" : "TẠO TÀI KHOẢN CỦA BẠN")
                            }
                        </h1>
                    </Link>

                    {/* Form Card */}
                    <div className="form-card">
                        <p className="form-subtitle">
                            {resetPasswordMode
                                ? (resetStep === 1 ? 'Nhập email để nhận mã OTP' : 'Nhập mã OTP và mật khẩu mới')
                                : (verificationMode
                                    ? 'Kiểm tra email của bạn để lấy mã xác nhận'
                                    : (isCreateAccount
                                        ? 'Hãy đăng ký để khám phá cùng chúng tôi'
                                        : 'Đăng nhập để tiếp tục'
                                    )
                                )
                            }
                        </p>

                        {/* Reset Password Mode */}
                        {resetPasswordMode ? (
                            <div className="reset-password-section">
                                {resetStep === 1 ? (
                                    <form onSubmit={handleSendResetOTP} className="login-form">
                                        <div className="form-group">
                                            <label htmlFor="reset-email" className="form-label">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="reset-email"
                                                className="form-input"
                                                placeholder="Nhập email của bạn"
                                                required
                                                onChange={(e) => setEmail(e.target.value)}
                                                value={email}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="submit-btn"
                                            disabled={loading}
                                        >
                                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleResetPassword} className="login-form">
                                        <div className="form-group">
                                            <label htmlFor="reset-otp" className="form-label">
                                                Mã OTP
                                            </label>
                                            <input
                                                type="text"
                                                id="reset-otp"
                                                className="form-input"
                                                placeholder="Nhập mã OTP từ email"
                                                required
                                                onChange={(e) => setOtp(e.target.value)}
                                                value={otp}
                                                maxLength="6"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="new-password" className="form-label">
                                                Mật khẩu mới
                                            </label>
                                            <div className="form-input-wrapper password-wrapper">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    id="new-password"
                                                    className="form-input pr-10"
                                                    placeholder="Nhập mật khẩu mới"
                                                    required
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    value={newPassword}
                                                />
                                                <span
                                                    className="toggle-password"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirm-password" className="form-label">
                                                Xác nhận mật khẩu
                                            </label>
                                            <div className="form-input-wrapper password-wrapper">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    id="confirm-password"
                                                    className="form-input pr-10"
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    required
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    value={confirmPassword}
                                                />
                                                <span
                                                    className="toggle-password"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="submit-btn"
                                            disabled={loading}
                                        >
                                            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                                        </button>
                                    </form>
                                )}
                                <p className="toggle-text">
                                    <span className="toggle-link" onClick={() => {
                                        setResetPasswordMode(false);
                                        setResetStep(1);
                                        setShowNewPassword(false);
                                        setShowConfirmPassword(false);
                                    }}>
                                        Quay về đăng nhập
                                    </span>
                                </p>
                            </div>
                        ) : verificationMode ? (
                            /* Verification Mode */
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
                                        placeholder="Nhập mã OTP 6 số"
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
                                    {loading ? "Đang xác nhận..." : "Xác nhận tài khoản"}
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
                                        Quay về đăng nhập
                                    </span>
                                </p>
                            </div>
                        ) : (
                            /* Login/Register Form */
                            <form onSubmit={onSubmitHandler} className="login-form">
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
                                                placeholder="01 Võ Văn Ngân ..."
                                                onChange={(e) => setAddress(e.target.value)}
                                                value={address}
                                            />
                                        </div>
                                    </>
                                )}

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

                                {!isCreateAccount && (
                                    <div className="forgot-password">
                                        <span className="forgot-link" onClick={handleForgotPasswordClick}>
                                            Quên mật khẩu?
                                        </span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? "Đang xử lý..." : buttonText}
                                </button>

                                <div className="divider">
                                    <span>hoặc tiếp tục với</span>
                                </div>
                            </form>
                        )}

                        {!verificationMode && !resetPasswordMode && (
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