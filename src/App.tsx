import { Header } from './componentes/Header';
import { ChatInput } from './componentes/ChatInput';
import { ChatWindow } from './componentes/ChatWindow';
import { PillContainer } from './componentes/PillContainer';
import { useGerenciadorDeChat } from './hooks/useGerenciadorDeChat';
import { ConfiguracaoChat } from './services/chat/modelos/ConfiguracaoChatModel';
import { ServicoChatImpl } from './services/chat/ServicoChatImpl';
import { RegraFallbackImpl } from './services/chat/RegraFallbackImpl';
import { ServicoGeminiApi } from './services/api/ServicoGeminiApi';
import { ServicoCrmApi } from './services/api/ServicoCrmApi';

const config: ConfiguracaoChat = {
    consultantName: 'Seu Nome',
    assistantName: 'Assistente de IA',
    assistantTitle: 'Qualificação de Leads com IA',
    webhookId: 'seu-webhook-id',
    perguntasChave: {
        nome: "Como posso te chamar?",
        email: "Qual é o seu melhor e-mail para contato?",
        telefone: "Poderia me informar seu número de WhatsApp para continuarmos a conversa por lá?",
        necessidades: "Para quais dos seus projetos você acredita que a IA poderia ser útil?",
        servicos: "Quais dos meus serviços mais te interessam?",
        orcamento: "Qual a sua faixa de orçamento para este projeto?"
    },
    opcoesDeServico: [
        { label: "Desenvolvimento de Chatbot", valor: "chatbot" },
        { label: "Automação de Processos", valor: "automacao" },
        { label: "Análise de Dados com IA", valor: "analise_ia" },
        { label: "Consultoria em IA", valor: "consultoria_ia" }
    ]
};

const fallbackRule = new RegraFallbackImpl();
const apiService = new ServicoGeminiApi();
const crmService = new ServicoCrmApi();
const chatService = new ServicoChatImpl(fallbackRule, apiService, crmService);

function App() {
    const {
        messages,
        isTyping,
        isSending,
        actionOptions,
        handleSendMessage,
        handlePillSelect,
    } = useGerenciadorDeChat(config, chatService);

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <Header 
                consultantName={config.consultantName}
                assistantName={config.assistantName}
                assistantTitle={config.assistantTitle}
            />
            <ChatWindow messages={messages} isTyping={isTyping} />
            <PillContainer options={actionOptions} onPillSelect={handlePillSelect} />
            <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
        </div>
    );
}

export default App;
