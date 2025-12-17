import { createContext, useState} from "react";
// Đảm bảo đường dẫn này là đúng:
import { AppConstants } from "../util/constant.jsx"; 
// import toast from "react-hot-toast";


export const AppContext = createContext({
    // Khai báo giá trị mặc định để tránh lỗi destructuring
    backendURL: AppConstants.BACKEND_URL,
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    userData: null,
    setUserData: () => {},
});

export const AppContextProvider = (props) => {

    // 🏆 FIX 1: Lấy backendURL trực tiếp từ AppConstants (đã import)
    const backendURL = AppConstants.BACKEND_URL;
    
    // 🏆 FIX 2: Khai báo state trong Provider (bỏ comment và sửa lỗi type)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // userData nên là null hoặc object rỗng, không phải false
    const [userData, setUserData] = useState(null); 

    const contextValue = {
        backendURL,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData
    };
    
    return (
        <AppContext.Provider value={contextValue}>
            {props.children}
        </AppContext.Provider>
    );
};