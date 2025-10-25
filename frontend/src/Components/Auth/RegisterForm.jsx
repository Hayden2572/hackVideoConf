import React, { useState } from 'react';
import { authService } from '@services/authService';
import Input from '@components/UI/Input';
import Button from '@components/UI/Button';
import Alert from '@components/UI/Alert';

export default function RegisterForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            setLoading(false);
            return;
        }

        try {
            await authService.register({
                email: formData.email,
                password: formData.password
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка при регистрации');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <Alert variant="error">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </Alert>
            )}

            <Input
                label="Email адрес"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                disabled={loading}
            />

            <Input
                label="Пароль"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Минимум 6 символов"
                required
                disabled={loading}
            />

            <Input
                label="Подтвердите пароль"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Повторите ваш пароль"
                required
                disabled={loading}
            />

            <Button
                type="submit"
                loading={loading}
                className="w-full"
            >
                Создать аккаунт
            </Button>
        </form>
    );
}