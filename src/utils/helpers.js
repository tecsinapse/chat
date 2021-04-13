import { load } from "./loadChatsInfos";
import { COMPONENT_LOCATION } from "../constants/COMPONENT_LOCATION";
import { buildChatMessageObject } from "./message";
import { ChatStatus } from "../constants";
import { stringFormattedToMoment, momentNow } from "./dates";

export async function loadComponent({
  chatInitConfig,
  setComponentInfo,
  setIsLoadingInitialState,
  setView,
  setCurrentChat,
  userMock,
  token,
}) {
  const info = await load({ ...chatInitConfig, userMock, token });

  setComponentInfo(info);
  setIsLoadingInitialState(false);

  if (info?.currentClient && Object.keys(info?.currentClient).length > 0) {
    // quando a visualização é de um cliente específico, então define as informações
    // desse cliente como currentChat e exibe o chat direto
    setView(COMPONENT_LOCATION.CHAT);
    const chats = (info?.allChats || []).filter((chat) =>
      info.currentClient.clientChatIds.includes(chat.chatId)
    );

    setCurrentChat({
      name: info.currentClient.clientName,
      connectionKey: info.currentClient.connectionKey,
      destination: info.currentClient.destination,
      disabled: info.currentClient.disabled,
      status: info.currentClient.status,
      chats,
    });
  }
}

export const onSelectedChatMaker = ({
  initialInfo,
  setIsLoading,
  setCurrentChat,
  setMessages,
  setBlocked,
  chatService,
  messagesEndRef,
  onReadAllMessagesOfChat,
  userNamesById,
}) => async (chat) => {
  setIsLoading(true);
  setCurrentChat(chat);
  const response = await chatService.loadMessages(initialInfo, chat);

  const { content } = response;

  const messages = content
    .map((externalMessage) =>
      buildChatMessageObject(externalMessage, chat.chatId, userNamesById)
    )
    .reverse();

<<<<<<< HEAD
  const lastMessageExpired = !stringFormattedToMoment(
    messages[messages.length - 1]?.at
  ).isBetween(momentNow().subtract(24, "hour"), momentNow());
=======
  let lastMessageExpired = null;

  if (messages.length > 0) {
    lastMessageExpired = !stringFormattedToMoment(
      messages[messages.length - 1].at
    ).isBetween(momentNow().subtract(24, "hour"), momentNow());
  }
>>>>>>> 9e7f020 (component utiliza apenas 1 websocket)

  const isBlocked =
    ChatStatus.isBlocked(chat?.status || initialInfo?.status) ||
    lastMessageExpired;

  setMessages(messages);
  setBlocked(chat, isBlocked);
  setIsLoading(false);

  if (chat.updateUnreadWhenOpen) {
    onReadAllMessagesOfChat(chat);
  }

  setTimeout(() => {
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
