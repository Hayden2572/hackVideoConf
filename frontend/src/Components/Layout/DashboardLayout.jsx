import React from 'react';
import {Link} from 'react-router-dom';

export const DashboardLayout = ({
                                    children,
                                    user,
                                    onLogout
                                }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                {/* Большие круги */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-200 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-300 rounded-full opacity-30 blur-lg"></div>
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-orange-300 rounded-full opacity-25 blur-lg"></div>

                {/* Средние круги */}
                <div className="absolute top-1/3 left-10 w-48 h-48 bg-orange-400 rounded-full opacity-20 blur-md"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-amber-400 rounded-full opacity-25 blur-md"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-orange-500 rounded-full opacity-15 blur-sm"></div>

                {/* Эллипсы */}
                <div className="absolute top-40 left-1/4 w-72 h-48 bg-gradient-to-r from-orange-300 to-amber-400 rounded-full opacity-15 blur-lg transform rotate-12"></div>
                <div className="absolute bottom-40 right-1/4 w-64 h-32 bg-gradient-to-l from-orange-400 to-amber-500 rounded-full opacity-20 blur-md transform -rotate-6"></div>
                <div className="absolute top-2/3 left-20 w-56 h-40 bg-gradient-to-br from-orange-200 to-amber-300 rounded-full opacity-25 blur-sm transform rotate-45"></div>

                {/* Маленькие кружочки */}
                <div className="absolute top-16 left-1/2 w-16 h-16 bg-orange-300 rounded-full opacity-30 blur-sm"></div>
                <div className="absolute bottom-32 left-32 w-12 h-12 bg-amber-500 rounded-full opacity-40 blur-sm"></div>
                <div className="absolute top-3/4 right-40 w-20 h-20 bg-orange-400 rounded-full opacity-25 blur"></div>
                <div className="absolute top-10 left-40 w-8 h-8 bg-amber-600 rounded-full opacity-35"></div>
                <div className="absolute bottom-16 right-16 w-10 h-10 bg-orange-500 rounded-full opacity-30 blur-sm"></div>

                <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-tr from-orange-400 to-amber-500 rounded-full opacity-20 blur-md animate-pulse"></div>
                <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-gradient-to-bl from-amber-400 to-orange-300 rounded-full opacity-15 blur-lg"></div>
            </div>

            {/* Основной контент */}
            <div className="relative z-10">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-lg border-b border-orange-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">VC</span>
                                        </div>
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                            AxenixConf
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-2 bg-orange-50 rounded-lg px-3 py-2 border border-orange-100 hover:bg-orange-100 hover:border-orange-200 transition-all duration-200 group cursor-pointer"
                                >
                                    <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center group-hover:from-orange-600 group-hover:to-amber-600 transition-all duration-200">
                                        <span className="text-white text-xs font-medium">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-orange-800 font-medium group-hover:text-orange-900">
                                        {user?.email || 'user@example.com'}
                                    </span>
                                </Link>
                                <button
                                    onClick={onLogout}
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
        </div>
    );
};