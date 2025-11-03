import React from 'react';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-center space-x-2 self-start">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
        </div>
    );
};