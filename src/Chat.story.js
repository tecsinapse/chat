import React from 'react';
import { ChatWrapper } from './ChatWrapper';
import { Chat } from './Chat';
import { dummyMessagesMedia, dummyMessagesText } from './dummyMessages';

export default {
  title: 'Chat',
  component: Chat,
};

export const echo = () => <ChatWrapper isMaximizedOnly />;
echo.story = {
  name: 'Chat Echo',
};
export const status = () => (
  <ChatWrapper isMaximizedOnly initialMessages={dummyMessagesText} />
);
status.story = { name: 'Status Text' };
export const image = () => (
  <ChatWrapper initialMessages={dummyMessagesMedia} isMaximizedOnly />
);
image.story = { name: 'Status Image' };
export const error = () => (
  <ChatWrapper isMaximizedOnly error="Erro de conexão. Tente mais tarde!" />
);
error.story = { name: 'Error Connection' };
export const blocked = () => (
  <ChatWrapper
    isMaximizedOnly
    isBlocked
    blockedMessage="Já se passaram 24h desde a última mensagem enviada pelo cliente,
          por isso não é possível enviar nova mensagem por esse canal de comunicação, por favor,
          entre em contato com o cliente por outro meio."
  />
);
blocked.story = { name: 'Chat Blocked' };
