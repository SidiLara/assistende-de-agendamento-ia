import { RespostaAi } from "../modelos/RespostaAi";

export class ResultadoFluxo {
    constructor(
        public readonly success: boolean,
        public readonly newAiResponse: RespostaAi,
        public readonly userResponse: string,
        public readonly isFinal: boolean
    ) {}
}