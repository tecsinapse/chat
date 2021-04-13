import { isEquals } from "../../utils/helpers";
import { completeChatInfoWith } from "../../utils/loadChatsInfos";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { getChatId } from "../../context";

const getChatIds = (allChats) =>
  (allChats || []).map((chat) => chat.chatId).join(",");

const getUnreadTotal = (allChats) =>
  (allChats || [])
    .filter((chat) => !!chat.unread)
    .reduce((acc, chat) => acc + chat.unread, 0);

const onUpdatedChat = (
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
    // chatContext.set(getChatId(updatedChat), completeChatInfoWith(chat, updatedChat))
    const chat =
      componentInfo?.allChats[componentInfoChatIndex] ||
      chatContext.get(getChatId(updatedChat));

    chatContext.set(
      getChatId(updatedChat),
      completeChatInfoWith(chat, updatedChat)
    );
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
  const toUpdateInfo = { ...componentInfo };

  chatContext.delete(getChatId(deletedChat));

  const { currentClient } = componentInfo;

  if (currentClient && Object.keys(currentClient).length > 0) {
    if (currentClient.clientChatIds.includes(deletedChat.chatId)) {
      toUpdateInfo.currentClient = {};
    }
  }
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
};
