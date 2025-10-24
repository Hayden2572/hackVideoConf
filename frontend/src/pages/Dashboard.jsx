import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { PageLoader } from '../components/UI/Loading';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getProfile();
                setUser(userData);
            } catch (error) {
                console.error('Ошибка загрузки профиля:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (loading) {
        return <PageLoader text="Загрузка профиля..." />;
    }

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card hover className="lg:col-span-2">
                    <CardHeader>
                        <h2 className="text-2xl font-bold text-gray-900">Добро пожаловать!</h2>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Рады видеть вас в системе</p>
                    </CardContent>
                </Card>

                <Card hover>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Информация о профиле</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ID пользователя</p>
                            <p className="font-medium">{user.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Дата регистрации</p>
                            <p className="font-medium">
                                {new Date(user.created_at).toLocaleDateString('ru-RU')}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card hover>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Статистика</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-green-700">Статус</span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                Активен
              </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-blue-700">Последний вход</span>
                            <span className="text-blue-600 text-sm">
                {new Date().toLocaleTimeString('ru-RU')}
              </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;