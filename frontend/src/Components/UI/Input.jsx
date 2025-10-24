import React from 'react';

export const Input = ({
                          label,
                          type = 'text',
                          error,
                          className = '',
                          ...props
                      }) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`input-field ${error ? 'border-red-300 focus:ring-red-500' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="text-red-600 text-sm">{error}</p>
            )}
        </div>
    );
};