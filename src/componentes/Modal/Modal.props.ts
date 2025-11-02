import * as React from 'react';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    titulo: string;
    children: React.ReactNode;
}