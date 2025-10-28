import React from 'react';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex justify-start">
            <div className="px-5 py-4 shadow bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-lg">
                <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></span>
                </div>
            </div>
        </div>
    );
};