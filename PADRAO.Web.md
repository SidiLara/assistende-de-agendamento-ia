📝 PADRÃO DE ARQUITETURA: React (Web / AI Studio)

Este documento define as regras de arquitetura para todos os projetos React Web. Você DEVE seguir estas regras em todas as respostas de código.

1. Filosofia Central

1.1 Código Limpo (Clean Code): O código deve ser legível, simples e direto.

1.2 Responsabilidade Única (SRP): Cada arquivo e função deve ter uma única responsabilidade.

1.3 Legível para Júniores: A complexidade deve ser evitada. A prioridade é a facilidade de manutenção por qualquer nível de desenvolvedor.

1.4 Desacoplamento e Coesão (Quebra de Códigos Extensos): Arquivos excessivamente longos que acumulam múltiplas responsabilidades (conhecidos como "God Components" ou "God Contexts") SÃO PROIBIDOS. Toda lógica complexa deve ser quebrada em unidades menores e coesas. A principal estratégia para isso é a extração de lógica de negócio para custom hooks especializados.

Exemplo Prático: Um AppDataContext.tsx que gerencia usuários, agendamentos, empresas e o estado da UI deve ser re-fatorado. A lógica de cada domínio deve ser extraída para seu próprio hook (ex: useGerenciadorDeAgendamentos.ts, useGerenciadorDeUsuarios.ts). O contexto passa a ser apenas um orquestrador que provê o resultado desses hooks para a aplicação. Isso melhora a legibilidade, o teste e a manutenção.

2. Estrutura de Pastas (Híbrida pt-BR / en-US)

A estrutura de pastas src mistura Português (para domínio de negócio) e Inglês (para conceitos técnicos).

Nomenclatura

Conceito

Pastas

Português (pt-BR)

Pastas que representam o negócio ou a UI (Domínio).

components/, modules/, pages/, services/

Inglês (en-US)

Pastas que representam a tecnologia (Técnico).

core/, hooks/, utils/, assets/, navigation/

Estrutura Visual (Exemplos em Português)

/
├── public/
│   └── index.html      (ARQUIVO RAIZ)
├── src/
│   ├── assets/         (Técnica - en)
│   ├── core/           (Técnica - en)
│   ├── hooks/          (Técnica - en)
│   ├── navigation/     (Técnica - en)
│   ├── utils/          (Técnica - en)
│   │
│   ├── components/      (Domínio - pt)
│   │   ├── Botao/      <-- (Nome em Português)
│   │   └── Cartao/     <-- (Nome em Português)
│   │
│   ├── modules/        (Domínio - pt)
│   │   ├── Cabecalho/  <-- (Nome em Português)
│   │   └── Rodape/     <-- (Nome em Português)
│   │
│   ├── pages/          (Domínio - pt)
│   │   ├── Inicio/     <-- (Nome em Português)
│   │   └── Perfil/     <-- (Nome em Português)
│   │
│   └── services/       (Domínio - pt)
│       ├── autenticacao/
│       └── usuario/
│
└── index.tsx           (ARQUIVO RAIZ)


3. Padrão de Components (Obrigatório)

NENHUM componente deve ser um arquivo único (Botao.tsx). Todo componente DEVE ser uma pasta para co-localizar seus arquivos (lógica, tipos, estilos).

Esta é a estrutura obrigatória para CADA componente (seja em components/, modules/ ou pages/):

└── [NomeDoComponenteEmPortugues]/  <-- (Ex: Botao, CartaoUsuario, etc.)
    ├── index.ts                     // Exportador (Barrel file)
    ├── [Nome].tsx                   // Lógica principal e JSX (Ex: Botao.tsx)
    ├── [Nome].props.ts              // Tipos (Props e Interfaces) (Ex: Botao.props.ts)
    ├── [Nome].style.ts              // Estilização (Styled-Components ou CSS Modules)
    └── (Opcional) [Nome].hook.ts    // Hook customizado para lógica complexa


Exemplo de Conteúdo dos Arquivos (Componente: "Botao")

Botao.props.ts (Define o "contrato")

export interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: 'primaria' | 'secundaria';
}


Botao.style.ts (Define a "aparência")

import styled from 'styled-components';
// (Ou pode ser um arquivo .css para CSS Modules)

export const Container = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
`;


Botao.tsx (Define o "comportamento")

import React from 'react';
import { BotaoProps } from './Botao.props';
import { Container } from './Botao.style';

export const Botao: React.FC<BotaoProps> = ({ 
  titulo, 
  onPress, 
  variante = 'primaria' 
}) => {
  // Lógica do componente (se houver)
  
  return (
    <Container onClick={onPress}>
      {titulo}
    </Container>
  );
};


index.ts (Define a "exportação")

export { Botao } from './Botao';
export type { BotaoProps } from './Botao.props';


4. Nomenclatura (Híbrida - REGRA CRÍTICA)

A nomenclatura segue a regra da pasta onde o arquivo está.

Regra de Domínio (Pastas em Português):

OBRIGATÓRIO: Dentro de components/, modules/, pages/, services/, os nomes das pastas de components, arquivos e interfaces DEVEM ser em Português (PascalCase).

Correto: src/components/BotaoPrincipal/, src/pages/Login/.

ERRADO: src/components/MainButton/, src/pages/LoginScreen/.

Interfaces e Props seguem o nome do componente: BotaoPrincipalProps.

Regra Técnica (Pastas em Inglês):

Dentro de utils/ e core/, os nomes dos arquivos DEVEM ser em Inglês (camelCase ou PascalCase conforme o padrão).

Exemplo: src/utils/formatDate.ts, src/core/apiClient.ts.

Regra Híbrida para Hooks (Pasta hooks/):

A pasta hooks/ é considerada técnica, mas seu conteúdo pode ser híbrido:

Hooks que encapsulam lógica de negócio DEVEM ter nomes em Português para manter a consistência com o domínio (ex: useGerenciadorDeAgendamentos.ts, useAutenticacao.ts).

Hooks que são utilitários genéricos (não ligados ao negócio) DEVEM ter nomes em Inglês (ex: useBodyScrollLock.ts, useDebounce.ts).

5. Apêndice: Como Aplicar

Para Novos Projetos

Siga a estrutura de pastas e o padrão de components desde o início. Gere todos os arquivos separados, respeitando a regra de nomenclatura híbrida (Seção 4).

Para Refatoração

Analisar: Receba o código monolítico.

Renomear Pastas de Domínio: Mude pastas de negócio para Português (ex: screens -> pages, components -> components).

Renomear Pastas de components: Mude os nomes das pastas de components para Português (ex: MainButton -> BotaoPrincipal, Header -> Cabecalho).

Fatorar components: Pegue cada arquivo de componente (ex: Login.tsx) e quebre-o na estrutura de pastas (Login/index.ts, Login.tsx, Login.props.ts, Login.style.ts).

Mover Arquivos Raiz: Garanta que index.tsx e index.html (ou App.tsx) estejam na raiz, fora da pasta src/ (ou conforme o padrão do framework, mas sempre no nível superior).