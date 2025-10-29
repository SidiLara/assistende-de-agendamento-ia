interface PillOption {
    label: string;
    value: string;
}

export interface PillsDeAcaoProps {
    onSelect: (value: string, label?: string) => void;
    options: PillOption[];
}
