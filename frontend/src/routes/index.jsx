import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/Common/PrivateRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Dashboard from '../pages/Dashboard';
import VideoRoomPage from '../pages/VideoRoomPage';
import ProfilePage from '../pages/ProfilePage';
import { tokenService } from '../utils/tokenService';

export default function AppRoutes(){
    const isAuthenticated = tokenService.hasToken() && !tokenService.isTokenExpired();
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
                path="/profile"
                element={
                    <PrivateRoute>
                        <ProfilePage />
                    </PrivateRoute>
                }
            />

            <Route
                path="/"
                element={
                    <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                }
            />
            <Route
                path="/room/:roomId"
                element={
                    <PrivateRoute>
                        <VideoRoomPage />
                    </PrivateRoute>
                }
            />
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};