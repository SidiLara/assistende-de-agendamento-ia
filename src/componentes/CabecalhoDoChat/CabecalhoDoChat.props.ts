export interface CabecalhoDoChatProps {
    consultantName: string;
    assistantName: string;
    consultantPhoto: string;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isChatStarted: boolean;
}