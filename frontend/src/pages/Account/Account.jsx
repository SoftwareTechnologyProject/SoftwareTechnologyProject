import React, { useState, useEffect } from "react"

import rank from "../../assets/banner/rank-banner.png"

import "../../pages/HomePage/HomePage.css";
import "../../pages/Account/Account.css"

const Account = () => {

    const [formData, setFormData] = useState({
        ho: 'Nguyễn',
        ten: 'Thịnh',
        phone: '0336289549',
        email: '',
        gender: 'Nam',
        day: '17',
        month: '07',
        year: '2005',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Dữ liệu đã lưu:', formData);
        alert('Đã lưu thay đổi!');
    };

    return (
        <>
            <main>
                <div className="account-main">
                    <div className="account-rank">
                        <img src={rank} alt="rank customer" />
                    </div>
                    <div className="account-info">
                        <h1 className="text-xl md:text-2xl text-gray-700 font-medium mb-8">
                            Hồ sơ cá nhân
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Field: Họ */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                    Họ<span className="text-red-500">*</span>
                                </label>
                                <div className="md:col-span-8">
                                    <input
                                        type="text"
                                        name="ho"
                                        value={formData.ho}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Field: Tên */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                    Tên<span className="text-red-500">*</span>
                                </label>
                                <div className="md:col-span-8">
                                    <input
                                        type="text"
                                        name="ten"
                                        value={formData.ten}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Field: Số điện thoại */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                    Số điện thoại
                                </label>
                                <div className="md:col-span-8 relative">
                                    <div className="flex items-center justify-between w-full border border-gray-300 rounded px-3 py-2">
                                        <span className="text-gray-700">{formData.phone}</span>
                                        <button type="button" className="text-blue-500 hover:underline text-sm">
                                            Thay đổi
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Field: Email */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                    Email
                                </label>
                                <div className="md:col-span-8">
                                    <div className="flex items-center justify-between w-full border border-gray-300 rounded px-3 py-2">
                                        <span className="text-gray-400">
                                            {formData.email || 'Chưa có email'}
                                        </span>
                                        <button type="button" className="text-blue-500 hover:underline text-sm">
                                            Thêm mới
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Field: Giới tính */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                    Giới tính<span className="text-red-500">*</span>
                                </label>
                                <div className="md:col-span-8 flex items-center space-x-6">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Nam"
                                            checked={formData.gender === 'Nam'}
                                            onChange={handleChange}
                                            className="form-radio text-red-600 focus:ring-red-500 h-4 w-4 accent-red-600"
                                        />
                                        <span className="text-gray-700">Nam</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Nữ"
                                            checked={formData.gender === 'Nữ'}
                                            onChange={handleChange}
                                            className="form-radio text-red-600 focus:ring-red-500 h-4 w-4 accent-red-600"
                                        />
                                        <span className="text-gray-700">Nữ</span>
                                    </label>
                                </div>
                            </div>

                            {/* Field: Birthday */}
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 md:gap-4">
                                <label className="md:col-span-2 text-gray-600">
                                    Birthday<span className="text-red-500">*</span>
                                </label>
                                <div className="md:col-span-8 grid grid-cols-3 gap-4">
                                    <div className="border border-gray-300 rounded px-3 py-2 flex justify-center">
                                        <input
                                            type="text"
                                            name="day"
                                            value={formData.day}
                                            onChange={handleChange}
                                            className="w-full text-center outline-none text-gray-700"
                                        />
                                    </div>
                                    <div className="border border-gray-300 rounded px-3 py-2 flex justify-center">
                                        <input
                                            type="text"
                                            name="month"
                                            value={formData.month}
                                            onChange={handleChange}
                                            className="w-full text-center outline-none text-gray-700"
                                        />
                                    </div>
                                    <div className="border border-gray-300 rounded px-3 py-2 flex justify-center">
                                        <input
                                            type="text"
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            className="w-full text-center outline-none text-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 flex justify-center">
                                <button
                                    type="submit"
                                    className="bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-8 rounded shadow-sm transition-colors"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main >
        </>
    )
}

export default Account;