# Guia de Prompts de IA (Arquitetura VITE / WEB - AI Studio)

Este documento centraliza os prompts de IA para garantir que todo o código siga os padrões de uma arquitetura limpa, escalável e específica deste projeto.

---

## 0. Prompt de Configuração Inicial (Prompt Mestre)

**Quando usar:** No início de cada sessão de trabalho. A memória da IA é baseada em sessão. Este prompt garante que ela aprenda (ou relembre) as regras do projeto.

**Como usar:** Copie e cole este prompt no chat da IA assim que você começar a trabalhar.

```text
# CONTEXTO
Você é Gemini, uma IA assistente de programação especialista na arquitetura de software deste projeto. Sua primeira tarefa é se configurar.

# TAREFA
1.  **Localize e Leia o Guia:** Encontre um arquivo chamado `PROMPTSVITE.md` na raiz do projeto.
2.  **Internalize a Arquitetura:** Analise o conteúdo completo do `PROMPTSVITE.md`, tratando o Apêndice ("Planta Baixa da Arquitetura") como a fonte da verdade absoluta sobre a estrutura de arquivos e as regras de design do projeto.
3.  **Confirme e Aguarde:** Após ler e entender as regras, responda com a seguinte mensagem e NADA MAIS: "Pronto. Já internalizei as regras de especialista do arquivo `PROMPTSVITE.md` e estou pronto para ajudar. O que vamos fazer?"
````

-----

## 1\. Prompt de Análise (Diagnóstico e Refatoração)

**Quando usar:** Para que a IA analise a estrutura do projeto, liste os desvios em relação à arquitetura e execute um plano de refatoração.

**Como usar:** Copie o prompt abaixo e, na seção `[COLE O CÓDIGO AQUI]`, insira a saída do comando `ls -R` que você deseja analisar.

```text
# CONTEXTO
Aja como um Arquiteto de Software especialista neste projeto. Conforme as regras do `PROMPTSVITE.md`, sua tarefa é ANALISAR, RELATAR os desvios e, se solicitado, EXECUTAR a correção.

# TAREFA

**Passo 1: Análise Arquitetural**
Analise a estrutura de arquivos fornecida. Compare-a rigorosamente com a "Planta Baixa da Arquitetura" no Apêndice e com todas as regras de design. Liste todas as violações, incluindo:
* Arquivos essenciais da raiz fora do lugar (ex: `index.tsx` ou `App.tsx` dentro de `src/`).
* Violações de Camadas (ex: uma classe de `infrastructure` importada em `model`).
* Nomenclatura incorreta de arquivos ou pastas (idioma, casing, sufixos como `ServiceImpl`).
* Módulos reutilizáveis que não seguem o padrão de 4 arquivos.
* Falta de arquivos `...Event.ts` para componentes que emitem eventos tipados.
* Arquivos colocados em diretórios errados (ex: um DTO fora de `src/dto`, um arquivo de Rota fora de `src/routes`, uma Página fora de `src/pages`).

**Passo 2: Plano de Ação**
Após a lista, apresente um plano de refatoração detalhado. O plano DEVE incluir a criação, a atualização de TODAS as importações e a **exclusão dos itens antigos** (exceto arquivos bloqueados pelo ambiente como `index.tsx`). Ao final, pergunte se eu desejo que você execute este plano.

# CÓDIGO PARA ANÁLISE
[COLE AQUI A SAÍDA DO `ls -R`]
```

-----

## 2\. Prompt para Refatorar ou Criar Código (Padrão do Projeto)

**Quando usar:** Para criar novas funcionalidades ou refatorar códigos existentes, garantindo que a arquitetura específica do projeto seja seguida à risca.

**Como usar:** Descreva a funcionalidade que você quer criar ou cole o código que precisa ser refatorado na seção `[DESCRIÇÃO DA TAREFA OU CÓDIGO]`.

```text
# CONTEXTO
Aja como um Arquiteto de Software especialista na arquitetura deste projeto. Usando as regras do `PROMPTSVITE.md` que você já internalizou, crie ou refatore o código solicitado.

# REGRAS DE ARQUITETURA E DESIGN (NÍVEL ESPECIALISTA)

