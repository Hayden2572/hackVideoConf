import React from 'react';

const buttonVariants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200',
};

const buttonSizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
};

export const Button = ({
                           children,
                           variant = 'primary',
                           size = 'md',
                           loading = false,
                           disabled = false,
                           className = '',
                           ...props
                       }) => {
    const variantStyles = buttonVariants[variant];
    const sizeStyles = buttonSizes[size];

    return (
        <button
            className={`${variantStyles} ${sizeStyles} ${className} ${
                !disabled && !loading && variant !== 'outline' ? 'hover:-translate-y-0.5 hover:shadow-lg' : ''
            } ${disabled || loading ? '!transform-none' : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Загрузка...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};