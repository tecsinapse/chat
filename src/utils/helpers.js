import { load } from "./loadChatsInfos";
import { COMPONENT_LOCATION } from "../constants/COMPONENT_LOCATION";
import { defaultFetch } from "./fetch";
import { buildChatMessageObject } from "./message";

export async function loadComponent(
  chatInitConfig,
  setComponentInfo,
  setIsLoadingInitialState,
  setView,
  setCurrentChat,
  userMock
) {
  const info = await load(chatInitConfig, userMock);
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
) => (chat) => {
  setIsLoading(true);
  setCurrentChat(chat);

  defaultFetch(
    `${chatApiUrl}/api/chats/${initialInfo.connectionKey}/${initialInfo.destination}/${chat.chatId}/messages?page=0&size=50&updateUnread=${chat.updateUnreadWhenOpen}`,
    "GET",
    {}
  ).then((pageResults) => {
    const messages = pageResults.content
      .map((externalMessage) => {
        return buildChatMessageObject(
          externalMessage,
          chat.chatId,
          userNamesById
        );
      })
      .reverse();
    setMessages(messages);
    const isBlocked = chat.status === "BLOCKED";
    setBlocked(chat, isBlocked);
    setIsLoading(false);
    if (chat.updateUnreadWhenOpen) {
      onReadAllMessagesOfChat(chat);
    }

    setTimeout(function () {
      // workaround to wait for all elements to render
      messagesEndRef.current.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    }, 700);
  });
};
