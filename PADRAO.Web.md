PADRÃO DE ARQUITETURA: React (Web / AI Studio)

Este documento define as regras de arquitetura para todos os projetos React Web. Você DEVE seguir estas regras em todas as respostas de código.

1. Filosofia Central

Código Limpo (Clean Code): O código deve ser legível, simples e direto.

Responsabilidade Única (SRP): Cada arquivo e função deve ter uma única responsabilidade.

Legível para Júniores: A complexidade deve ser evitada. A prioridade é a facilidade de manutenção por qualquer nível de desenvolvedor.

2. Estrutura de Pastas (Híbrida pt-BR / en-US)

A estrutura de pastas src mistura Português (para domínio de negócio) e Inglês (para conceitos técnicos).

Português (pt-BR): Pastas que representam o negócio ou a UI.

componentes/: Componentes reutilizáveis (Atomic Design: átomos, moléculas).

modulos/: Seções complexas da aplicação (organismos).

paginas/: As páginas/rotas da aplicação.

servicos/: Lógica de negócio (ex: formatação de dados).

Inglês (en-US): Pastas que representam a tecnologia.

core/: Configuração central (ex: instâncias do Axios, i18n).

hooks/: Hooks React reutilizáveis.

utils/: Funções puras e utilitários (ex: formatarData).

assets/: Imagens, fontes, etc.

navigation/: Configuração de rotas.

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
│   ├── componentes/    (Domínio - pt)
│   │   ├── Botao/      <-- (Nome em Português)
│   │   └── Cartao/     <-- (Nome em Português)
│   │
│   ├── modulos/        (Domínio - pt)
│   │   ├── Cabecalho/  <-- (Nome em Português)
│   │   └── Rodape/     <-- (Nome em Português)
│   │
│   ├── paginas/        (Domínio - pt)
│   │   ├── Inicio/     <-- (Nome em Português)
│   │   └── Perfil/     <-- (Nome em Português)
│   │
│   └── servicos/       (Domínio - pt)
│       ├── autenticacao/
│       └── usuario/
│
└── index.tsx           (ARQUIVO RAIZ)



3. Padrão de Componentes (Obrigatório)

NENHUM componente deve ser um arquivo único (Botao.tsx). Todo componente DEVE ser uma pasta para co-localizar seus arquivos (lógica, tipos, estilos).

Esta é a estrutura obrigatória para CADA componente (seja em componentes/, modulos/ ou paginas/):

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

OBRIGATÓRIO: Dentro de componentes/, modulos/, paginas/, os nomes das pastas de componentes, arquivos e interfaces DEVEM ser em Português (PascalCase).

Correto: src/componentes/BotaoPrincipal/, src/paginas/TelaDeLogin/.

ERRADO: src/componentes/MainButton/, src/paginas/LoginScreen/.

Interfaces e Props seguem o nome do componente: BotaoPrincipalProps.

Regra Técnica (Pastas em Inglês):

Dentro de hooks/, utils/, core/, os nomes dos arquivos DEVEM ser em Inglês (camelCase ou PascalCase conforme o padrão).

Exemplo: src/hooks/useAuthentication.ts, src/utils/formatDate.ts.

Variáveis e Funções Internas:

camelCase sempre (nomeUsuario, buscarDados).

5. Apêndice: Como Aplicar

Para Novos Projetos

Siga a estrutura de pastas e o padrão de componentes desde o início. Gere todos os arquivos separados, respeitando a regra de nomenclatura híbrida (Seção 4).

Para Refatoração

Analisar: Receba o código monolítico.

Renomear Pastas de Domínio: Mude pastas de negócio para Português (ex: screens -> paginas, components -> componentes).

Renomear Pastas de Componentes: Mude os nomes das pastas de componentes para Português (ex: MainButton -> BotaoPrincipal, Header -> Cabecalho).

Fatorar Componentes: Pegue cada arquivo de componente (ex: Login.tsx) e quebre-o na estrutura de pastas (Login/index.ts, Login.tsx, Login.props.ts, Login.style.ts).

Mover Arquivos Raiz: Garanta que index.tsx e index.html (ou App.tsx) estejam na raiz, fora da pasta src/ (ou conforme o padrão do framework, mas sempre no nível superior).