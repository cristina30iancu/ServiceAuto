import Login from './components/Login';
import Home from './components/Home';
import Missing from './components/Missing';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cars from './components/Cars';
import Appointments from './components/Appointments';
import Profile from './components/Profile';
import Services from './components/Services';
import Signup from './components/Signup';
import ResetPassword from './components/ResetPassword';
import { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
        if (token) {
            try {
                const data = jwt_decode(token);
                console.log(data)
                setIsLoggedIn(true);
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
    setIsLoggedIn(localStorage.getItem('token') !== null);
  }, []);
  return (
    <>
      <ToastContainer />
      <Navigation />
      <Routes>
      <Route path="cars" element={isLoggedIn ? <Cars /> : <Login />} />
      <Route path="services" element={isLoggedIn ? <Services /> : <Login />} />
      <Route path="profile" element={isLoggedIn ? <Profile /> : <Login />} />
      <Route path="appointments" element={isLoggedIn ? <Appointments /> : <Login />} />
      <Route path="dashboard" element={isLoggedIn ? <AdminDashboard /> : <Login />} />
        <Route path="" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="home" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="login" element={<Login />} />
        <Route path="reset" element={<ResetPassword />} />
        <Route path="signup" element={<Signup />} />
        <Route path="*" element={<Missing />} />
      </Routes>
    </>
  );
}

export default App;