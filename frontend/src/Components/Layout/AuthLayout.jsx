import React from 'react';

export const AuthLayout = ({
                               children,
                               title,
                               subtitle,
                               footer
                           }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500"></div>
            <div className="absolute -bottom-0 -right-32 w-80 h-80 bg-orange-500 rounded-full opacity-60 z-0"></div>
            <div className="absolute -top-0 -left-32 w-80 h-80 bg-orange-500 rounded-full opacity-60 z-0"></div>
            {/* Контент поверх всего */}
            <div className="w-full max-w-md relative z-10">
                <div className="card p-8 animate-slide-up">
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
};