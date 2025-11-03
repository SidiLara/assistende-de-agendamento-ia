
import * as React from 'react';
import { AssistenteModel } from '../modelos/AssistenteModel';

interface FormularioAssistenteProps {
    assistente: AssistenteModel | null;
    onSalvar: (assistente: Omit<AssistenteModel, 'id'>) => void;
    onCancelar: () => void;
}

export const FormularioAssistente: React.FC<FormularioAssistenteProps> = ({ assistente, onSalvar, onCancelar }) => {
    const [nome, setNome] = React.useState(assistente?.nome || '');
    const [prompt, setPrompt] = React.useState(assistente?.prompt || '');
    const [avatar, setAvatar] = React.useState(assistente?.avatar || '');
    const [webhook, setWebhook] = React.useState(assistente?.webhook || '');
    const [origem, setOrigem] = React.useState(assistente?.origem || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSalvar({
            nome,
            prompt,
            avatar,
            webhook,
            origem,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-4">{assistente ? 'Editar Assistente' : 'Adicionar Assistente'}</h2>
            <div className="mb-4">
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                    type="text"
                    id="nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Prompt</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={4}
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">URL do Avatar</label>
                <input
                    type="text"
                    id="avatar"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="webhook" className="block text-sm font-medium text-gray-700">Webhook</label>
                <input
                    type="text"
                    id="webhook"
                    value={webhook}
                    onChange={e => setWebhook(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="origem" className="block text-sm font-medium text-gray-700">Origem</label>
                <input
                    type="text"
                    id="origem"
                    value={origem}
                    onChange={e => setOrigem(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onCancelar}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Salvar
                </button>
            </div>
        </form>
    );
};
