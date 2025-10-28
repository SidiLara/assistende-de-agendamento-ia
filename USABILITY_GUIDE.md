# Guia de Uso (Nível Mentor): Desenvolvendo com o Assistente de IA

Bem-vindo ao projeto! Este guia foi feito para você, desenvolvedor. Ele vai te ensinar como usar nosso assistente de IA para escrever código de alta qualidade, de forma mais rápida e alinhada com a arquitetura do projeto.

O objetivo não é que a IA pense por você, mas que ela atue como um **colega de equipe sênior**, automatizando tarefas repetitivas, garantindo que os padrões de código sejam sempre seguidos e, principalmente, **ensinando os porquês** por trás da nossa arquitetura.

---

## O Conceito Mais Importante: O Cérebro da IA (`PROMPTS.md`)

Na raiz do projeto, existe um arquivo chamado `PROMPTS.md`. Pense nele como o **cérebro da nossa IA**. Nós ensinamos a ele toda a nossa arquitetura, nossas regras de nomenclatura e nossos padrões de design.

*   **Você não precisa decorar o `PROMPTS.md`**, mas saber que ele existe é fundamental.
*   Toda vez que você usar a IA, ela irá consultar este arquivo para saber exatamente como criar ou corrigir o código.

---

## Fluxos de Trabalho do Dia a Dia

A seguir, veja como usar a IA em tarefas comuns.

### Tarefa 1: Começando seu dia de trabalho

**O que fazer:** Antes de tudo, você precisa "carregar" o cérebro da IA. A memória dela é por sessão.

**Como fazer:**
1.  Abra o chat da IA.
2.  Copie e cole o conteúdo do **Prompt 0: Prompt de Configuração Inicial** que está no `PROMPTS.md`.
3.  A IA irá responder: *"Pronto. Já internalizei as regras de especialista do arquivo PROMPTS.md e estou pronto para ajudar. O que vamos fazer?"*

### Tarefa 2: Criando uma nova Tela ou Componente

**O que fazer:** Você precisa criar uma nova funcionalidade, como uma tela de "Favoritos" ou um novo serviço de API para buscar "Cupons".

**Como fazer:**
1.  Vá para o `PROMPTS.md` e copie o conteúdo do **Prompt 2: Prompt para Refatorar ou Criar Código**.
2.  Cole no chat da IA e, na última linha, `[DESCRIÇÃO DA TAREFA OU CÓDIGO]`, escreva seu pedido em linguagem natural.

**Exemplo de pedido (Tela):**
`Crie uma nova tela principal chamada "Favoritos". Ela deve ser um módulo de 4 arquivos. Por enquanto, a tela pode apenas exibir um texto simples dizendo "Tela de Favoritos".`

**Exemplo de pedido (Serviço):**
`Crie toda a estrutura para uma nova entidade 'Cupom'. Isso deve incluir a interface CupomService em application e a implementação CupomServiceImpl em infrastructure, seguindo nossas regras de nomenclatura.`

### Tarefa 3: Corrigindo ou Melhorando um Código Antigo

**O que fazer:** Você encontrou um arquivo ou uma pasta que parece fora do padrão.

**Como fazer:**
1.  Use o comando `ls -R nome_da_pasta` no terminal para listar a estrutura.
2.  Vá para o `PROMPTS.md` e copie o conteúdo do **Prompt 1: Prompt de Análise**.
3.  Cole no chat da IA e, na seção `[COLE AQUI...]`, cole a estrutura que você copiou.

**O que a IA vai fazer?** Ela vai agir como um Arquiteto de Software, analisar o código, listar todos os problemas e apresentar um plano detalhado para corrigi-los. Se você concordar, ela mesma executará a refatoração.

### Tarefa 4: Seja um Guardião da Arquitetura

**O que fazer:** Você está em outro projeto que parece desorganizado e gostaria de sugerir nossa arquitetura como uma melhoria.

**Como fazer:**
1.  Vá para o nosso `PROMPTS.md` e copie o conteúdo do **Prompt 3: Prompt Adaptável**.
2.  No final do prompt, na seção `[APÊNDICE PARA SUGESTÃO...]`, copie e cole toda a seção do Apêndice do nosso `PROMPTS.md`.
3.  No chat da IA do outro projeto, cole o prompt completo. A IA irá analisar o projeto atual e sugerir a nossa arquitetura como um padrão ideal.

---

## Por que nossa Arquitetura é Assim? (Os "Porquês")

### Por que o `App.tsx` deve ser limpo? (A Porta de Entrada)

