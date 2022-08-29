import { load } from "./loadChatsInfos";
import { COMPONENT_LOCATION } from "../constants/COMPONENT_LOCATION";
import { buildChatMessageObject } from "./message";
import { ChatStatus } from "../constants";
import { momentNow, stringFormattedToMoment } from "./dates";
import {
  notifyNewChat,
  onStartSendNotification,
} from "../components/Init/functions";
import { countryPhoneNumber } from "../components/SendNotification/utils";

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
  chatInitConfig,
  globalSearch,
  setComponentInfo,
  view,
  setView,
  setCurrentChat,
  userMock,
  token,
  chatService,
  firstLoad,
  setFirstLoad,
  startChat,
  page,
}) {
  const {
    chatApiUrl,
    getInitialStatePath,
    params,
    standalone,
    pageSize,
  } = chatInitConfig;

  const newComponentInfo = await load({
    chatApiUrl,
    getInitialStatePath,
    params,
    standalone,
    pageSize,
    page,
    globalSearch,
    userMock,
    token,
  });

  setComponentInfo((oldComponentInfo) => {
    if (!firstLoad && view !== COMPONENT_LOCATION.SEND_NOTIFICATION) {
      const notArchivedOldComponentInfo =
        oldComponentInfo?.allChats.filter((it) => !it.archived).length || 0;

      const notArchivedNewComponentInfo =
        newComponentInfo?.allChats.filter((it) => !it.archived).length || 0;

      if (notArchivedOldComponentInfo < notArchivedNewComponentInfo) {
        notifyNewChat(chatInitConfig.userkeycloakId);
      }
    }

    return newComponentInfo;
  });

  setFirstLoad(false);

  if (
    firstLoad &&
    newComponentInfo?.currentClient &&
    Object.keys(newComponentInfo?.currentClient).length > 0
  ) {
    const chats = (newComponentInfo?.allChats || []).filter(
      (chat) =>
        newComponentInfo.currentClient.clientChatIds.includes(chat.chatId) &&
        newComponentInfo.currentClient.connectionKey === chat.connectionKey &&
        newComponentInfo.currentClient.destination === chat.destination
    );

    if (!chatInitConfig.userPhoneNumber) {
      const chatId = findChat(
        newComponentInfo.currentClient.clientChatIds,
        chats
      );

      if (!chatId) {
        return newComponentInfo;
      }

      await renderChat(
        chatId,
        newComponentInfo,
        chatService,
        setView,
        setCurrentChat
      );
    } else {
      const chatId = findChat(
        newComponentInfo.currentClient.clientChatIds,
        chats,
        chatInitConfig.userPhoneNumber
      );

      if (!chatId) {
        startChat();
      } else {
        await renderChat(
          chatId,
          newComponentInfo,
          chatService,
          setView,
          setCurrentChat
        );
      }
    }
  } else if (typeof startChat === "function") {
    startChat();
  }

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
  setView(COMPONENT_LOCATION.CHAT);
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
  initialInfo,
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
  const response = await chatService.loadMessages(initialInfo, chat);

  const { content } = response;

  const messages = content
    .map((externalMessage) =>
      buildChatMessageObject(externalMessage, chat.chatId, userNamesById)
    )
    .reverse();

  const lastClientMessage = last((messages || []).filter((item) => !item.own));

  const now = momentNow();
  const lastMessageExpired = !stringFormattedToMoment(
    lastClientMessage?.at
  ).isBetween(now.clone().subtract(24, "hour"), now);

  const isBlocked = ChatStatus.isBlocked(initialInfo) || lastMessageExpired;

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
