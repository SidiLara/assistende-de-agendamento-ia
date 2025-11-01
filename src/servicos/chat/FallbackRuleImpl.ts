import { RespostaAi } from "./modelos/AiResponse";
import { ConfiguracaoChat } from "./modelos/ConfiguracaoChatModel";
import { Lead, LeadKey } from "./modelos/LeadModel";
import { RegraFallback } from "./FallbackRule";
import { parseHumanNumber } from "../../utils/formatters/Number";
import { generateTimeSlots } from "../../utils/formatters/DateAndTime";
import { baseDeConhecimento } from "./conhecimento";
import { extractAllData, extractName } from "../../utils/parsers";
import { fallbackFlow, getFallbackQuestions } from "./FallbackConfig";

export class RegraFallbackImpl implements RegraFallback {
    public getFallbackResponse(
        lastUserMessage: string,
        currentData: Partial<Lead>,
        keyToCollect: LeadKey | null,
        config: ConfiguracaoChat
    ): RespostaAi {
        // 1. Verifica se a mensagem do usuário é uma objeção/pergunta conhecida
        const lowerCaseMessage = lastUserMessage.toLowerCase();
        for (const objecao of baseDeConhecimento) {
            for (const palavra of objecao.palavrasChave) {
                if (lowerCaseMessage.includes(palavra)) {
                    const fallbackQuestions = getFallbackQuestions(config);
                    
                    const nextKeyToAsk = keyToCollect || fallbackFlow.find(key => !currentData.hasOwnProperty(key)) || 'clientName';
                    
                    let nextQuestion = fallbackQuestions[nextKeyToAsk];

                    if (nextQuestion.includes('{clientName}') && currentData.clientName) {
                        const firstName = currentData.clientName.split(' ')[0];
                        nextQuestion = nextQuestion.replace('{clientName}', firstName);
                    }

                    const responseText = `${objecao.resposta} Para continuarmos, ${nextQuestion.charAt(0).toLowerCase() + nextQuestion.slice(1)}`;

                    return {
                        updatedLeadData: {},
                        responseText: responseText,
                        action: nextKeyToAsk === 'startDatetime' ? 'SHOW_DAY_OPTIONS' : null,
                        nextKey: nextKeyToAsk,
                        triggeredObjectionText: objecao.pergunta,
                    };
                }
            }
        }

        let updatedLeadData = { ...currentData };

        // 2. Extrai dados da mensagem
        const extractedData = extractAllData(lastUserMessage);
        updatedLeadData = { ...updatedLeadData, ...extractedData };
        
        // 3. Processa o dado específico que estava sendo coletado
        if (keyToCollect && lastUserMessage) {
            if (keyToCollect === 'clientName' && !updatedLeadData.clientName) {
                const extractedName = extractName(lastUserMessage);
                if (extractedName) { // Apenas define o nome se um foi de fato extraído
                    updatedLeadData.clientName = extractedName;
                }
            } else if (keyToCollect === 'startDatetime' && updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às')) {
                if (lastUserMessage !== updatedLeadData.startDatetime) {
                    updatedLeadData.startDatetime = `${updatedLeadData.startDatetime} às ${lastUserMessage}`;
                }
            } else if (keyToCollect === 'creditAmount' && !updatedLeadData.creditAmount) {
                const numericValue = parseHumanNumber(lastUserMessage, true);
                if (!isNaN(numericValue)) updatedLeadData.creditAmount = numericValue;
            } else if (keyToCollect === 'monthlyInvestment' && !updatedLeadData.monthlyInvestment) {
                const numericValue = parseHumanNumber(lastUserMessage, false);
                if (!isNaN(numericValue)) updatedLeadData.monthlyInvestment = numericValue;
            } else if (!updatedLeadData[keyToCollect]) {
                (updatedLeadData as Record<string, unknown>)[keyToCollect] = lastUserMessage;
            }
        }

        // 4. Lida com o fluxo de data/hora
        if (keyToCollect === 'startDatetime' && updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às')) {
             const timeSlots = generateTimeSlots();
             const timeOptions = timeSlots.map(time => ({ label: time, value: time }));

            return {
                updatedLeadData,
                responseText: "Ótimo. Agora, por favor, escolha um dos <strong>horários disponíveis</strong> abaixo:",
                action: null,
                nextKey: 'startDatetime',
                options: timeOptions
            };
        }

        // 5. Determina a próxima pergunta
        const nextKey = fallbackFlow.find(key => {
             if (key === 'startDatetime') {
                return !(updatedLeadData.startDatetime && updatedLeadData.startDatetime.includes('às'));
            }
            return !updatedLeadData.hasOwnProperty(key);
        }) || null;

        if (!nextKey) {
            return { updatedLeadData, responseText: "", action: null, nextKey: null };
        }

        // 6. Monta a resposta final
        const fallbackQuestions = getFallbackQuestions(config);
        let responseText = fallbackQuestions[nextKey];
        if (nextKey === 'topic' && updatedLeadData.clientName) {
            const firstName = updatedLeadData.clientName.split(' ')[0];
            responseText = responseText.replace('{clientName}', firstName);
        }

        const action = nextKey === 'startDatetime' ? 'SHOW_DAY_OPTIONS' : null;

        return { updatedLeadData, responseText, action, nextKey };
    }

    public getFallbackSummary(leadData: Partial<Lead>): string {
        const formatCurrency = (value: number | undefined) => {
            if (value === undefined) return 'Não informado';
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        }

        let summary = "Perfeito! Por favor, confirme se os dados abaixo estão corretos:<br><br>";
        summary += `<strong>Nome:</strong> ${leadData.clientName || 'Não informado'}<br>`;
        summary += `<strong>Objetivo:</strong> ${leadData.topic || 'Não informado'}<br>`;
        summary += `<strong>Valor do Crédito:</strong> ${formatCurrency(leadData.creditAmount)}<br>`;
        summary += `<strong>Reserva Mensal:</strong> ${formatCurrency(leadData.monthlyInvestment)}<br>`;
        summary += `<strong>WhatsApp:</strong> ${leadData.clientWhatsapp || 'Não informado'}<br>`;
        summary += `<strong>E-mail:</strong> ${leadData.clientEmail || 'Não informado'}<br>`;
        summary += `<strong>Tipo de Reunião:</strong> ${leadData.meetingType || 'Não informado'}<br>`;
        summary += `<strong>Data/Hora:</strong> ${leadData.startDatetime || 'Não informado'}<br><br>`;
        summary += "Podemos confirmar o agendamento?";

        return summary;
    }
}