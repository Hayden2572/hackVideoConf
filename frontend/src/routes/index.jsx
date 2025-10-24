import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/Common/PrivateRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Dashboard from '../pages/Dashboard';
import { tokenService } from '../utils/tokenService';

const AppRoutes = () => {
    //const isAuthenticated = tokenService.hasToken() && !tokenService.isTokenExpired();
    const isAuthenticated = true;{/*Удалить и расскоментить*/}

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
                }
            />
            <Route
                path="/register"
                element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
                }
            />

            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />

            <Route
                path="/"
                element={
                    <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;