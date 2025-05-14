import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Login from './auth/authLogin.jsx'
import SignUp from './auth/authSignUp.jsx'

import AdminHome from './admin/adminHome.jsx'
import AdminBookManage from './admin/adminBookManage.jsx'
import AdminUserProfiles from './admin/adminUserProfiles.jsx'
import AdminHistoryLogs from './admin/adminHistoryLogs.jsx'
import AdminBorrowBook from './admin/adminBorrowBook.jsx'
import AdminBookReturn from './admin/adminBookReturn.jsx'
import AdminNotification from './admin/adminNotification.jsx'
import AdminSettings from './admin/adminSettings.jsx'
import AdminReturnedBook from './admin/adminReturnList.jsx'

import UserUserProfiles from './user/userUserProfiles.jsx'
import UserHome from './user/userHome.jsx'
import UserSettings from './user/userSettings.jsx'
import UserNotification from './user/userNotification.jsx'
import UserHistoryLogs from './user/userHistoryLogs.jsx'
import UserBorrowBook from './user/userBorrowBook.jsx'
import UserBookReturn from './user/userBookReturn.jsx'
import UserBookManage from './user/userBookManage.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/signup" element={<SignUp/>} />

        
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/bookManage" element={<AdminBookManage />} />
        <Route path="/admin/userProfiles" element={<AdminUserProfiles />} />
        <Route path="/admin/historyLogs" element={<AdminHistoryLogs />} />
        <Route path="/admin/borrowBooks" element={<AdminBorrowBook />} />
        <Route path="/admin/bookReturn" element={<AdminBookReturn />} />
        <Route path="/admin/notification" element={<AdminNotification />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/bookReturnList" element={<AdminReturnedBook />} />
        
        {/* User Routes */}

        <Route path="/user" element={<UserHome />} />
        <Route path="/user/userProfiles" element={<UserUserProfiles />} />
        <Route path="/user/settings" element={<UserSettings />} />
        <Route path="/user/notification" element={<UserNotification />} />
        <Route path="/user/historyLogs" element={<UserHistoryLogs />} />
        <Route path="/user/borrowBooks" element={<UserBorrowBook />} />
        <Route path="/user/bookReturn" element={<UserBookReturn />} />
        <Route path="/user/bookManage" element={<UserBookManage />} />





        
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
