import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import AuthLayout from '../components/Layout/AuthLayout';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    function handleLoginSuccess() {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
    }

    const footer = (
        <p className="text-gray-600">
            Нет аккаунта?{' '}
            <Link
                to="/register"
                className="text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200"
            >
                Создать аккаунт
            </Link>
        </p>
    );

    return (
        <AuthLayout
            title="С возвращением"
            subtitle="Войдите в свой аккаунт чтобы продолжить"
            footer={footer}
        >
            <LoginForm onSuccess={handleLoginSuccess} />
        </AuthLayout>
    );
}