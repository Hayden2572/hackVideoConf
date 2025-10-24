import React from 'react';

export const DashboardLayout = ({
                                    children,
                                    user,
                                    onLogout
                                }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-bold text-gray-900">Панель управления</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">👋 {user?.email}</span>
                            <button
                                onClick={onLogout}
                                className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};