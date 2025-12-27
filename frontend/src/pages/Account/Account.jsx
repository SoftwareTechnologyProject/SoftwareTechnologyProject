import React, { useState, useEffect } from "react"
import rank from "../../assets/banner/rank-banner.png"
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import "../../pages/HomePage/HomePage.css";
import "../../pages/Account/Account.css"
import axios from "../../config/axiosConfig";
import { showError, showSuccess } from "../../util/alert";

const Account = () => {
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [formData, setFormData] = useState({
        ho: '',
        ten: '',
        phone: '',
        email: '',
        day: '',
        month: '',
        year: '',
        currentPass: '',
        newPass: '',
        confirmPass: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault(); // ⭐ chặn reload

        try {
            const pad = (n) => String(n).padStart(2, "0");

            const payload = {
                fullName: `${formData.ho} ${formData.ten}`,
                phoneNumber: formData.phone,
                dateOfBirth: `${formData.year}-${pad(formData.month)}-${pad(formData.day)}`
            };

            const res = await axios.put("users/me/update", payload);

            showSuccess("Cập nhật thành công!");
            console.log("User mới:", res.data);

        } catch (err) {
            console.error("Lỗi cập nhật:", err);

            if (err.response?.status === 403) {
                showError("Phiên đăng nhập hết hạn");
            } else {
                showError("Cập nhật thất bại");
            }
        }
    };

    const handleChangePass = async (e) => {
        e.preventDefault();

        // ===== FRONTEND VALIDATION =====
        if (!formData.currentPass || !formData.newPass || !formData.confirmPass) {
            showError("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (formData.newPass.length < 6) {
            showError("Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }

        if (formData.newPass !== formData.confirmPass) {
            showError("Mật khẩu nhập lại không khớp");
            return;
        }

        // ===== CALL API =====
        try {
            const payload = {
                currentPass: formData.currentPass,
                newPass: formData.newPass,
                confirmPass: formData.confirmPass,
            };

            const res = await axios.patch(
                "users/me/update/password",
                payload
            );

            showSuccess("Cập nhật mật khẩu thành công");

            // reset form (tránh controlled/uncontrolled)
            setFormData({
                currentPass: "",
                newPass: "",
                confirmPass: "",
            });

        } catch (err) {
            console.error("Lỗi cập nhật:", err);

            if (err.response?.status === 403) {
                showError("Phiên đăng nhập hết hạn");
            } else if (err.response?.status === 400) {
                showError(err.response.data?.message || "Mật khẩu không hợp lệ");
            } else {
                showError("Cập nhật thất bại");
            }
        }
    };


    // 🟢 LẤY USER TỪ BACKEND /me
    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const { data: user } = await axios.get("users/me");
            const date = user.dateOfBirth
                ? user.dateOfBirth.split("T")[0]
                : "";
            const [year, month, day] = date ? date.split("-") : ["", "", ""];


            setFormData(prev => ({
                ...prev,
                ho: user.fullName?.split(" ").slice(0, -1).join(" ") || "",
                ten: user.fullName?.split(" ").slice(-1).join(" ") || "",
                phone: user.phoneNumber || "",
                email: user.email || "",
                day: day || "",
                month: month || "",
                year: year || "",
            }));


        } catch (err) {
            console.error("Lỗi lấy thông tin user:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <main>
            <div className="account-main">
                <div className="bg-[var(--components-color)] rounded-xl">
                    <div className="account-rank">
                        <img src={rank} alt="rank customer" />
                    </div>
                </div>
                <div className="account-info">
                    <h1 className="account-title">
                        Hồ sơ cá nhân
                    </h1>

                    <form onSubmit={handleSubmit} className="account-form">
                        {/* Field: Họ */}
                        <div className="form-row">
                            <label className="form-label">
                                Họ<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper">
                                <input
                                    type="text"
                                    name="ho"
                                    value={formData.ho}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Field: Tên */}
                        <div className="form-row">
                            <label className="form-label">
                                Tên<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper">
                                <input
                                    type="text"
                                    name="ten"
                                    value={formData.ten}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Field: Số điện thoại */}
                        <div className="form-row">
                            <label className="form-label">
                                Số điện thoại
                            </label>
                            <div className="form-input-wrapper">
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Field: Email */}
                        <div className="form-row">
                            <label className="form-label">
                                Email
                            </label>
                            <div className="form-input-wrapper">
                                <div
                                    className="form-input bg-gray-200"
                                >{formData.email}</div>
                            </div>
                        </div>

                        {/* Field: Birthday */}
                        <div className="form-row">
                            <label className="form-label">
                                Birthday<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper">
                                <div className="birthday-group">
                                    <input
                                        type="text"
                                        name="day"
                                        value={formData.day}
                                        onChange={handleChange}
                                        placeholder="DD"
                                        className="birthday-input"
                                    />
                                    <input
                                        type="text"
                                        name="month"
                                        value={formData.month}
                                        onChange={handleChange}
                                        placeholder="MM"
                                        className="birthday-input"
                                    />
                                    <input
                                        type="text"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        placeholder="YYYY"
                                        className="birthday-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="form-submit">
                            <button type="submit" className="btn-submit">
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
                <div className="account-info">
                    <h1 className="account-title">
                        Đổi Mật Khẩu
                    </h1>

                    <form onSubmit={handleChangePass} className="account-form">
                        <div className="form-row">
                            <label className="form-label">
                                Mật Khẩu Hiện Tại<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper password-wrapper">
                                <input
                                    type={showCurrentPass ? "text" : "password"}
                                    name="currentPass"
                                    value={formData.currentPass}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                                <span
                                    className="toggle-password"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                >
                                    {showCurrentPass ? <FaEyeSlash /> : <IoEyeSharp />}
                                </span>
                            </div>
                        </div>

                        <div className="form-row">
                            <label className="form-label">
                                Mật Khẩu Mới<span className="required">*</span>
                            </label>
                            <div className="form-input-wrapper password-wrapper">
                                <input
                                    type={showNewPass ? "text" : "password"}
                                    name="newPass"
                                    value={formData.newPass}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                                <span
                                    className="toggle-password"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                >
                                    {showNewPass ? <FaEyeSlash /> : <IoEyeSharp />}
                                </span>
                            </div>
                        </div>

                        <div className="form-row">
                            <label className="form-label">
                                Nhập Lại Mật Khẩu Mới<span className="required">*</span>
                            </label>

                            <div className="form-input-wrapper password-wrapper">
                                <input
                                    type={showConfirmPass ? "text" : "password"}
                                    name="confirmPass"
                                    value={formData.confirmPass}
                                    onChange={handleChange}
                                    className="form-input">

                                </input>

                                <span
                                    className="toggle-password"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                >
                                    {showConfirmPass ? <FaEyeSlash /> : <IoEyeSharp />}
                                </span>
                            </div>
                        </div>


                        {/* Submit Button */}
                        <div className="form-submit">
                            <button type="submit" className="btn-submit">
                                Xác Nhận
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}

export default Account;