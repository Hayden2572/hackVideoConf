import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { roomService } from '../services/roomService';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [creatingRoom, setCreatingRoom] = useState(false);
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
                    email: 'demo@example.com',
                    name: 'Демо пользователь'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            navigate('/login');
        }
    };

    const createRoom = async () => {
        if (!roomName.trim()) return;

        setCreatingRoom(true);
        try {
            const roomData = {
                roomName: roomName.trim(),
                description: `Комната для встречи: ${roomName}`,
                maxParticipants: 10
            };

            const createdRoom = await roomService.createRoom(roomData);
            navigate(`/room/${createdRoom.roomId}`);

        } catch (error) {
            console.error('Error creating room:', error);
            const localRoomId = roomName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
            navigate(`/room/${localRoomId}`);
        } finally {
            setCreatingRoom(false);
            setShowCreateRoom(false);
            setRoomName('');
        }
    };

    const joinRoom = async () => {
        if (!roomCode.trim()) return;

        try {
            const isValid = await roomService.validateRoom(roomCode.trim());

            if (!isValid) {
                alert('Комната не найдена. Проверьте код комнаты.');
                return;
            }

            navigate(`/room/${roomCode.trim()}`);

        } catch (error) {
            console.error('Error joining room:', error);
            navigate(`/room/${roomCode.trim()}`);
        } finally {
            setShowJoinRoom(false);
            setRoomCode('');
        }
    };

    const quickJoin = (roomId) => {
        navigate(`/room/${roomId}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Сегодня';
        } else if (diffDays === 1) {
            return 'Вчера';
        } else if (diffDays < 7) {
            return `${diffDays} дней назад`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
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
                            <div className="flex items-center space-x-2">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                )}
                                <Link
                                    className="text-sm text-gray-700 hover:text-gray-900 hover:underline font-medium"
                                    to='/profile'
                                >
                                    {user.name || user.email}
                                </Link>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-orange-400 hover:bg-orange-500 text-white rounded-lg px-3 py-1 text-sm transition-colors"
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Видеоконференции
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Простая и надежная платформа для видеовстреч с поддержкой WebRTC
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={() => setShowCreateRoom(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center space-x-3 shadow-lg"
                        >
                            <span className="text-xl">🎥</span>
                            <span>Новая встреча</span>
                        </button>
                        <button
                            onClick={() => setShowJoinRoom(true)}
                            className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center space-x-3"
                        >
                            <span className="text-xl">🔗</span>
                            <span>Присоединиться</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Недавние комнаты */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Недавние комнаты</h2>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {recentRooms.length} комнат
                                </span>
                            </div>

                            {recentRooms.length > 0 ? (
                                <div className="space-y-4">
                                    {recentRooms.map((room) => (
                                        <button
                                            key={room.id}
                                            onClick={() => quickJoin(room.id, room.name)}
                                            className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group hover:shadow-md"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                        <span className="text-blue-600 text-lg">🎪</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                                            {room.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-mono">
                                                            {room.id}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                    {formatDate(room.lastJoined)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">🎪</div>
                                    <p className="text-gray-500 mb-2">У вас пока нет недавних комнат</p>
                                    <p className="text-sm text-gray-400">Создайте свою первую встречу!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Быстрый доступ и инструкция */}
                    <div className="space-y-6">
                        {/* Быстрый старт */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Быстрый старт</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => quickJoin('demo-room-1', 'Демо комната 1')}
                                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                                >
                                    <div className="font-medium text-gray-900">🚀 Демо комната 1</div>
                                    <div className="text-sm text-gray-600">Тестирование функционала</div>
                                </button>

                                <button
                                    onClick={() => quickJoin('demo-room-2', 'Демо комната 2')}
                                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                                >
                                    <div className="font-medium text-gray-900">🎯 Демо комната 2</div>
                                    <div className="text-sm text-gray-600">Резервная комната</div>
                                </button>

                                <button
                                    onClick={() => quickJoin('team-meeting', 'Командная встреча')}
                                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                                >
                                    <div className="font-medium text-gray-900">👥 Командная встреча</div>
                                    <div className="text-sm text-gray-600">Для рабочих обсуждений</div>
                                </button>
                            </div>
                        </div>

                        {/* Инструкция */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-3 text-blue-900">📋 Как начать:</h3>
                            <ol className="space-y-2 text-blue-800">
                                <li className="flex items-start space-x-2">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold">1</span>
                                    <span>Создайте встречу или присоединитесь по коду</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold">2</span>
                                    <span>Разрешите доступ к камере и микрофону</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold">3</span>
                                    <span>Пригласите участников по ссылке</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold">4</span>
                                    <span>Наслаждайтесь видеозвонком!</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Модалки */}
                {showCreateRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Создать новую встречу</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Название встречи
                                    </label>
                                    <input
                                        type="text"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        placeholder="Например: Командная планерка"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={createRoom}
                                        disabled={!roomName.trim() || creatingRoom}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center font-medium"
                                    >
                                        {creatingRoom ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Создание...
                                            </>
                                        ) : (
                                            'Создать встречу'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowCreateRoom(false)}
                                        disabled={creatingRoom}
                                        className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showJoinRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Присоединиться к встрече</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Код или ID комнаты
                                    </label>
                                    <input
                                        type="text"
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value)}
                                        placeholder="Введите код комнаты..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={joinRoom}
                                        disabled={!roomCode.trim()}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                                    >
                                        Присоединиться
                                    </button>
                                    <button
                                        onClick={() => setShowJoinRoom(false)}
                                        className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};