import React from 'react';

export const AuthHeader = ({ icon, title, subtitle }) => {
    return (
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {icon}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
        </div>
    );
};

export const DashboardHeader = ({ user, onLogout }) => {
    return (
        <header className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
                    <p className="text-gray-600 mt-1">Добро пожаловать в систему</p>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-700">👋 {user?.email}</span>
                    <button
                        onClick={onLogout}
                        className="btn-secondary flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Выйти</span>
                    </button>
                </div>
            </div>
        </header>
    );
};