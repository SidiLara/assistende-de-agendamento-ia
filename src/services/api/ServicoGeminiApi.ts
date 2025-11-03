import { ServicoDeApi } from './ApiInterfaces';

export class ServicoGeminiApi implements ServicoDeApi {
    private readonly apiKey: string;
    private readonly apiUrl: string;

    constructor() {
        this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!this.apiKey) {
            throw new Error("A chave da API Gemini não foi definida nas variáveis de ambiente.");
        }
        this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    }

    async analisarConteudo(prompt: string, maxRetries = 3): Promise<any> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: prompt },
                                ],
                            },
                        ],
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Erro na API Gemini: ${response.statusText}`);
                }

                const data = await response.json();
                const text = data.candidates[0].content.parts[0].text;
                const cleanedText = text.replace(/```json|```/g, '').trim();
                
                return JSON.parse(cleanedText);

            } catch (error) {
                console.error(`Tentativa ${attempt} falhou:`, error);
                if (attempt === maxRetries) {
                    throw new Error('Todas as tentativas de comunicação com a API Gemini falharam.');
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
}
