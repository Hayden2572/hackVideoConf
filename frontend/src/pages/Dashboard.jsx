import React, { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { authService } from '../services/authService';

export default function Dashboard(){
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getProfile();
                setUser(userData);
            } catch (error) {
                console.error('Error loading profile:', error);
                setUser({
                    id: 1,
                    email: 'user@example.com',
                    name: 'Пользователь'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const createRoom = () => {
        if (roomName.trim()) {
            // Генерируем ID комнаты из названия
            const roomId = roomName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
            navigate(`/room/${roomId}`);
        }
    };

    const joinRoom = () => {
        if (roomCode.trim()) {
            navigate(`/room/${roomCode}`);
        }
    };

    const quickJoin = (roomId) => {
        navigate(`/room/${roomId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка...</p>
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
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">AC</span>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">AxenixConf</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link className="text-sm text-gray-500 hover:text-gray-700" to='/profile'>{user.name}</Link>
                            <button className="bg-orange-400 rounded-lg px-3 py-1">
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Видеоконференции
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Простая и надежная платформа для видеовстреч
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={() => setShowCreateRoom(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
                        >
                            🎥 Новая встреча
                        </button>
                        <button
                            onClick={() => setShowJoinRoom(true)}
                            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium transition-colors"
                        >
                            🔗 Присоединиться
                        </button>
                    </div>
                </div>

                {/* Модалка создания комнаты */}
                {showCreateRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Создать комнату</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Название комнаты
                                    </label>
                                    <input
                                        type="text"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        placeholder="Введите название"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={createRoom}
                                        disabled={!roomName.trim()}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
                                    >
                                        Создать
                                    </button>
                                    <button
                                        onClick={() => setShowCreateRoom(false)}
                                        className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модалка входа в комнату */}
                {showJoinRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Присоединиться к встрече</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Код или ссылка комнаты
                                    </label>
                                    <input
                                        type="text"
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value)}
                                        placeholder="Введите код комнаты"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={joinRoom}
                                        disabled={!roomCode.trim()}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
                                    >
                                        Присоединиться
                                    </button>
                                    <button
                                        onClick={() => setShowJoinRoom(false)}
                                        className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Быстрый доступ к тестовым комнатам */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Быстрый старт</h2>
                    <p className="text-gray-600 mb-4">
                        Протестируйте функциональность в демо-комнатах:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => quickJoin('demo-room-1')}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                        >
                            <div className="text-lg font-medium mb-2">Демо комната 1</div>
                            <div className="text-sm text-gray-600">Тестовая комната для разработки</div>
                        </button>

                        <button
                            onClick={() => quickJoin('demo-room-2')}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                        >
                            <div className="text-lg font-medium mb-2">Демо комната 2</div>
                            <div className="text-sm text-gray-600">Вторая тестовая комната</div>
                        </button>

                        <button
                            onClick={() => quickJoin('meeting-room')}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                        >
                            <div className="text-lg font-medium mb-2">Рабочая встреча</div>
                            <div className="text-sm text-gray-600">Комната для рабочих встреч</div>
                        </button>
                    </div>
                </div>

                {/* Инструкция */}
                <div className="bg-blue-50 rounded-lg p-6 mt-8">
                    <h3 className="text-lg font-semibold mb-3">Как начать:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Нажмите "Новая встреча" чтобы создать комнату</li>
                        <li>Или "Присоединиться" чтобы войти по коду</li>
                        <li>Разрешите доступ к камере и микрофону</li>
                        <li>Наслаждайтесь видеозвонком!</li>
                    </ol>
                </div>
            </main>
        </div>
    );
};