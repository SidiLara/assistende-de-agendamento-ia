import { ConfiguracaoChat } from './modelos/ConfiguracaoChatModel';
import { Lead } from './modelos/LeadModel';
import { Mensagem } from './modelos/MensagemModel';

export class ChatPrompts {
    static construirPrompt(config: ConfiguracaoChat, lead: Lead, historico: Mensagem[]): string {
        const historicoFormatado = historico.map(msg => `${msg.remetente}: ${msg.texto}`).join('\n');
        const leadString = JSON.stringify(lead, null, 2);

        return `
            Você é ${config.assistantName}, um assistente de IA treinado para ajudar ${config.consultantName} a qualificar leads.
            Seu objetivo é coletar informações do lead de forma natural e amigável, preenchendo o seguinte objeto JSON:
            ${leadString}

            O lead já forneceu as seguintes informações:
            ${leadString}

            Histórico da conversa:
            ${historicoFormatado}

            Analise a última mensagem do usuário e determine a próxima ação. Responda em um dos seguintes formatos JSON:

            1.  **Para fazer uma pergunta:**
                \`\`\`json
                { "tipo": "pergunta", "texto": "Sua pergunta aqui" }
                \`\`\`

            2.  **Para atualizar os dados do lead:**
                \`\`\`json
                { "tipo": "json", "lead": { "campo": "valor" } }
                \`\`\`

            3.  **Para agendar uma reunião:**
                \`\`\`json
                { "tipo": "agendamento", "texto": "Texto de confirmação com link ou próximos passos" }
                \`\`\`

            4.  **Para se despedir:**
                \`\`\`json
                { "tipo": "despedida", "texto": "Sua mensagem de despedida" }
                \`\`\`
                
            5.  **Para corrigir uma informação:**
                \`\`\`json
                { "tipo": "correcao", "campo": "campo_a_corrigir", "novoValor": "novo_valor" }
                \`\`\`

            6.  **Para confirmar uma informação:**
                \`\`\`json
                { "tipo": "confirmacao", "texto": "Sua mensagem de confirmação" }
                \`\`\`
        `;
    }
}
