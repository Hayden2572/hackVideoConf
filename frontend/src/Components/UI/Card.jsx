import React from 'react';

export function Card({
                         children,
                         className = '',
                         padding = 'p-6',
                         hover = false,
                         ...props
                     }) {
    return (
        <div
            className={`card ${padding} ${
                hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : ''
            } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = '' }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

export default Card;