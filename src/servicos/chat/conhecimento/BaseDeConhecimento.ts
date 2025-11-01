// src/servicos/chat/conhecimento/BaseDeConhecimento.ts

/**
 * Define a estrutura para cada item da base de conhecimento.
 * - pergunta: A pergunta/objeção como referência.
 * - resposta: A resposta que o assistente deve dar.
 * - palavrasChave: Um array de palavras/frases em minúsculo que acionarão esta resposta.
 */
interface Objeção {
    pergunta: string;
    resposta: string;
    palavrasChave: string[];
}

/**
 * A base de conhecimento do assistente de fallback.
 * Adicione aqui todas as objeções e quebras de objeção.
 * O sistema irá procurar pelas 'palavrasChave' na mensagem do usuário para encontrar a resposta correta.
 */
export const baseDeConhecimento: Objeção[] = [
    {
        pergunta: "Isso é um consórcio?",
        resposta: "Essa é uma ótima pergunta! Nosso foco é em planejamento para aquisição de bens. O consultor especialista vai te apresentar em detalhes a melhor estratégia para o seu projeto, que pode ou não envolver diferentes modalidades. Meu papel aqui é apenas coletar algumas informações iniciais para ele. Mas me diga, qual o seu <strong>objetivo principal</strong>?",
        palavrasChave: ["consórcio", "consorcio", "é consorcio", "isso é um consorcio"],
    },
    {
        pergunta: "Quais são as taxas?",
        resposta: "Todos os detalhes sobre valores e taxas serão apresentados pelo consultor na reunião. Ele vai montar um plano transparente e totalmente adequado ao seu orçamento. Para adiantar, qual o <strong>valor de crédito</strong> que você busca?",
        palavrasChave: ["taxas", "juros", "quanto custa", "custo", "valor", "preço"],
    },
    {
        pergunta: "É seguro?",
        resposta: "Sim, totalmente seguro. Trabalhamos apenas com as maiores e mais respeitadas administradoras do país, todas fiscalizadas pelo Banco Central. Sua segurança é nossa prioridade número um. Podemos continuar o planejamento?",
        palavrasChave: ["seguro", "confiável", "é seguro", "confiavel", "garantia"],
    },
    {
        pergunta: "Como funciona?",
        resposta: "O funcionamento é bem simples: é um planejamento onde você define seu objetivo e o valor que pode investir por mês. O consultor vai te explicar todos os passos na nossa conversa, mostrando como você pode atingir seu objetivo de forma planejada e inteligente. Vamos dar o primeiro passo? Qual seu <strong>nome</strong>?",
        palavrasChave: ["como funciona", "como é", "qual o processo", "processo"],
    },
    // Adicione quantas outras objeções e respostas você precisar.
];
