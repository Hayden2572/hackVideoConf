import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import DashboardHero from '../components/Dashboard/DashboardHero';
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
                // Fallback demo data
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
        return <PageLoader text="Загрузка профиля..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                user={user}
                onLogout={handleLogout}
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DashboardHero
                    onCreateRoom={() => setShowCreateRoom(true)}
                    onJoinRoom={() => setShowJoinRoom(true)}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <RecentRooms />
                    </div>

                    <div className="space-y-6">
                        <QuickAccessPanel />
                    </div>
                </div>
            </main>

            {/* Modals */}
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
        </div>
    );
}