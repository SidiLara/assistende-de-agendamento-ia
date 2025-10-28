interface PillOption {
    label: string;
    value: string;
}

export interface PillsDeAcaoProps {
    options: PillOption[];
    onSelect: (value: string, label?: string) => void;
}
