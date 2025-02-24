import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import Noticelist from './Noticelist.tsx'
import Userlist from './Userlist.tsx';
import Login from './Login.tsx';
import ResetPassword from './ResetPassword.tsx';
import ResetPasswordConfirm from './ResetPasswordConfirm.tsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/Noticelist" element={<Noticelist />} />
        <Route path="/Userlist" element={<Userlist />}/>
        <Route path="/Login" element={<Login />}/>
        <Route path="ResetPassword" element={<ResetPassword/>}/>
        <Route path="ResetPasswordConfirm" element={<ResetPasswordConfirm/>}/>
        {/* <App /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
