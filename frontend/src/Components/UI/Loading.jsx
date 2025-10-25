import React from 'react';

export function LoadingSpinner({
                                   size = 'md',
                                   className = ''
                               }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`${sizes[size]} border-2 border-primary-500 border-t-transparent rounded-full animate-spin ${className}`} />
    );
}

export function PageLoader({ text = 'Загрузка...' }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
            <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-white text-lg">{text}</p>
            </div>
        </div>
    );
}

export default LoadingSpinner;