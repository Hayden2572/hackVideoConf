import React from 'react';

export default function AuthLayout({
                                       children,
                                       title,
                                       subtitle,
                                       footer
                                   }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4 relative overflow-hidden z-0">

            <div className="absolute -right-48 w-150 h-150 bg-orange-500 rounded-full opacity-100  z-10"></div>
            <div className="absolute -top-1/4 -left-100 w-200 h-200 bg-orange-400 rounded-full opacity-100 z-10"></div>
            <div className="absolute  -bottom-0 -left-0 w-100 h-100 bg-orange-400 rounded-full opacity-100 z-10"></div>

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