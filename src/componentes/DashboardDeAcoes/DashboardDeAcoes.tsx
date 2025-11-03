import * as React from 'react';
import { DashboardDeAcoesProps } from './DashboardDeAcoes.props';
import { CartaoDeAcao } from '../CartaoDeAcao';

export const DashboardDeAcoes: React.FC<DashboardDeAcoesProps> = ({ acoes }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acoes.map((acao, index) => (
                <CartaoDeAcao
                    key={index}
                    titulo={acao.titulo}
                    linkPara={acao.linkPara}
                    icone={acao.icone}
                />
            ))}
        </div>
    );
};
