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
    // Tema 1: Custo e Parcelas
    {
        pergunta: "As parcelas são muito altas para o meu orçamento.",
        resposta: "Entendo sua preocupação com o orçamento. Vamos analisar juntos as diferentes opções de planos e prazos. Podemos encontrar um plano com parcelas que se encaixem melhor na sua realidade financeira, permitindo que você realize seu objetivo sem comprometer seu orçamento.",
        palavrasChave: ["parcelas altas", "orçamento", "muito caro", "parcela alta"],
    },
    {
        pergunta: "Eu teria que pagar juros muito altos.",
        resposta: "Na verdade, nosso planejamento não possui juros como um financiamento tradicional. Você paga uma taxa de administração, que é diluída ao longo do prazo. Essa taxa remunera a administradora pelos serviços de gestão do grupo.",
        palavrasChave: ["juros", "juro alto"],
    },
    {
        pergunta: "Além da parcela, tem outras taxas?",
        resposta: "Sim, além da parcela mensal, há a taxa de administração e um fundo de reserva, que serve para proteger o grupo em caso de inadimplência. Esses valores são previstos em contrato e são transparentes desde o início.",
        palavrasChave: ["outras taxas", "taxa", "além da parcela"],
    },
    {
        pergunta: "Prefiro juntar o dinheiro por conta própria.",
        resposta: "Essa é uma opção válida, mas muitas vezes leva mais tempo, e seu poder de compra pode diminuir com a inflação. Com nosso planejamento, você tem a possibilidade de ser contemplado mais rapidamente por sorteio ou lance, antecipando a realização do seu sonho.",
        palavrasChave: ["juntar dinheiro", "conta própria", "poupar sozinho"],
    },
    {
        pergunta: "O valor da parcela pode aumentar?",
        resposta: "Sim, as parcelas são ajustadas anualmente pelo mesmo índice de correção do bem ou serviço. Isso garante que seu poder de compra seja mantido ao longo do tempo. Essa correção é uma proteção para todos os integrantes do grupo.",
        palavrasChave: ["parcela pode aumentar", "aumenta", "reajuste", "correção"],
    },
    // Tema 2: Tempo e Contemplação
    {
        pergunta: "Não quero esperar muito tempo para ser contemplado.",
        resposta: "Entendo sua ansiedade! Existem duas formas de contemplação: por sorteio e por lance, onde você pode ofertar um valor para antecipar sua contemplação. Podemos conversar sobre estratégias de lance que aumentam suas chances.",
        palavrasChave: ["esperar muito", "demora", "não quero esperar", "muito tempo"],
    },
    {
        pergunta: "E se eu nunca for sorteado?",
        resposta: "Embora o sorteio seja uma forma, todos os integrantes do grupo serão contemplados até o final do prazo. Além disso, você sempre tem a opção de ofertar lances para antecipar a realização do seu objetivo.",
        palavrasChave: ["nunca for sorteado", "não ser sorteado", "se eu não for sorteado"],
    },
    {
        pergunta: "O prazo do consórcio é muito longo.",
        resposta: "Oferecemos diferentes prazos para que você possa escolher aquele que melhor se adapta às suas necessidades. Um prazo mais longo geralmente significa parcelas menores, tornando o planejamento mais acessível.",
        palavrasChave: ["prazo longo", "muito longo", "demorado"],
    },
    {
        pergunta: "Eu preciso do bem/serviço agora.",
        resposta: "Compreendo a urgência. Para uma aquisição imediata, outras opções podem parecer mais adequadas. No entanto, se você busca uma opção com um custo total menor, nosso planejamento pode ser uma excelente alternativa, com a possibilidade de antecipação por meio de lances.",
        palavrasChave: ["preciso agora", "urgência", "imediato", "não posso esperar"],
    },
    {
        pergunta: "Não gosto da ideia de depender da sorte.",
        resposta: "A sorte é um dos caminhos, mas o lance é uma ferramenta poderosa que coloca você no controle do tempo da sua contemplação. Podemos conversar sobre como funciona o sistema de lances e como você pode se planejar.",
        palavrasChave: ["depender da sorte", "não gosto de sorteio"],
    },
    // Tema 3: Segurança e Confiança
    {
        pergunta: "Consórcio não é seguro.",
        resposta: "Nossa empresa é uma das maiores e mais sólidas administradoras do Brasil, regulamentada e fiscalizada pelo Banco Central, o que garante a segurança e a transparência das operações.",
        palavrasChave: ["seguro", "não é seguro", "confiável", "garantia"],
    },
    {
        pergunta: "Tenho medo de não receber o bem depois de pagar.",
        resposta: "Essa é uma preocupação válida. A contemplação garante o acesso ao crédito para a aquisição do bem. Além disso, nossa empresa acompanha todo o processo para garantir que você receba o que contratou.",
        palavrasChave: ["medo de não receber", "receber o bem", "não entregar"],
    },
    {
        pergunta: "Já tive uma experiência ruim com outra empresa.",
        resposta: "Sinto muito pela sua experiência anterior. Cada administradora tem suas práticas. Nós nos diferenciamos pela transparência, solidez e atendimento personalizado. Podemos mostrar como nossos processos funcionam.",
        palavrasChave: ["experiência ruim", "outra empresa", "problema com"],
    },
    {
        pergunta: "Não confio em consórcios.",
        resposta: "Entendo seu receio. Posso te apresentar mais detalhes sobre o funcionamento do sistema, os órgãos reguladores e como trabalhamos para garantir a segurança e a satisfação dos nossos clientes.",
        palavrasChave: ["não confio", "desconfio"],
    },
    {
        pergunta: "E se a empresa falir?",
        resposta: "O sistema é estruturado para proteger os participantes. Os recursos do grupo são separados do patrimônio da empresa, garantindo a continuidade da gestão por outra administradora, se necessário.",
        palavrasChave: ["falir", "se a empresa quebrar", "falência"],
    },
    // Tema 4: Burocracia e Processo
    {
        pergunta: "O processo parece muito complicado.",
        resposta: "Na verdade, o processo é bastante simples. Você participa dos sorteios mensais e pode ofertar lances. Nossa equipe está sempre à disposição para te orientar em cada etapa.",
        palavrasChave: ["complicado", "difícil", "burocracia", "muita coisa"],
    },
    {
        pergunta: "A documentação exigida é muita.",
        resposta: "A documentação é necessária para a segurança de todos no grupo. Nossa equipe te auxiliará na organização dos documentos, tornando o processo o mais simples e rápido possível.",
        palavrasChave: ["documentação", "muito documento", "papelada"],
    },
    {
        pergunta: "Não entendi bem como funciona o lance.",
        resposta: "O lance é uma oferta que você pode fazer para antecipar sua contemplação. Funciona como um leilão. Existem diferentes tipos, e podemos explicar detalhadamente cada um deles.",
        palavrasChave: ["como funciona o lance", "não entendi o lance", "lance"],
    },
    {
        pergunta: "Depois de contemplado, ainda tem muita burocracia?",
        resposta: "Após a contemplação, existe um processo de análise de crédito e documentação do bem. Nossa equipe dará todo o suporte para que essa etapa seja o mais ágil possível.",
        palavrasChave: ["depois de contemplado", "após contemplar", "burocracia depois"],
    },
    {
        pergunta: "Não tenho tempo para acompanhar as assembleias.",
        resposta: "Você não precisa acompanhar presencialmente. As informações sobre os resultados são disponibilizadas online e você será notificado sobre tudo que for importante para o seu grupo.",
        palavrasChave: ["assembleias", "acompanhar assembleia", "reunião"],
    },
    // Tema 5: Alternativas e Concorrência
    {
        pergunta: "Acho que um financiamento bancário seria melhor.",
        resposta: "O financiamento é uma opção, mas geralmente envolve juros mais altos e um custo total maior. Nosso planejamento oferece a possibilidade de adquirir o mesmo bem com um custo menor.",
        palavrasChave: ["financiamento", "banco", "empréstimo"],
    },
    {
        pergunta: "Estou pesquisando outras empresas.",
        resposta: "Excelente! Pesquisar é fundamental. Nós nos destacamos pela nossa experiência, solidez no mercado e pela satisfação dos clientes. Podemos te apresentar nossos diferenciais.",
        palavrasChave: ["outras empresas", "concorrente", "pesquisando"],
    },
    {
        pergunta: "Um amigo meu teve problemas com consórcio.",
        resposta: "Lamento ouvir isso. Cada administradora tem suas práticas. Nós prezamos pela transparência e pelo bom relacionamento com nossos clientes. Podemos te mostrar nossos indicadores de satisfação.",
        palavrasChave: ["amigo teve problema", "conhecido teve problema"],
    },
    {
        pergunta: "Talvez seja melhor esperar um desconto à vista.",
        resposta: "Conseguir um desconto à vista é ótimo, mas nem sempre é possível ter o valor total. O planejamento te permite ter o poder de compra à vista antecipadamente, aproveitando possíveis descontos.",
        palavrasChave: ["desconto à vista", "pagar a vista", "esperar"],
    },
    {
        pergunta: "Não sei se o plano de vocês é o melhor para mim.",
        resposta: "Compreendo sua dúvida. Para te ajudar, podemos analisar suas necessidades e apresentar o plano que melhor se adapta a você, comparando nossos benefícios com outras opções.",
        palavrasChave: ["melhor para mim", "não sei se é o melhor"],
    },
    // Tema 6: Uso do Crédito e Flexibilidade
    {
        pergunta: "Só posso usar o crédito para um bem específico?",
        resposta: "Você tem flexibilidade para escolher o bem ou serviço dentro da categoria do seu plano. Por exemplo, em um plano de imóveis, você pode adquirir um novo, usado, construir ou reformar.",
        palavrasChave: ["bem específico", "só posso usar para"],
    },
    {
        pergunta: "E se eu quiser usar o crédito para outra coisa?",
        resposta: "Dentro da mesma categoria do seu plano, você tem essa flexibilidade. Caso seus planos mudem, podemos analisar as opções de transferência ou migração de grupo.",
        palavrasChave: ["usar para outra coisa", "mudar de ideia"],
    },
    {
        pergunta: "Posso usar meu FGTS para dar lance?",
        resposta: "Sim, em planos de imóveis, você pode utilizar o seu FGTS para ofertar lances, o que pode aumentar suas chances de contemplação. Nossa equipe pode te orientar.",
        palavrasChave: ["fgts", "usar fgts"],
    },
    {
        pergunta: "Posso quitar meu consórcio antecipadamente?",
        resposta: "Sim, você tem a opção de quitar seu plano antecipadamente, seja com recursos próprios ou com um lance. Isso pode te trazer economia, pois você deixa de pagar as taxas futuras.",
        palavrasChave: ["quitar", "pagar antes", "antecipadamente"],
    },
    {
        pergunta: "Posso transferir minha cota para outra pessoa?",
        resposta: "Sim, a transferência de titularidade da cota é possível, mediante análise e aprovação da administradora. É uma opção caso seus planos mudem.",
        palavrasChave: ["transferir", "passar para outra pessoa", "vender a cota"],
    },
    // Tema 7: Dúvidas Gerais
    {
        pergunta: "Não entendi muito bem como o consórcio funciona.",
        resposta: "Sem problemas! É uma modalidade de compra planejada, onde um grupo de pessoas se une para formar uma poupança comum. Mensalmente, alguns participantes são contemplados por sorteio ou lance.",
        palavrasChave: ["como funciona", "não entendi", "o que é"],
    },
    {
        pergunta: "Qual a diferença entre consórcio e financiamento?",
        resposta: "A principal diferença é que o planejamento não possui juros, apenas uma taxa de administração. No financiamento, você pega o dinheiro emprestado e paga juros por isso.",
        palavrasChave: ["diferença consórcio financiamento", "diferença"],
    },
    {
        pergunta: "Quem garante que serei contemplado?",
        resposta: "Todos os participantes ativos do grupo serão contemplados até o final do prazo, seja por sorteio ou por lance. A administradora garante a gestão e a realização das assembleias.",
        palavrasChave: ["garante", "serei contemplado", "garantia de contemplação"],
    },
    {
        pergunta: "O que acontece se eu desistir?",
        resposta: "Caso você desista antes da contemplação, poderá receber os valores pagos de volta, de acordo com as regras contratuais e após a dedução de eventuais taxas. É importante analisar o contrato.",
        palavrasChave: ["desistir", "cancelar", "se eu parar de pagar"],
    },
    {
        pergunta: "Posso usar o crédito para comprar qualquer coisa?",
        resposta: "O crédito deve ser utilizado para a aquisição de bens ou serviços dentro da categoria do plano que você escolheu (ex: imóveis, veículos, etc.).",
        palavrasChave: ["comprar qualquer coisa", "usar para o que quiser"],
    },
    // Tema 8: Momento da Venda e Fechamento
    {
        pergunta: "Preciso pensar mais um pouco.",
        resposta: "Com certeza! É importante tomar uma decisão consciente. Posso te enviar mais informações detalhadas sobre o plano que te interessou para você analisar com calma?",
        palavrasChave: ["preciso pensar", "vou pensar", "decidir depois"],
    },
    {
        pergunta: "Vou conversar com meu cônjuge/sócio.",
        resposta: "Excelente! É importante que todos estejam de acordo. Podemos agendar uma conversa onde ambos possam participar para que eu possa esclarecer todas as dúvidas?",
        palavrasChave: ["conversar com", "falar com meu", "cônjuge", "esposa", "marido", "sócio"],
    },
    {
        pergunta: "Agora não é o melhor momento para mim.",
        resposta: "Entendo. Posso saber qual seria um momento melhor para conversarmos novamente? Assim, posso te manter atualizado sobre as novidades.",
        palavrasChave: ["não é o momento", "agora não"],
    },
    {
        pergunta: "Ainda não tenho certeza se é para mim.",
        resposta: "Sem problemas. Para te ajudar a ter mais clareza, que tal revisarmos os benefícios e como ele pode te ajudar a alcançar seus objetivos? Podemos analisar outros casos de sucesso.",
        palavrasChave: ["não tenho certeza", "não sei se é para mim"],
    },
    {
        pergunta: "Não tenho o valor da primeira parcela agora.",
        resposta: "Entendo. Podemos verificar as opções de pagamento da primeira parcela e encontrar uma alternativa. O importante é darmos o primeiro passo para o seu planejamento.",
        palavrasChave: ["primeira parcela", "não tenho dinheiro agora", "sem dinheiro"],
    },
     // Tema 9: Objeções Específicas
    {
        pergunta: "Tenho medo de comprar um imóvel usado e ter problemas.",
        resposta: "Com o crédito, você tem a liberdade de escolher o imóvel que melhor te atende. Além disso, pode utilizar parte do crédito para realizar reformas e adequações, deixando-o do seu jeito.",
        palavrasChave: ["imóvel usado", "problemas no imóvel"],
    },
    {
        pergunta: "Estou esperando o lançamento de um carro novo.",
        resposta: "O planejamento te permite organizar a compra do seu carro novo e, quando ele for lançado, você já terá o crédito disponível para adquiri-lo, sem correr o risco do preço aumentar.",
        palavrasChave: ["lançamento", "carro novo", "esperando modelo"],
    },
    {
        pergunta: "Não sei se um consórcio de serviços funciona.",
        resposta: "O planejamento de serviços é uma excelente forma de realizar projetos como viagens, estudos ou reformas, com parcelas acessíveis e sem juros. Funciona da mesma forma que os de bens.",
        palavrasChave: ["consórcio de serviços", "serviço funciona"],
    },
    {
        pergunta: "É seguro contratar um consórcio para um serviço específico?",
        resposta: "Sim, o planejamento de serviços é flexível e pode ser usado para diversos fins, desde que estejam dentro da categoria contratada. Podemos verificar juntos se o serviço que você deseja se encaixa.",
        palavrasChave: ["serviço específico", "seguro para serviço"],
    },
    {
        pergunta: "Já tenho um imóvel, posso usar o crédito para reformá-lo?",
        resposta: "Sim, no plano de imóveis, você pode usar o crédito tanto para comprar um novo imóvel quanto para construir ou reformar um que você já possui.",
        palavrasChave: ["reformar", "reforma", "usar para reforma"],
    },
    {
        pergunta: "Não sei se tenho flexibilidade para escolher o veículo.",
        resposta: "Com o plano de veículos, você tem total liberdade para escolher a marca, o modelo e os opcionais do veículo que deseja, seja ele novo ou usado.",
        palavrasChave: ["flexibilidade", "escolher o veículo", "qualquer carro"],
    },
    {
        pergunta: "E se eu precisar do dinheiro antes da contemplação?",
        resposta: "Caso precise do dinheiro antes, você pode tentar ofertar um lance para antecipar a contemplação ou transferir a sua cota para outra pessoa, mediante aprovação.",
        palavrasChave: ["precisar do dinheiro", "resgatar antes", "dinheiro antes"],
    },
    {
        pergunta: "Tenho medo de não conseguir pagar as parcelas no futuro.",
        resposta: "Entendo sua preocupação. É importante escolher um plano com parcelas que se encaixem na sua realidade. Caso tenha dificuldades, podemos analisar opções como a redução de parcela ou transferência.",
        palavrasChave: ["não conseguir pagar", "medo de não pagar", "futuro"],
    },
    {
        pergunta: "Não sei qual o valor do lance que devo ofertar.",
        resposta: "Existem diferentes estratégias de lance, e podemos te ajudar a definir a melhor opção, analisando os lances vencedores dos meses anteriores para ter uma ideia dos valores.",
        palavrasChave: ["valor do lance", "qual lance", "quanto ofertar"],
    },
    {
        pergunta: "É muito arriscado investir em um consórcio.",
        resposta: "O planejamento é uma modalidade de compra regulamentada e fiscalizada pelo Banco Central. Nossa empresa é sólida e transparente. Podemos te apresentar nossos resultados e a segurança que oferecemos.",
        palavrasChave: ["arriscado", "risco", "investir é arriscado"],
    },
];
