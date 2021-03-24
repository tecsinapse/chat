import React from 'react';

export const allChatsMap = new Map();
const ChatContext = React.createContext(allChatsMap);

export const getChatId = (chat) => {
    return `${chat.chatId}.${chat.connectionKey}.${chat.destination}`
}

export default ChatContext;