Pense no `App.tsx` como a **porta de entrada e a fundação da casa**. A única responsabilidade dele é montar a estrutura mais básica e essencial da aplicação.

*   **Provedores de Estado:** Ele envolve toda a aplicação com os "provedores" (como Redux), garantindo que o estado global esteja disponível para todos.
*   **Ponto de Navegação Principal:** Ele renderiza o componente `Root` da navegação.

> **Benefício:** Manter o `App.tsx` limpo significa que o ponto de entrada da sua aplicação é estável, previsível e fácil de depurar. Ele não se envolve com lógica de telas ou de negócio, apenas prepara o terreno.

### Por que existe o `menu/Root.tsx`? (O Painel de Controle da Navegação)

Se o `App.tsx` é a porta da casa, o `Root.tsx` é o **hall de entrada com um segurança**. Ele é o primeiro componente com um pingo de inteligência. Sua única responsabilidade é decidir qual grande parte do aplicativo mostrar.

*   **Exemplo de lógica:** "O usuário está logado? Se sim, mostre a `MenuBottomTabBar` (as abas principais do app). Se não, mostre a tela de `Login`."

> **Benefício:** Centraliza a lógica de navegação mais importante em um único lugar. Em vez de espalhar essa verificação por vários lugares, temos um "painel de controle" que direciona o usuário para o lugar certo, dependendo do estado da aplicação.

### Por que a Arquitetura em Camadas?

*   **`model`**: Os "ingredientes" (ex: um objeto `Produto`).
*   **`application`**: O "chef de cozinha" que conhece as receitas (regras de negócio).
*   **`infrastructure`**: Os "eletrodomésticos" (a conexão com a internet, o banco de dados).

> **Benefício:** Permite trocar os "eletrodomésticos" (mudar de Firebase para AWS, por exemplo) sem ter que reescrever a "receita" (as regras de negócio do seu app). Isso torna o código testável e flexível.

### Por que o sufixo `Impl`? (Interfaces vs. Implementações)

*   **A Interface (`ProdutoService.ts`):** É o "contrato" ou o "cardápio". Diz o que PODE ser feito (ex: `buscarProdutos()`).
*   **A Implementação (`ProdutoServiceImpl.ts`):** É a "cozinha" que realmente faz o trabalho. É a implementação REAL daquele contrato.

> **Benefício:** O resto do aplicativo não precisa saber *como* os produtos são buscados, apenas que eles *podem* ser buscados. Isso se chama **inversão de dependência**, um pilar do código limpo. Podemos ter uma implementação `ProdutoServiceMockImpl.ts` para testes, por exemplo, e o resto do app funciona sem mudar uma linha.

### Por que o padrão de 4 arquivos para Módulos?

*   **`.tsx` (Componente):** A lógica e o que você vê.
*   **`Style.ts`:** Os estilos, para manter a lógica limpa.
*   **`Props.ts`:** O "contrato" do componente, o que ele espera receber.
*   **`index.ts`:** Facilita a importação (`import { MeuComponente } from 'src/component/MeuComponente'`).

> **Benefício:** Previsibilidade. Qualquer pessoa do time sabe exatamente onde encontrar cada parte de um componente, tornando a manutenção muito mais fácil.

### Por que os arquivos `Event.ts`? (Contratos de Comunicação)

Imagine uma `Props` que define `onPress: () => void`. O que essa função faz? Quais dados ela retorna? É ambíguo.

*   **O Arquivo `...Event.ts`:** Cria um contrato CLARO. Por exemplo, `interface MeuComponenteEvent { onPress(id: string): void; }`. 

> **Benefício:** Segurança e clareza. Agora, a `Props` será `onPress: MeuComponenteEvent['onPress']`. Qualquer componente que usar o seu saberá que o evento `onPress` DEVE receber um `id` do tipo `string`. Acabou a ambiguidade.

### Por que o padrão `aggregate`?

> **Benefício:** Eficiência. Em vez de fazer 3 chamadas na API para buscar um `Produto`, seus `Comentarios` e o `Vendedor`, o back-end nos envia um "pacotão" (`aggregate`) com tudo junto. Nossos modelos `aggregate` são preparados para receber esses pacotes, tornando a comunicação com a API mais rápida e o estado do app mais simples.

### Por que a estrutura de `menu/tabs`?

> **Benefício:** Organização da Navegação. Cada aba principal do seu aplicativo (Ofertas, Pedidos, Perfil) tem seu próprio universo de telas. Manter a configuração de navegação de cada aba (`MenuStack...`) em sua própria pasta evita um arquivo de rotas gigante e confuso. Fica fácil saber quais telas pertencem a qual fluxo de usuário.
