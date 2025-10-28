# Guia de Prompts de IA para Padronização de Código

Este documento centraliza os prompts de IA para serem usados no desenvolvimento, garantindo que todo o código (novo ou refatorado) siga os mesmos padrões de alta qualidade, seja neste projeto ou em outros.

---

## 0. Prompt de Configuração Inicial (Prompt Mestre)

**Quando usar:** No início de cada sessão de trabalho (ex: ao abrir o IDE). A IA tem uma memória de "curto prazo" que dura apenas uma sessão. Este prompt garante que ela aprenda (ou relembre) as regras do projeto.

**Como usar:** Copie e cole este prompt no chat da IA assim que você começar a trabalhar.

>**Nota Importante:** A memória da IA é baseada em sessão. Se você fechar o IDE ou ficar inativo por muito tempo, a sessão terminará. Ao iniciar uma nova sessão, você **deve** usar este prompt novamente para recarregar as regras do projeto na memória da IA.

```text
# CONTEXTO
Você é Gemini, uma IA assistente de programação avançada. Sua primeira tarefa é se configurar para o projeto atual.

# TAREFA
1.  **Localize e Leia o Guia:** Encontre um arquivo chamado `PROMPTS.md` na raiz do projeto. Este arquivo contém todas as regras, padrões e guias de arquitetura que você DEVE seguir para este projeto.
2.  **Internalize as Regras:** Analise o conteúdo completo do `PROMPTS.md`, prestando atenção especial às regras de nomenclatura, estrutura de diretórios, padrões de código e ao apêndice, que é a sua principal fonte de exemplos.
3.  **Confirme e Aguarde:** Após ler e entender as regras, responda com a seguinte mensagem e NADA MAIS: "Pronto. Já internalizei as regras do arquivo PROMPTS.md e estou pronto para ajudar. O que vamos fazer?"

A partir deste ponto, todas as suas respostas, análises, refatorações e criações de código para este projeto devem seguir estritamente as diretrizes que você acabou de aprender.
```

---

## 1. Prompt de Análise (Diagnóstico e Refatoração)

**Quando usar:** Para que a IA analise arquivos, liste os desvios e **execute um plano de refatoração completo**.

**Como usar:** Copie o prompt abaixo e, na seção `[COLE O CÓDIGO AQUI]`, insira o conteúdo do(s) arquivo(s) que você deseja analisar.

```text
# CONTEXTO
Aja como um desenvolvedor Sênior especialista em refatoração e código limpo. Conforme as regras do `PROMPTS.md`, sua tarefa é ANALISAR o código, RELATAR os desvios e, se solicitado, EXECUTAR a correção.

# TAREFA

**Passo 1: Análise**
Analise o código abaixo e liste, em formato de bullet points, todos os trechos que violam as regras do projeto. Preste atenção especial a:
*   **Nomenclatura de Arquivos/Diretórios:** Identifique arquivos ou diretórios de domínio de negócio que estão em inglês e deveriam estar em português.
*   **Estrutura do Código:** Estilos inline, props no mesmo arquivo, etc.

**Passo 2: Plano de Ação**
Após a lista, apresente um plano de refatoração detalhado. Se a correção envolver renomear arquivos, o plano DEVE incluir:
1.  Renomear o arquivo (ex: de `CartScreen.tsx` para `CestaScreen.tsx`).
2.  Listar todos os arquivos do projeto que importam o arquivo antigo e que precisarão ser atualizados.
3.  A remoção/exclusão do arquivo antigo após a refatoração.

**Passo 3: Confirmação**
Ao final, pergunte se eu desejo que você execute este plano de refatoração.

# CÓDIGO PARA ANÁLISE
[COLE O CÓDIGO AQUI]
```

---

## 2. Prompt para Refatorar ou Criar Código (Padrão do Projeto)

**Quando usar:** Para criar novas funcionalidades ou refatorar códigos existentes, garantindo que os padrões internalizados do `PROMPTS.md` sejam seguidos.

**Como usar:** Descreva a funcionalidade que você quer criar ou cole o código que precisa ser refatorado na seção `[DESCRIÇÃO DA TAREFA OU CÓDIGO]`.

