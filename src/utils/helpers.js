import { load } from "./loadChatsInfos";
import { COMPONENT_LOCATION } from "../constants/COMPONENT_LOCATION";
import { fetchMessages } from "./fetch";
import { buildChatMessageObject } from "./message";
import { ChatStatus } from "../constants";

export async function loadComponent(
  chatInitConfig,
  setComponentInfo,
  setIsLoadingInitialState,
  setView,
  setCurrentChat,
  userMock,
  token
) {
  const info = await load({ ...chatInitConfig, userMock, token });
  setComponentInfo(info);
  setIsLoadingInitialState(false);
  if (info.currentClient && Object.keys(info.currentClient).length > 0) {
    // quando a visualização é de um cliente específico, então define as informações
    // desse cliente como currentChat e exibe o chat direto
    setView(COMPONENT_LOCATION.CHAT);
    const chats = info.allChats.filter((chat) =>
      info.currentClient.clientChatIds.includes(chat.chatId)
    );
    setCurrentChat({
      name: info.currentClient.clientName,
      connectionKey: info.currentClient.connectionKey,
      destination: info.currentClient.destination,
      disabled: info.currentClient.disabled,
      status: info.currentClient.status,
      chats: chats,
    });
  }
}

export const onSelectedChatMaker = (
  initialInfo,
  setIsLoading,
  setCurrentChat,
  setMessages,
  setBlocked,
  chatApiUrl,
  messagesEndRef,
  onReadAllMessagesOfChat,
  userNamesById
) => async (chat) => {
  setIsLoading(true);
  setCurrentChat(chat);
  const response = await fetchMessages({
    chatApiUrl,
    connectionKey: initialInfo.connectionKey,
    destination: initialInfo.destination,
    chatId: chat.chatId,
    updateUnreadWhenOpen: chat.updateUnreadWhenOpen,
  });

  const { content } = response;

  const messages = content
    .map((externalMessage) =>
      buildChatMessageObject(externalMessage, chat.chatId, userNamesById)
    )
    .reverse();
  setMessages(messages);
  setBlocked(chat, ChatStatus.isBlocked(chat.status));
  setIsLoading(false);
  if (chat.updateUnreadWhenOpen) {
    onReadAllMessagesOfChat(chat);
  }

  setTimeout(function () {
    // workaround to wait for all elements to render
    if (messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    }
  }, 700);
};

export const isEquals = (one, another) =>
  one.chatId === another.chatId &&
  one.connectionKey === another.connectionKey &&
  one.destination === another.destination;

export const isEmpty = (obj) => {
  if (obj) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
  }
  return true;
};
