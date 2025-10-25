import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardHeader({ user, onLogout }) {
    return (
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
                            onClick={onLogout}
                            className="bg-orange-400 hover:bg-orange-500 text-white rounded-lg px-3 py-1 text-sm transition-colors"
                        >
                            Выйти
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}