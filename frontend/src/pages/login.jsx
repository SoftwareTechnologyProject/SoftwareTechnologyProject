// File: Login.js

import { Link, useNavigate } from "react-router-dom";
import logoImage from "../assets/logo/logo2.png";
import { useState, useContext } from "react"; 
import './login.css';
import { AppContext } from "../context/AppContext"; 
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
  // Khai báo state
  const [isCreateAccount, setIsCreateAccount] = useState(false);
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
            dateOfBirth: dateOfBirth,
            // Các trường Account/Authentication
            email: email, 
            password: password 
        };
        
        const response = await axios.post(`${backendURL}/register`, payload);

        if (response.status === 200 || response.status === 201) {
          toast.success("Account created successfully. Please log in.");
          setIsCreateAccount(false);
          setName("");
          setPassword("");
          setPhoneNumber("");
          setAddress("");
          setDateOfBirth("");
        } else {
          toast.error("Registration failed. Try again."); 
        }
      } else {
        // Login logic
        const response = await axios.post(`${backendURL}/login`, { email, password });
        if (response.status === 200) {
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

  const handleToggle = () => {
    setIsCreateAccount((prev) => !prev);
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
          <span className="login-logo-text">Elitibook</span>
        </Link>
        
      </div>

      {/* Form Card */}
      <div className="login-form-card">
        <h2 className="login-title">{titleText}</h2>

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

        {/* Toggle Text */}
        <p className="login-toggle-text">{toggleJSX}</p>
      </div>
    </div>
  );
};

export default Login;