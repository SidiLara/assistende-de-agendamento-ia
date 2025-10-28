interface PillOption {
    label: string;
    value: string;
}

export interface ActionPillsProps {
    options: PillOption[];
    onSelect: (value: string, label?: string) => void;
}