1.  **Estrutura da Raiz:** O arquivo de entrada principal (`index.tsx`), o componente raiz (`App.tsx`) e o `PROMPTSVITE.md` DEVEM estar localizados na raiz do projeto. A pasta principal do código-fonte é `src/`.

2.  **Arquitetura em Camadas:** As dependências fluem de fora para dentro: `infrastructure` -> `application` -> `model`. A camada `model` é o núcleo e não conhece ninguém.

3.  **Nomenclatura de Camadas:** Interfaces são definidas em `application` (ex: `ProdutoService.ts`) e suas implementações concretas ficam em `infrastructure`, sempre com o sufixo `Impl` (ex: `ProdutoServiceImpl.ts`). Isso se aplica a `Service`, `Http`, `Rule` e `Mapper`.

4.  **Módulos Reutilizáveis vs. Componentes Locais:**
    * **Módulos (`src/component`):** São reutilizáveis. DEVEM ser uma pasta com **4 arquivos** (`NomeDoModulo.tsx`, `NomeDoModuloStyle.ts`, `NomeDoModuloProps.ts`, `index.ts`).
    * **Componentes Locais (dentro de uma página):** Não são reutilizáveis e **NÃO DEVEM** ter um `index.ts`. A subpasta `.../lista/item/` é um padrão comum para componentes de item de lista.

5.  **Nomenclatura em Português (Camada de Visão):**
    * **Finalidade:** Garantir a legibilidade e padronização do código-fonte na camada de visão (View).
    * **Regra (Roteamento `routes`):** As pastas e arquivos *dentro* de `src/routes/` DEVEM estar em português (ex: `src/routes/RotasAutenticadas.tsx`), com exceção do arquivo principal `AppRoutes.tsx`.
    * **Regra (Componentes):** Todos os nomes de arquivos e subpastas dentro de `src/component/` DEVEM estar em português (ex: `src/component/BotaoPrincipal/`).
    * **Regra (Páginas):** A pasta principal das telas DEVE se chamar `src/pages/`.
    * **Regra (Conteúdo de `pages`):** Todas as subpastas e arquivos *dentro* de `src/pages/` DEVEM estar em português (ex: `.../pages/ofertas/Inicio/`).
    * **Exemplos Incorretos:** `src/routes/AuthenticatedRoutes.tsx`, `src/component/MainButton/`, `src/screens/`, `.../pages/offers/Home/`.

6.  **Arquivos de Eventos (`...Event.ts`):**
    * **Finalidade:** Definir interfaces de tipo para as props de eventos de um componente (ex: `onPress`), garantindo um contrato claro.
    * **Exemplo:** Um `OfertasInicioFiltrosListaItem.tsx` que tem uma prop `onSelectFilter` terá um arquivo `OfertasInicioFiltrosListaItemEvent.ts` com uma interface `OfertasInicioFiltrosListaItemEvent { onSelectFilter(id: string): void; }`.

7.  **O Padrão `aggregate`:** Representa um modelo de dados complexo, composto por várias entidades. A subpasta `aggregate/` é o gatilho para este padrão em `model`, `dto` e `mapper`.

8.  **Estrutura de Roteamento (Web):**
    * A definição das rotas (usando `react-router-dom`) reside em `src/routes/`. O arquivo principal é `AppRoutes.tsx`.
    * O componente `App.tsx` (na raiz) é responsável por renderizar o `BrowserRouter` e o `AppRoutes.tsx`.
    * O arquivo `index.tsx` (na raiz) é responsável por renderizar o `App.tsx` no DOM.
    * A implementação visual das páginas reside em `src/pages/`.
    * As rotas definidas em `AppRoutes.tsx` devem corresponder às pastas em `src/pages/` (ex: a rota `/ofertas` renderiza o componente de `src/pages/ofertas/Inicio/`).

# TAREFA
Execute a tarefa a seguir, garantindo que o resultado final esteja 100% alinhado com a arquitetura de especialista definida. Isso inclui criar/atualizar todos os arquivos necessários, manter a separação de camadas e seguir rigorosamente as convenções de nomenclatura.

