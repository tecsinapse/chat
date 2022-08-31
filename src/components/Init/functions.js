import { isEquals } from "../../utils/helpers";
import { completeChatInfoWith } from "../../utils/loadChatsInfos";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";

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

    // if (updatedChat.notifyNewMessage && !completeChatInfo.archived) {
    //   notifyNewMessage(userkeycloakId, completeChatInfo.name);
    // }
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
  view === COMPONENT_LOCATION.CHAT_MESSAGES ||
  view === COMPONENT_LOCATION.SEND_NOTIFICATION ||
  (view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT &&
    !chatInitConfig.onlyMessageManagement);

const isShowMessageManagement = (view) =>
  view !== COMPONENT_LOCATION.MESSAGE_MANAGEMENT;

const isChatViewAndIsBlocked = (view, chatToSendNotification) =>
  view === COMPONENT_LOCATION.CHAT_MESSAGES && chatToSendNotification != null;

const onStartSendNotification = (view, setChatToSendNotification, setView) => {
  if (COMPONENT_LOCATION.CHAT_MESSAGES !== view) {
    setChatToSendNotification(null);
  }
  setView(COMPONENT_LOCATION.SEND_NOTIFICATION);
};

const isShowSendNotification = (view, chatInitConfig, chatViewAndIsBlocked) =>
  chatInitConfig.canSendNotification &&
  (view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT || chatViewAndIsBlocked);

export {
  onUpdatedChat,
  onReadAllMessagesOfChat,
  onDeleteChat,
  onChatStatusChanged,
  isShowBackButton,
  isShowMessageManagement,
  isChatViewAndIsBlocked,
  isShowSendNotification,
  onStartSendNotification,
};
