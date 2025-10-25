import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';
import AuthLayout from '../components/Layout/AuthLayout';

export default function RegisterPage() {
    const navigate = useNavigate();

    function handleRegisterSuccess() {
        navigate('/login', {
            state: { message: 'Регистрация успешна! Теперь вы можете войти.' }
        });
    }

    const footer = (
        <p className="text-gray-600">
            Уже есть аккаунт?{' '}
            <Link
                to="/login"
                className="text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200"
            >
                Войти в систему
            </Link>
        </p>
    );

    return (
        <AuthLayout
            title="Создать аккаунт"
            subtitle="Зарегистрируйтесь чтобы начать работу"
            footer={footer}
        >
            <RegisterForm onSuccess={handleRegisterSuccess} />
        </AuthLayout>
    );
}