import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ToastContainer from './components/ToastContainer';

import Home from "./page/Home";
import Kanbanboard from "./page/Kanbanboard";
import Setting from "./page/Setting";
import User from "./page/User";

import Login from "./page/Login";
import Register from "./page/Register";

function App() {
  return (
    <>
      <Routes>
        
        {/* PHẦN 1: Tầng Auth (Không Sidebar) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* PHẦN 2: Tầng Private (Bảo mật, Có Sidebar) */}
        <Route element={<MainLayout />}>
          {/* Gõ / (Trang chủ) mặc định ăn vào Home.jsx */}
          <Route path="/" element={<Home />} />
          {/* Gõ /kanban ăn vào Kanbanboard.jsx */}
          <Route path="/kanban" element={<Kanbanboard />} />
          <Route path="/user" element={<User />} />
          <Route path="/setting" element={<Setting />} />
        </Route>

      </Routes>
      <ToastContainer />
    </>
  )
}

export default App;
