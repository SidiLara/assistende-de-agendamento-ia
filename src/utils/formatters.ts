export const formatConversation = (messages: { user: string; text: string }[]): string => {
    return messages.map(message => `${message.user}: ${message.text}`).join('\n');
};
