export interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}
