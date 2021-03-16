import { isEquals, loadComponent } from "../../utils/helpers";
import { defaultFetch, noAuthJsonFetch } from "../../utils/fetch";
import { completeChatInfoWith } from "../../utils/loadChatsInfos";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";

const getChatIds = (componentInfo) => {
  return (componentInfo.allChats || []).map((chat) => chat.chatId).join(",");
};

const getUnreadTotal = (componentInfo) => {
  return (componentInfo.allChats || []).reduce(
    (acc, chat) => acc + chat.unread,
    0
  );
};

const onUpdatedChat = (
  updatedChat,
  componentInfo,
  setComponentInfo,
  setCurrentChat,
  currentChat
) => {
  let chatsToUpdate = [];
  let newChat = true;
  const toUpdateInfo = { ...componentInfo };
  componentInfo.allChats.forEach((chat) => {
    if (isEquals(chat, updatedChat)) {
      updatedChat = completeChatInfoWith(chat, updatedChat);
      chatsToUpdate.push(updatedChat);
      newChat = false;
    } else {
      chatsToUpdate.push(chat);
    }
  });
  if (newChat) {
    chatsToUpdate.push(updatedChat);
  }
  toUpdateInfo.allChats = chatsToUpdate;

  setComponentInfo(toUpdateInfo);
  const currentChatUpdated = { ...currentChat };
  let needToUpdate = false;
  currentChatUpdated.chats = currentChat?.chats?.map((chat) => {
    if (isEquals(chat, updatedChat)) {
      needToUpdate = true;
      return completeChatInfoWith(chat, updatedChat);
    }
    return chat;
  });

  if (needToUpdate) {
    setCurrentChat(currentChatUpdated);
  }
};

const onReadAllMessagesOfChat = (componentInfo, readChat, setComponentInfo) => {
  let chatsToUpdate = [];

  const toUpdateInfo = { ...componentInfo };
  componentInfo.allChats.forEach((chat) => {
    if (isEquals(chat, readChat)) {
      const updatedChat = { ...chat };
      updatedChat.unread = 0;
      chatsToUpdate.push(updatedChat);
    } else {
      chatsToUpdate.push(chat);
    }
  });
  toUpdateInfo.allChats = chatsToUpdate;
  setComponentInfo(toUpdateInfo);
};

const onDeleteChat = async (
  deletedChat,
  chatInitConfig,
  token,
  componentInfo,
  setComponentInfo
) => {
  await noAuthJsonFetch(
    `${chatInitConfig.deleteChatPath}/${deletedChat.connectionKey}/${deletedChat.chatId}`,
    "DELETE",
    {},
    token
  );
  await defaultFetch(
    `${chatInitConfig.chatApiUrl}/api/chats/${deletedChat.connectionKey}/${deletedChat.chatId}/sessions/finish`,
    "DELETE",
    {}
  );
  const toUpdateInfo = { ...componentInfo };
  toUpdateInfo.allChats = componentInfo.allChats.filter(
    (chat) => chat.chatId !== deletedChat.chatId
  );

  const { currentClient } = componentInfo;
  if (currentClient && Object.keys(currentClient).length > 0) {
    if (currentClient.clientChatIds.includes(deletedChat.chatId)) {
      toUpdateInfo.currentClient = {};
    }
  }
  setComponentInfo(toUpdateInfo);
  return toUpdateInfo.allChats;
};

const onChatStatusChanged = (
  statusChangedChat,
  isBlocked,
  componentInfo,
  setChatToSendNotification
) => {
  // controls if the current chat is expired and the button to send a notification is visible to a chat
  if (statusChangedChat) {
    componentInfo.allChats.forEach((chat) => {
      if (isEquals(chat, statusChangedChat)) {
        // will only show the button if the chat is blocked
        setChatToSendNotification(isBlocked ? chat : null);
      }
    });
  } else {
    setChatToSendNotification(null);
  }
};

const isShowBackButton = (view, chatInitConfig) => {
  return (
    view === COMPONENT_LOCATION.CHAT ||
    view === COMPONENT_LOCATION.SEND_NOTIFICATION ||
    (view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT &&
      !chatInitConfig.onlyMessageManagement)
  );
};

const isShowMessageManagement = (view) => {
  return view !== COMPONENT_LOCATION.MESSAGE_MANAGEMENT;
};

const isChatViewAndIsBlocked = (view, chatToSendNotification) => {
  return view === COMPONENT_LOCATION.CHAT && chatToSendNotification != null;
};

const onStartSendNotification = (view, setChatToSendNotification, setView) => {
  if (COMPONENT_LOCATION.CHAT !== view) {
    setChatToSendNotification(null);
  }
  setView(COMPONENT_LOCATION.SEND_NOTIFICATION);
};
const isShowSendNotification = (view, chatInitConfig, chatViewAndIsBlocked) => {
  return (
    chatInitConfig.canSendNotification &&
    (view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT ||
      view === COMPONENT_LOCATION.UNREAD ||
      chatViewAndIsBlocked)
  );
};
//// verificar depois o motivo do erro!!!!
const runOnSelectChat = (chat, setCurrentChat, setView) => {
  const dataCurrentChat = {
    name: chat.name,
    connectionKey: chat.connectionKey,
    destination: chat.destination,
    disabled: !chat.enabled,
    status: chat.status,
    chats: [chat],
  };
  setCurrentChat(dataCurrentChat);
  setView(COMPONENT_LOCATION.CHAT);
};

const runLoadComponent = ({
  chatInitConfig,
  setComponentInfo,
  setIsLoadingInitialState,
  setView,
  setCurrentChat,
  userMock,
  token,
}) => {
  loadComponent(
    chatInitConfig,
    setComponentInfo,
    setIsLoadingInitialState,
    setView,
    setCurrentChat,
    userMock,
    token
  ).then(() => {});
};

const runReloadComponent = (propsToLoadComponent) =>
  runLoadComponent(propsToLoadComponent);

export {
  getChatIds,
  getUnreadTotal,
  onUpdatedChat,
  onReadAllMessagesOfChat,
  onDeleteChat,
  onChatStatusChanged,
  isShowBackButton,
  isShowMessageManagement,
  isChatViewAndIsBlocked,
  isShowSendNotification,
  onStartSendNotification,
  runReloadComponent,
  runOnSelectChat,
};
