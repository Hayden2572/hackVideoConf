import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenService } from '../../utils/tokenService';

export default function PrivateRoute({ children }){
    const location = useLocation();
    const isAuthenticated = tokenService.hasToken() && !tokenService.isTokenExpired();


    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
