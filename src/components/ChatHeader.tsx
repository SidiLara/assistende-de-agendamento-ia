import React from 'react';

interface ChatHeaderProps {
    consultantName: string;
    consultantPhoto: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ consultantName, consultantPhoto }) => {
    return (
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-2xl">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img
                        className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                        src={consultantPhoto}
                        alt={consultantName}
                    />
                    <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-brand-green ring-2 ring-white"></span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800">Assistente de Pré-Consultoria</h1>
                    <p className="text-sm text-gray-500">{consultantName}, Consultor</p>
                </div>
            </div>
            <img 
                src="https://i.imgur.com/m0iSl1G.png"
                alt="Logo" 
                className="h-8"
            />
        </div>
    );
};
