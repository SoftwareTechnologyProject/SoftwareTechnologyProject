import { Link, useNavigate } from "react-router-dom";
import logoImage from "../../assets/logo/logo2.png";
import { useState, useContext } from "react";
import './ResetPassword.css';
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";

const ResetPassword = () => {
    const [step, setStep] = useState(1); // 1: enter email, 2: enter OTP and new password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { backendURL } = useContext(AppContext);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${backendURL}/auth/send-reset-otp?email=${email}`);
            if (response.status === 200) {
                toast.success("OTP sent to your email.");
                setStep(2);
            }
        } catch (error) {
            toast.error("Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
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
                toast.success("Password reset successfully. Please log in.");
                navigate("/login");
            }
        } catch (error) {
            toast.error("Failed to reset password. Please check OTP and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page-wrapper">
            {/* Logo Section */}
            <div className="reset-password-logo-section">
                <Link to="/" className="reset-password-logo-link">
                    <img src={logoImage} alt="logo" className="reset-password-logo-img" />
                    <span className="reset-password-logo-text">Elitibook</span>
                </Link>
            </div>

            {/* Form Card */}
            <div className="reset-password-form-card">
                <h2 className="reset-password-title">Reset Password</h2>

                {step === 1 && (
                    <form onSubmit={handleSendOTP}>
                        <div className="reset-password-form-group">
                            <label htmlFor="email" className="reset-password-label">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="reset-password-input"
                                placeholder="Enter your email"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                value={email}
                            />
                        </div>

                        <button
                            type="submit"
                            className="reset-password-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="reset-password-form-group">
                            <label htmlFor="otp" className="reset-password-label">
                                OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                className="reset-password-input"
                                placeholder="Enter OTP from email"
                                required
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp}
                            />
                        </div>

                        <div className="reset-password-form-group">
                            <label htmlFor="newPassword" className="reset-password-label">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                className="reset-password-input"
                                placeholder="Enter new password"
                                required
                                onChange={(e) => setNewPassword(e.target.value)}
                                value={newPassword}
                            />
                        </div>

                        <div className="reset-password-form-group">
                            <label htmlFor="confirmPassword" className="reset-password-label">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="reset-password-input"
                                placeholder="Confirm new password"
                                required
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                            />
                        </div>

                        <button
                            type="submit"
                            className="reset-password-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <p className="reset-password-toggle-text">
                    Remember your password?{" "}
                    <Link to="/login" className="reset-password-toggle-link">
                        Login here
                    </Link>{" "}
                    ❤️
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;