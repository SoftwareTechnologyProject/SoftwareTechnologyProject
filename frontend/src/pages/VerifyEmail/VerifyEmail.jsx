import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logoImage from "../../assets/logo/logo2.png";
import { useState, useContext, useEffect } from "react";
import './VerifyEmail.css';
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(true);

    const { backendURL } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                toast.error("Invalid verification link.");
                navigate("/");
                return;
            }
            try {
                const response = await axios.post(`${backendURL}/auth/verify-email?token=${token}`);
                if (response.status === 200) {
                    toast.success("Email verified successfully. You can now log in.");
                    navigate("/login");
                }
            } catch (error) {
                toast.error("Verification failed. Please try again.");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token, backendURL, navigate]);

    return (
        <div className="verify-email-page-wrapper">
            {/* Logo Section */}
            <div className="verify-email-logo-section">
                <Link to="/" className="verify-email-logo-link">
                    <img src={logoImage} alt="logo" className="verify-email-logo-img" />
                    <span className="verify-email-logo-text">Elitibook</span>
                </Link>
            </div>

            {/* Form Card */}
            <div className="verify-email-form-card">
                <h2 className="verify-email-title">Verifying Email</h2>

                {loading ? (
                    <p>Please wait while we verify your email...</p>
                ) : (
                    <p>Redirecting...</p>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;