import * as React from 'react';
import { ServicoChat } from '../servicos/chat/ChatService';
import { decode, decodeAudioData } from '../utils/audio';

export const useAudioPlayer = (chatService: ServicoChat | null) => {
    const [loadingMessageId, setLoadingMessageId] = React.useState<number | null>(null);
    const [playingMessageId, setPlayingMessageId] = React.useState<number | null>(null);

    const audioContextRef = React.useRef<AudioContext | null>(null);
    const sourceRef = React.useRef<AudioBufferSourceNode | null>(null);

    const stopAudio = React.useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        setPlayingMessageId(null);
    }, []);

    const playAudio = React.useCallback(async (text: string, messageId: number) => {
        if (!chatService) return;

        const isCurrentlyLoading = loadingMessageId === messageId;
        const isCurrentlyPlaying = playingMessageId === messageId;

        stopAudio();
        
        if (isCurrentlyPlaying || isCurrentlyLoading) {
            return; 
        }

        setLoadingMessageId(messageId);
        
        try {
            const base64Audio = await chatService.generateSpeech(text);
            if (!base64Audio) throw new Error("Nenhum dado de áudio recebido.");

            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioContext = audioContextRef.current;
            
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            
            source.onended = () => {
                if (playingMessageId === messageId) {
                    setPlayingMessageId(null);
                }
                sourceRef.current = null;
            };

            source.start();
            sourceRef.current = source;
            setPlayingMessageId(messageId);

        } catch (error) {
            console.error("Erro ao reproduzir áudio:", error);
            setPlayingMessageId(null);
        } finally {
            setLoadingMessageId(null);
        }

    }, [chatService, stopAudio, playingMessageId, loadingMessageId]);

    const isPlaying = (messageId: number) => playingMessageId === messageId;
    const isLoading = (messageId: number) => loadingMessageId === messageId;

    React.useEffect(() => {
        return () => {
            stopAudio();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [stopAudio]);

    return { playAudio, isPlaying, isLoading };
};
