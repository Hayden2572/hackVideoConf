import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [saveLoading, setSaveLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUser() {
            try {
                const userData = await authService.getProfile();
                setUser(userData);
                setFormData({
                    name: userData.name || '',
                    email: userData.email || ''
                });
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSaveProfile() {
        if (!formData.name.trim()) {
            alert('Имя не может быть пустым');
            return;
        }

        setSaveLoading(true);
        try {
            const updatedUser = await authService.updateProfile({
                name: formData.name
            });
            setUser(updatedUser);
            setEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Ошибка при сохранении профиля');
        } finally {
            setSaveLoading(false);
        }
    }

    function handleCancelEdit() {
        setFormData({
            name: user?.name || '',
            email: user?.email || ''
        });
        setEditing(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка профиля...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mr-4 text-gray-500 hover:text-gray-700"
                            >
                                ← Назад
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">Профиль пользователя</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-primary-500 px-6 py-8">
                        <div className="flex items-center space-x-6">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-2xl font-bold text-primary-500">
                                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="text-white">
                                <h1 className="text-2xl font-bold">{user?.name || 'Пользователь'}</h1>
                                <p className="text-primary-100">{user?.email}</p>
                                <p className="text-sm text-primary-200 mt-1">
                                    Участник с {new Date(user?.created_at).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Основная информация */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Имя
                                        </label>
                                        {editing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Введите ваше имя"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{user?.name || 'Не указано'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <p className="text-gray-600">{user?.email}</p>
                                        <p className="text-xs text-gray-500 mt-1">Email нельзя изменить</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ID пользователя
                                        </label>
                                        <p className="text-gray-600 font-mono text-sm">{user?.id}</p>
                                    </div>
                                </div>

                                {!editing ? (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="mt-6 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Редактировать профиль
                                    </button>
                                ) : (
                                    <div className="mt-6 flex space-x-3">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saveLoading}
                                            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            {saveLoading ? 'Сохранение...' : 'Сохранить'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Статистика и настройки */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h2>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Всего видеовстреч</span>
                                            <span className="font-semibold text-primary-600">24</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Встреч в этом месяце</span>
                                            <span className="font-semibold text-primary-600">8</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Средняя длительность</span>
                                            <span className="font-semibold text-primary-600">32 мин</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Статус аккаунта</span>
                                            <span className="font-semibold text-green-600">Активен</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Быстрые действия */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
                                    <div className="space-y-2">
                                        <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg">🔧</span>
                                                <span>Настройки видео и аудио</span>
                                            </div>
                                        </button>
                                        <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg">🔒</span>
                                                <span>Безопасность и пароль</span>
                                            </div>
                                        </button>
                                        <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg">📱</span>
                                                <span>Настройки уведомлений</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* История активности */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Последняя активность</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">🎥</span>
                                        <div>
                                            <p className="font-medium">Участие во встрече "Ежедневный стендап"</p>
                                            <p className="text-sm text-gray-500">Сегодня, 10:00 - 10:30</p>
                                        </div>
                                    </div>
                                    <span className="text-green-600 text-sm font-medium">Завершено</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">💬</span>
                                        <div>
                                            <p className="font-medium">Сообщение в чате комнаты "Рабочая встреча"</p>
                                            <p className="text-sm text-gray-500">Вчера, 15:20</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">🚪</span>
                                        <div>
                                            <p className="font-medium">Вход в систему</p>
                                            <p className="text-sm text-gray-500">Вчера, 09:15</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}