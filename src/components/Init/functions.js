import {isEquals} from "../../utils/helpers";
import {completeChatInfoWith} from "../../utils/loadChatsInfos";
import {COMPONENT_LOCATION} from "../../constants/COMPONENT_LOCATION";
import {getChatId} from "../../context";
import {CDN_RESOURCES} from "../../constants/CDN_RESOURCES";

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

const getChatIds = (allChats) =>
  (allChats || []).map((chat) => chat.chatId).join(",");

const getUnreadTotal = (allChats) =>
  (allChats || [])
    .filter((chat) => !!chat.unread)
    .reduce((acc, chat) => acc + chat.unread, 0);

const onUpdatedChat = (
  userkeycloakId,
  updatedChat,
  setCurrentChat,
  currentChat,
  chatContext,
  setChatContext,
  componentInfo
) => {
  const componentInfoChatIndex = componentInfo?.allChats?.findIndex(
    (item) => getChatId(item) === getChatId(updatedChat)
  );

  const chatExists =
    componentInfoChatIndex > -1 || chatContext.has(getChatId(updatedChat));

  if (chatExists) {
    const chat =
      componentInfo?.allChats[componentInfoChatIndex] ||
      chatContext.get(getChatId(updatedChat));

    const completeChatInfo = completeChatInfoWith(chat, updatedChat);

    chatContext.set(getChatId(updatedChat), completeChatInfo);

    if (updatedChat.notifyNewMessage) {
      notifyNewMessage(userkeycloakId, completeChatInfo.name);
    }
  } else {
    chatContext.set(getChatId(updatedChat), updatedChat);
  }
  setChatContext(new Map(chatContext));
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

const onReadAllMessagesOfChat = (
  componentInfo,
  readChat,
  chatContext,
  setChatContext
) => {
  const chat = chatContext.get(getChatId(readChat));

  if (chat) {
    chat.unread = 0;
    setChatContext(new Map(chatContext));
  }
};

const onDeleteChat = async ({
  deletedChat,
  token,
  componentInfo,
  setComponentInfo,
  productService,
  chatService,
  chatContext,
  setChatContext,
}) => {
  try {
    await productService.deleteChat(deletedChat, token);
    await chatService.deleteSessionChat(deletedChat);
  } catch (e) {
    console.error("[DELETE_CHAT] Error when deleting", e.message);
  }
  chatContext.delete(getChatId(deletedChat));

  const { connectionKey, destination, chatId } = deletedChat;

  const allChatsUpdate = componentInfo.allChats.filter((value) => {
    return !(
      value.connectionKey === connectionKey &&
      value.destination === destination &&
      value.chatId === chatId
    );
  });

  const toUpdateInfo = { ...componentInfo, allChats: allChatsUpdate };

  setComponentInfo(toUpdateInfo);
  setChatContext(new Map(chatContext));

  return Array.from(chatContext.values());
};

const onChatStatusChanged = (
  statusChangedChat,
  isBlocked,
  chatContext,
  setChatToSendNotification
) => {
  // controls if the current chat is expired and the button to send a notification is visible to a chat
  if (statusChangedChat) {
    const chat =
      chatContext.get(getChatId(statusChangedChat)) || statusChangedChat;

    if (chat) {
      // will only show the button if the chat is blocked
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
  notifyNewMessage,
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
  playNotificationSound,
  getNotificationSoundStorageKey,
  isNotificationSoundEnabled,
  enableNotificationSound,
  disableNotificationSound,
  onLocalStorage,
};
