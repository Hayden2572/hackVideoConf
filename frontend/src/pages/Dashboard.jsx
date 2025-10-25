import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { DashboardLayout } from '../components/Layout/DashboardLayout'; // Импортируйте layout
import RecentRooms from '../components/Dashboard/RecentRooms';
import QuickAccessPanel from '../components/Dashboard/QuickAccessPanel';
import CreateRoomModal from '../components/Dashboard/CreateRoomModal';
import JoinRoomModal from '../components/Dashboard/JoinRoomModal';
import { PageLoader } from '../components/UI/Loading';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
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

    if (loading) {
        return <PageLoader text="Загрузка главной страницы..." />;
    }

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
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
                <div className="lg:col-span-2">
                    <RecentRooms />
                </div>

                <div className="space-y-6">
                    <QuickAccessPanel />
                </div>
            </div>


            {showCreateRoom && (
                <CreateRoomModal
                    onClose={() => setShowCreateRoom(false)}
                />
            )}

            {showJoinRoom && (
                <JoinRoomModal
                    onClose={() => setShowJoinRoom(false)}
                />
            )}
        </DashboardLayout>
    );
}