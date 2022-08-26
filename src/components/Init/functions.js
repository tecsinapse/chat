import { isEquals } from "../../utils/helpers";
import { completeChatInfoWith } from "../../utils/loadChatsInfos";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { CDN_RESOURCES } from "../../constants/CDN_RESOURCES";

const notifyNewChat = (userkeycloakId) => {
  if (!userkeycloakId) {
    return;
  }

  const title = "Nova conversa";
  const body = `Você tem uma nova conversa no Chat.`;
  const icon = CDN_RESOURCES.NOTIFICATION_ICON;

  if (Notification.permission === "granted") {
    // eslint-disable-next-line
    new Notification(title, { icon: icon, body: body });
  }

  playNotificationSound(userkeycloakId);
};

const notifyNewMessage = (userkeycloakId, name) => {
  if (!userkeycloakId || !name) {
    return;
  }

  const title = "Nova mensagem";
  const body = `Você tem uma nova mensagem de ${name} no Chat.`;
  const icon = CDN_RESOURCES.NOTIFICATION_ICON;

  if (Notification.permission === "granted") {
    // eslint-disable-next-line
    new Notification(title, { icon: icon, body: body });
  }

  playNotificationSound(userkeycloakId);
};

const getChatIdsByConnectionKey = (allChats, connectionKey) =>
  (allChats || [])
    .filter((it) => it.connectionKey === connectionKey)
    .map((it) => it.chatId);

const getUnreadTotal = (allChats) =>
  (allChats || [])
    .filter((chat) => !!chat.unread && !chat.archived)
    .reduce((acc, chat) => acc + chat.unread, 0);

const getChatId = (chat) =>
  `${chat.chatId}.${chat.connectionKey}.${chat.destination}`;

const onUpdatedChat = (
  userkeycloakId,
  updatedChat,
  setCurrentChat,
  currentChat,
  componentInfo,
  setComponentInfo
) => {
  const componentInfoChatIndex = componentInfo?.allChats?.findIndex(
    (item) => getChatId(item) === getChatId(updatedChat)
  );

  if (componentInfoChatIndex > -1) {
    const initialChatInfo = componentInfo.allChats[componentInfoChatIndex];
    const completeChatInfo = completeChatInfoWith(initialChatInfo, updatedChat);

    const newComponentInfo = { ...componentInfo };
    newComponentInfo.allChats[componentInfoChatIndex] = completeChatInfo;
    setComponentInfo(newComponentInfo);

    if (updatedChat.notifyNewMessage && !completeChatInfo.archived) {
      notifyNewMessage(userkeycloakId, completeChatInfo.name);
    }
  }

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

const onReadAllMessagesOfChat = (componentInfo, setComponentInfo, readChat) => {
  const componentInfoChatIndex = componentInfo?.allChats?.findIndex(
    (item) => getChatId(item) === getChatId(readChat)
  );

  if (
    componentInfoChatIndex > -1 &&
    componentInfo.allChats[componentInfoChatIndex].unread > 0
  ) {
    const newComponentInfo = { ...componentInfo };
    newComponentInfo.allChats[componentInfoChatIndex].unread = 0;
    setComponentInfo(newComponentInfo);
  }
};

const onDeleteChat = async ({
  deletedChat,
  token,
  productService,
  chatService,
}) => {
  try {
    await productService.deleteChat(deletedChat, token);
    await chatService.deleteSessionChat(deletedChat);
  } catch (e) {
    console.error("[DELETE_CHAT] Error when deleting", e.message);
  }
};

const onChatStatusChanged = (
  statusChangedChat,
  isBlocked,
  componentInfo,
  setChatToSendNotification
) => {
  if (statusChangedChat) {
    const chat = componentInfo?.allChats?.find(
      (it) => getChatId(it) === getChatId(statusChangedChat)
    );

    if (chat) {
      setChatToSendNotification(isBlocked ? chat : null);
    } else {
      setChatToSendNotification(null);
    }
  }
};

const isShowBackButton = (view, chatInitConfig) =>
  view === COMPONENT_LOCATION.CHAT ||
  view === COMPONENT_LOCATION.SEND_NOTIFICATION ||
  (view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT &&
    !chatInitConfig.onlyMessageManagement);

const isShowMessageManagement = (view) =>
  view !== COMPONENT_LOCATION.MESSAGE_MANAGEMENT;

const isChatViewAndIsBlocked = (view, chatToSendNotification) =>
  view === COMPONENT_LOCATION.CHAT && chatToSendNotification != null;

const onStartSendNotification = (view, setChatToSendNotification, setView) => {
  if (COMPONENT_LOCATION.CHAT !== view) {
    setChatToSendNotification(null);
  }
  setView(COMPONENT_LOCATION.SEND_NOTIFICATION);
};

const isShowSendNotification = (view, chatInitConfig, chatViewAndIsBlocked) =>
  chatInitConfig.canSendNotification &&
  (view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT ||
    view === COMPONENT_LOCATION.UNREAD ||
    chatViewAndIsBlocked);

const playNotificationSound = (userkeycloakId) => {
  if (isNotificationSoundEnabled(userkeycloakId)) {
    const audio = new Audio(CDN_RESOURCES.NOTIFICATION_SOUND);

    audio.addEventListener("canplaythrough", () => {
      audio.play();
    });
  }
};

const getNotificationSoundStorageKey = (userkeycloakId) =>
  `tecsinapseChat.${userkeycloakId}.notificationSound`;

const isNotificationSoundEnabled = (userkeycloakId) => {
  if (!userkeycloakId) {
    return false;
  }
  const storageKey = getNotificationSoundStorageKey(userkeycloakId);
  const storageItem = localStorage.getItem(storageKey);

  if (storageItem) {
    return storageItem === "enabled";
  }
  localStorage.setItem(storageKey, "enabled");

  return true;
};

const enableNotificationSound = (userkeycloakId) => {
  const storageKey = getNotificationSoundStorageKey(userkeycloakId);

  localStorage.setItem(storageKey, "enabled");
  playNotificationSound(userkeycloakId);
};

const disableNotificationSound = (userkeycloakId) => {
  const storageKey = getNotificationSoundStorageKey(userkeycloakId);

  localStorage.setItem(storageKey, "disabled");
};

const onLocalStorage = (userkeycloakId, setNotificationSound) => (storage) => {
  if (storage.key === getNotificationSoundStorageKey(userkeycloakId)) {
    setNotificationSound(isNotificationSoundEnabled(userkeycloakId));
  }
};

export {
  notifyNewChat,
  notifyNewMessage,
  getChatIdsByConnectionKey,
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
  playNotificationSound,
  getNotificationSoundStorageKey,
  isNotificationSoundEnabled,
  enableNotificationSound,
  disableNotificationSound,
  onLocalStorage,
};
