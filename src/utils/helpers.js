import { load } from "./loadChatsInfos";
import { COMPONENT_LOCATION } from "../constants/COMPONENT_LOCATION";
import { buildChatMessageObject } from "./message";
import { ChatStatus } from "../constants";
import { stringFormattedToMoment, momentNow } from "./dates";

export async function getObjectToSetChat(
  chatService,
  componentInfo,
  connectionKey,
  destination,
  chatId,
  clientName = undefined
) {
  const chatInfo = await chatService.getChatInfo(
    connectionKey,
    destination,
    chatId
  );

  const chat =
    componentInfo.allChats?.filter(
      (_chat) =>
        _chat.connectionKey === connectionKey &&
        _chat.destination === destination &&
        _chat.chatId === chatId
    )[0] || {};

  const name = clientName || chat.name || chatInfo.name;

  const chats = [
    {
      ...chat,
      ...chatInfo,
      name,
    },
  ];

  return {
    name,
    connectionKey,
    destination,
    chatId,
    chats,
  };
}

export async function loadComponent({
  chatInitConfig,
  setComponentInfo,
  setIsLoadingInitialState,
  setView,
  setCurrentChat,
  userMock,
  token,
  chatService,
  firstLoad,
  setFirstLoad,
}) {
  const info = await load({ ...chatInitConfig, userMock, token });

  setComponentInfo(info);
  setIsLoadingInitialState(false);

  if (
    firstLoad &&
    info?.currentClient &&
    Object.keys(info?.currentClient).length > 0
  ) {
    setFirstLoad(false);
    // quando a visualização é de um cliente específico, então define as informações
    // desse cliente como currentChat e exibe o chat direto
    setView(COMPONENT_LOCATION.CHAT);

    const chats = (info?.allChats || []).filter(
      (chat) =>
        info.currentClient.clientChatIds.includes(chat.chatId) &&
        info.currentClient.connectionKey === chat.connectionKey &&
        info.currentClient.destination === chat.destination
    );

    let chatId;

    if (info.currentClient.clientChatIds.length === 1) {
      [chatId] = info.currentClient.clientChatIds;
    } else if (info.currentClient.clientChatIds.length > 1) {
      chatId = chats[0].chatId;
    } else {
      return;
    }

    const { connectionKey, destination, clientName } = info.currentClient;

    const objectToSetChat = await getObjectToSetChat(
      chatService,
      info,
      connectionKey,
      destination,
      chatId,
      clientName
    );

    setCurrentChat(objectToSetChat);
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

  const lastClientMessage = (messages || []).filter((item) => !item.own);

  const lastMessageExpired = !stringFormattedToMoment(
    lastClientMessage[lastClientMessage.length - 1]?.at
  ).isBetween(momentNow().subtract(24, "hour"), momentNow());

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
