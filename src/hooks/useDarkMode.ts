import * as React from 'react';

/**
 * Determina o tema inicial com base na seguinte prioridade:
 * 1. A escolha do usuário salva no localStorage em uma visita anterior.
 * 2. A preferência de tema do sistema operacional (OS/browser).
 * 3. Um padrão de 'light' como fallback.
 */
const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') {
        return 'light'; // Padrão para renderização no servidor (Server-Side Rendering)
    }
    
    // 1. Verifica se existe um tema salvo de uma sessão anterior.
    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme; // Usa a preferência salva pelo usuário.
    }

    // 2. Se não há tema salvo, detecta a preferência do sistema.
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

export const useDarkMode = (): { theme: 'light' | 'dark'; toggleTheme: () => void } => {
    // Inicializa o estado com o tema calculado pela nossa lógica.
    const [theme, setTheme] = React.useState<'light' | 'dark'>(getInitialTheme);

    // Função para alternar o tema, chamada pelo botão na interface.
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Este efeito sincroniza o estado `theme` com o DOM (para o CSS) e o localStorage (para persistência).
    // Ele é executado sempre que a variável `theme` muda.
    React.useEffect(() => {
        const root = window.document.documentElement;
        
        // Atualiza a classe no elemento <html> para que o Tailwind CSS aplique o tema correto.
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Salva a escolha atual no localStorage para ser lembrada na próxima visita.
        try {
            window.localStorage.setItem('theme', theme);
        } catch (e) {
            console.error('Falha ao salvar o tema no localStorage', e);
        }
    }, [theme]);

    return { theme, toggleTheme };
};