[DESCRIÇÃO DA TAREFA OU CÓDIGO]
```

-----

## 3\. Prompt Adaptável para Projetos SEM `PROMPTSVITE.md`

**Quando usar:** Em um projeto que não tem um `PROMPTSVITE.md`, para que a IA possa analisar, entender e proativamente sugerir nossa arquitetura.

**Como usar:** Cole a estrutura de diretórios (`ls -R`) do novo projeto na seção `[INFORMAÇÕES DO PROJETO]`.

```text
# CONTEXTO
Aja como um arquiteto de software sênior. Sua tarefa é se adaptar aos padrões de um projeto existente e, se for o caso, sugerir melhorias baseadas em uma arquitetura comprovada.

# TAREFA

**Passo 1: Análise e Inferência**
Analise a estrutura de arquivos e o código fornecido. Infira as convenções de nomenclatura e arquitetura existentes no projeto.

**Passo 2: Relatório e Sugestões Proativas**
Descreva os padrões que você encontrou. Se o projeto parecer desorganizado, **sugira proativamente a arquitetura definida na "Planta Baixa da Arquitetura" como um padrão ideal**, explicando seus benefícios (clareza, manutenibilidade, etc.).

**Passo 3: Execução**
Após minha confirmação, execute a solicitação que eu fizer, seja ela para refatorar para o novo padrão ou apenas uma pequena alteração.

# INFORMAÇÕES DO PROJETO
[COLE AQUI A ESTRUTURA DE DIRETÓRIOS OU CÓDIGO]

# APÊNDICE PARA SUGESTÃO (ARQUITETURA IDEAL)
[COLE AQUI A SEÇÃO DO APÊNDICE DESTE `PROMPTSVITE.MD`]
```

-----

## Apêndice: Planta Baixa da Arquitetura (VITE / WEB - AI Studio)

A estrutura abaixo é a fonte da verdade da nossa arquitetura. **NÃO A SIMPLIFIQUE.**

```
.
├── App.tsx
├── index.tsx
└── src
    ├── application
    │   ├── http
    │   │   └── EstabelecimentoHttp.ts
    │   ├── mapper
    │   │   └── aggregate
    │   │       └── EstabelecimentoMapperAggregate.ts
    │   ├── rule
    │   │   └── CestaRule.ts
    │   └── service
    │       └── EstabelecimentoService.ts
    ├── component
    │   └── BotaoCustomizado
    │       ├── BotaoCustomizado.tsx
    │       ├── BotaoCustomizadoProps.ts
    │       ├── BotaoCustomizadoStyle.ts
    │       └── index.ts
    ├── core
  	├── dto
  	│   ├── request
  	│   │   └── produto
  	│   │       └── ProdutoListarRequest.ts
  	│   └── response
  	│       └── ...
  	├── infrastructure
  	│   ├── http
  	│   │   └── EstabelecimentoHttpImpl.ts
  	│   ├── mapper
  	│   │   └── aggregate
  	│   │       └── EstabelecimentoMapperAggregateImpl.ts
  	│   ├── rule
  	│   │   └── CestaRuleImpl.ts
  	│   └── service
  	│       └── EstabelecimentoServiceImpl.ts
  	├── model
  	│   ├── estabelecimento
  	│   │   ├── EstabelecimentoModel.ts
  	│   │   └── aggregate
  	│  	       └── EstabelecimentoModelAggregate.ts
  	│   └── produto
  	│       └── ...
  	├── pages
  	│   └── ofertas
  	│       └── inicio
  	│           ├── OfertasInicioPagina.tsx
  	│           ├── OfertasInicioPaginaStyle.ts
  	│        	 ├── OfertasInicioPaginaProps.ts
  	│          	└── filtros
  	│  	         	    └── lista
  	│  	         	 	 	    └── item
  	│  	         	 	 	 	 	    ├── OfertasInicioFiltrosListaItem.tsx
  	│  	   	     	 	 	 	 	    └── OfertasInicioFiltrosListaItemEvent.ts
  	├── routes
  	│   ├── AppRoutes.tsx
  	│   ├── RotasAutenticadas.tsx
  	│   └── RotasPublicas.tsx
  	└── store
  		    ├── Store.ts
  		    └── slices
  		   	    └── CestaSlice.ts
```