```text
# CONTEXTO
Aja como um desenvolvedor Sênior especialista em arquitetura de software e código limpo. Usando as regras do `PROMPTS.md` que você já internalizou, sua tarefa é criar ou refatorar o código solicitado.

# REGRAS DO PROJETO DE REFERÊNCIA (React Native)

> **REGRA FUNDAMENTAL: Idioma e Nomenclatura**
> Esta é a regra mais importante. O projeto utiliza um padrão MISTO. A violação desta regra compromete toda a arquitetura.
>
> *   **PORTUGUÊS é usado para:**
>     *   **Domínio de Negócio:** Nomes de arquivos e diretórios (ex: `src/model/produto`, `CestaModel.ts`).
> *   **INGLÊS é usado para:**
>     *   **Estrutura Técnica:** Nomes de diretórios (ex: `src/core`, `src/store`).
>     *   **Código:** Nomes de variáveis, funções, etc. (ex: `const productModel`).

1.  **Arquitetura e Estrutura de Arquivos:**
    *   **Princípio da Coerência:** Antes de criar um novo diretório, analise o "Apêndice". Reutilize diretórios existentes sempre que possível (ex: lógica de navegação pertence a `src/menu`).

2.  **Componentes React:**
    *   Estilos e Props devem ser em arquivos separados (`...Style.ts`, `...Props.ts`).

3.  **Ponto de Entrada (Entry Point):**
    *   `App.tsx` deve estar na raiz do projeto e ser o mais limpo possível.
    *   A lógica de inicialização fica em `src/menu/Root.tsx`.

> **Nota para Desenvolvedores:** A lógica para colocar `Root.tsx` em `/menu` é para manter todos os arquivos de navegação juntos, seguindo o Princípio da Coerência.

# TAREFA
Com base em todas as regras acima, execute a seguinte tarefa. **Sua responsabilidade é entregar a tarefa 100% concluída.**

*   **Se for para criar/modificar arquivos,** forneça o código final com os caminhos corretos.
*   **Se for para renomear/traduzir um arquivo/diretório de negócio (ex: de Inglês para Português):**
    1.  Crie o novo arquivo/diretório com o nome correto em Português.
    2.  Mova todo o conteúdo para o novo local.
    3.  **Encontre e atualize TODAS as importações** no projeto que usavam o caminho antigo.
    4.  **APAGUE o arquivo/diretório antigo** para não deixar lixo ou código duplicado.
    5.  Liste todas as ações (criação, atualização de importações, exclusão) que você realizou.

[DESCRIÇÃO DA TAREFA OU CÓDIGO]

```

---

## 3. Prompt Adaptável para Projetos SEM `PROMPTS.md`

**Quando usar:** Quando você estiver em um projeto que **não tem** um arquivo `PROMPTS.md`.

**Como usar:** Forneça à IA uma visão geral da estrutura do projeto (usando o comando `ls -R`, por exemplo).

```text
# CONTEXTO
Aja como um arquiteto de software sênior. Sua tarefa é se adaptar aos padrões de um projeto existente e sugerir melhorias.

# TAREFA

**Passo 1: Análise e Inferência de Padrões**
Analise a estrutura de arquivos que fornecerei. Seu objetivo é inferir as convenções de nomenclatura e arquitetura. Preste atenção especial a:
*   **Padrão de Nomenclatura:** Existe um padrão misto de idiomas (ex: Português para negócio, Inglês para código)?
*   **Localização do Ponto de Entrada:** O arquivo principal (`App.tsx`, `main.js`) está na raiz?

**Passo 2: Relatório e Sugestões Proativas**
Com base no que você inferiu, faça o seguinte:
1.  Descreva os padrões que você encontrou.
2.  **Sugira melhorias proativamente.** Por exemplo:
    *   Se o ponto de entrada não está na raiz, sugira movê-lo.
    *   Se você inferiu um padrão de nomenclatura misto (PT/EN), mas encontrou arquivos de negócio em Inglês (ex: `screens/Cart`), sugira traduzi-los para o padrão (ex: `screens/cesta`) e remover os originais.
3.  Pergunte se eu desejo aplicar alguma das melhorias sugeridas.

**Passo 3: Execução da Tarefa**
Após minha confirmação, execute a solicitação que eu fizer.

# INFORMAÇÕES DO PROJETO
[COLE AQUI A ESTRUTURA DE DIRETÓRIOS OU EXEMPLOS DE CÓDIGO]
```

## Apêndice: Exemplo de Estrutura de Diretórios (Projeto React Native Atual)

A estrutura abaixo serve como guia para as IAs. Ela reflete a arquitetura detalhada do projeto. **NÃO A SIMPLIFIQUE.**

