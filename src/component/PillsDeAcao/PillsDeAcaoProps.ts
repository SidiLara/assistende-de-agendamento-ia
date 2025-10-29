import { PillsDeAcaoEvent } from "./PillsDeAcaoEvent";

interface PillOption {
    label: string;
    value: string;
}

export interface PillsDeAcaoProps extends PillsDeAcaoEvent {
    options: PillOption[];
}
