import React from 'react';

export default function AuthLayout({
                                       children,
                                       title,
                                       subtitle,
                                       footer
                                   }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Оранжевые круги на заднем фоне */}
            <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-orange-500 rounded-full opacity-20 blur-xl z-0"></div>
            <div className="absolute -top-48 -left-48 w-96 h-96 bg-orange-400 rounded-full opacity-15 blur-xl z-0"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 animate-slide-up">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                        <p className="text-gray-600">{subtitle}</p>
                    </div>

                    {/* Content */}
                    {children}

                    {/* Footer */}
                    {footer && (
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}