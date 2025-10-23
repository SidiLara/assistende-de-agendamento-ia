import React from 'react';

export const ChatHeader: React.FC = () => {
    return (
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-2xl">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img
                        className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                        src="https://img.freepik.com/fotos-premium/centro-de-atendimento-de-homem-feliz-e-sorriso-de-retrato-no-suporte-de-atendimento-ao-cliente-ou-telemarketing-no-escritorio-pessoa-do-sexo-masculino-amigavel-ou-agente-consultor-sorrindo-para-assistente-virtual-ou-aconselhamento-on-line-no-local-de-trabalho_590464-184673.jpg"
                        alt="Sidinei Lara"
                    />
                    <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-brand-green ring-2 ring-white"></span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800">Assistente de Pré-Consultoria</h1>
                    <p className="text-sm text-gray-500">Sidinei Lara, Consultor Ademicon</p>
                </div>
            </div>
            <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiiw-fX7YI8T1mTq9-fy5LO22TH0xu_VPu9g&s"
                alt="Logo Ademicon" 
                className="w-12 h-12 rounded-full object-cover"
            />
        </div>
    );
};