'''
.
├── App.tsx
├── package.json
└── src
    ├── application
    │   ├── http
    │   │   ├── EstabelecimentoHttp.ts
    │   │   └── ProdutoHttp.ts
    │   ├── mapper
    │   │   ├── aggregate
    │   │   │   ├── EstabelecimentoMapperAggregate.ts
    │   │   │   └── ProdutoMapperAggregate.ts
    │   │   └── ExceptionMapper.ts
    │   ├── rule
    │   │   └── CestaRule.ts
    │   └── service
    │       ├── EstabelecimentoService.ts
    │       └── ProdutoService.ts
    ├── component
    │   └── index.ts
    ├── core
    ├── dto
    │   ├── request
    │   │   └── produto
    │   │       └── ProdutoListarRequest.ts
    │   └── response
    │       ├── estabelecimento
    │       │   ├── aggregate
    │       │   │   └── EstabelecimentoResponseAggregate.ts
    │       │   ├── EstabelecimentoAvaliacaoResponse.ts
    │       │   ├── EstabelecimentoIdentificacaoResponse.ts
    │       │   └── EstabelecimentoResponse.ts
    │       └── produto
    │           ├── aggregate
    │           │   └── ProdutoResponseAggregate.ts
    │           ├── ProdutoAvaliacaoResponse.ts
    │           ├── ProdutoCondicaoResponse.ts
    │           ├── ProdutoIdentificacaoResponse.ts
    │           ├── ProdutoPrecoResponse.ts
    │           └── ProdutoResponse.ts
    ├── infrastructure
    │   ├── http
    │   │   ├── EstabelecimentoHttpImpl.ts
    │   │   └── ProdutoHttpImpl.ts
    │   ├── mapper
    │   │   ├── aggregate
    │   │   │   ├── EstabelecimentoMapperAggregateImpl.ts
    │   │   │   └── ProdutoMapperAggregateImpl.ts
    │   │   └── ExceptionMapperImpl.ts
    │   ├── rule
    │   │   └── CestaRuleImpl.ts
    │   └── service
    │       ├── EstabelecimentoServiceImpl.ts
    │       └── ProdutoServiceImpl.ts
    ├── menu
    │   ├── MenuStack.tsx
    │   ├── MenuStackParams.tsx
    │   └── tabBar
    │       ├── MenuBottomTabBar.tsx
    │       ├── custom
    │       │   ├── MenuBottomTabBarCustom.tsx
    │       │   └── touchable
    │       │       ├── MenuBottomTabBarCustomTouchable.tsx
    │       │       └── MenuBottomTabBarCustomTouchableStyle.tsx
    │       └── tabs
    │           ├── cesta
    │           │   ├── MenuStackCesta.tsx
    │           │   └── MenuStackCestaParams.ts
    │           ├── ofertas
    │           │   ├── MenuStackOfertas.tsx
    │           │   └── MenuStackOfertasParams.ts
    │           ├── pedidos
    │           │   ├── MenuStackPedidos.tsx
    │           │   └── MenuStackPedidosParams.ts
    │           └── perfil
    │               ├── MenuStackPerfil.tsx
    │               └── MenuStackPerfilParams.ts
    ├── model
    │   ├── cesta
    │   │   └── CestaModel.ts
    │   ├── estabelecimento
    │   │   ├── aggregate
    │   │   │   └── EstabelecimentoModelAggregate.ts
    │   │   ├── EstabelecimentoAvaliacaoModel.ts
    │   │   ├── EstabelecimentoIdentificacaoModel.ts
    │   │   └── EstabelecimentoModel.ts
    │   └── produto
    │       ├── aggregate
    │       │   └── ProdutoModelAggregate.ts
    │       ├── ProdutoAvaliacaoModel.ts
    │       ├── ProdutoCondicaoModel.ts
    │       ├── ProdutoIdentificacaoModel.ts
    │       ├── ProdutoModel.ts
    │       └── ProdutoPrecoModel.ts
    ├── screen
    │   ├── cesta
    │   │   └── inicio
    │   │       ├── CestaInicioScreen.tsx
    │   │       ├── localizacao
    │   │       └── produtos
    │   ├── ofertas
    │   │   ├── estabelecimento
    │   │   ├── inicio
    │   │   └── produto
    │   ├── pedidos
    │   │   └── inicio
    │   │       └── PedidosInicioScreen.tsx
    │   └── perfil
    │       └── inicio
    │           └── PerfilInicioScreen.tsx
    └── store
        ├── slices
        │   └── CestaSlice.ts
        └── Store.ts
'''
