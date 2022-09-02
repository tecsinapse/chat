import { load } from "./loadChatsInfos";
import { COMPONENT_LOCATION } from "../constants/COMPONENT_LOCATION";
import { ChatStatus } from "../constants";
import { momentNow, stringFormattedToMoment } from "./dates";
import { onStartSendNotification } from "../components/Init/functions";
import { countryPhoneNumber } from "../components/SendNotification/utils";
import {getChatMessageObject} from "../components/RenderChat/utils";

function last(array) {
  return array[array.length - 1];
}

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
    componentInfo.allChats?.find(
      (it) =>
        it.connectionKey === connectionKey &&
        it.destination === destination &&
        it.chatId === chatId
    ) || {};

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
    status: chatInfo?.status,
  };
}

export async function loadComponent({
  chatApiUrl,
  componentInfoPath,
  globalSearch,
  onlyNotClients,
  setComponentInfo,
  setFirstLoad,
  page,
  pageSize,
}) {
  const newComponentInfo = await load({
    chatApiUrl,
    componentInfoPath,
    globalSearch,
    onlyNotClients,
    pageSize,
    page,
  });

  setComponentInfo(newComponentInfo);
  setFirstLoad(false);

  return newComponentInfo;
}

async function renderChat(chatId, info, chatService, setView, setCurrentChat) {
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
  setView(COMPONENT_LOCATION.CHAT_MESSAGES);
}

function findChat(chatsIds, chats, userPhoneNumber) {
  if (chatsIds.length === 1 && !userPhoneNumber) {
    return chatsIds[0];
  }

  if (chatsIds.length > 1 && !userPhoneNumber) {
    return chats[0].chatId;
  }

  if (chatsIds.length === 1 && chatsIds[0] === userPhoneNumber) {
    return chatsIds[0];
  }

  if (chatsIds.length > 1) {
    let chatId;

    chatsIds.forEach((it) => {
      if (it === userPhoneNumber) {
        chatId = it;
      }
    });

    return chatId;
  }

  return undefined;
}

export const onSelectedChatMaker = ({
  currentChat,
  setReadyToSubscribe,
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

  const { connectionKey, destination, chatId, archived } = currentChat;

  const response = await chatService.loadMessages(
    connectionKey,
    destination,
    chatId,
    archived,
    0
  );

  const { content } = response;

  const messages = content
    .map((externalMessage) =>
      getChatMessageObject(externalMessage, chat.chatId, userNamesById)
    )
    .reverse();

  const lastClientMessage = last((messages || []).filter((item) => !item.own));

  const now = momentNow();
  const lastMessageExpired = !stringFormattedToMoment(
    lastClientMessage?.at
  ).isBetween(now.clone().subtract(24, "hour"), now);

  const isBlocked = ChatStatus.isBlocked(currentChat) || lastMessageExpired;

  setMessages(messages);
  setBlocked(chat, isBlocked);
  setIsLoading(false);
  setReadyToSubscribe(true);

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

export const messageEventListener = async (
  event,
  propsToLoadComponent,
  setChatToSendNotification,
  setView,
  setIsDrawerOpen
) => {
  try {
    const json = JSON.parse(event.data);

    if (json && json.tipo === "TEC-INIT-WINGO-CHAT") {
      const prop = { ...propsToLoadComponent };

      const phone = countryPhoneNumber(json.userPhoneNumber);

      prop.chatInitConfig.params.clienteId = json.clienteId;
      prop.chatInitConfig.userPhoneNumber = phone;

      prop.startChat = () =>
        onStartSendNotification(
          COMPONENT_LOCATION.MESSAGE_MANAGEMENT,
          setChatToSendNotification,
          setView
        );

      await loadComponent(prop);

      setIsDrawerOpen(true);
    }
  } catch (e) {
    // nothing
  }
};
