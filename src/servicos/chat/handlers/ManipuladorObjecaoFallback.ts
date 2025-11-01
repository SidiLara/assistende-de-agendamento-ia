import { RespostaAi } from "../modelos/RespostaAi";
import { ConfiguracaoChat } from "../modelos/ConfiguracaoChatModel";
import { Lead, LeadKey } from "../modelos/LeadModel";
import { baseDeConhecimento } from "../conhecimento";
import { fallbackFlow, getFallbackQuestions } from "../ConfiguracaoFallback";

export class ManipuladorObjecaoFallback {
    public handle(
        lastUserMessage: string,
        currentData: Partial<Lead>,
        keyToCollect: LeadKey | null,
        config: ConfiguracaoChat
    ): RespostaAi | null {
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
        return null;
    }
}