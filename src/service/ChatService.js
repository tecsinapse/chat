import { defaultFetch, fetchMessages } from "../utils/fetch";

export class ChatService {
  url = "";

  constructor(baseUrl) {
    this.url = baseUrl;
  }

  sendNotification(
    chatApiUrl,
    selectedConnectionKey,
    destination,
    phoneNumber,
    selectedTemplate,
    args
  ) {
    return defaultFetch(
      `${this.url}/${selectedConnectionKey}/${destination}/notification/send`,
      "POST",
      {
        phoneNumber: phoneNumber,
        template: selectedTemplate,
        args: args,
      }
    );
  }
  async deleteSessionChat(deletedChat) {
    return await defaultFetch(
      `${this.url}/${deletedChat.connectionKey}/${deletedChat.chatId}/sessions/finish`,
      "DELETE",
      {}
    );
  }
  getAllTampletes(connectionKey) {
    return defaultFetch(`${this.url}/${connectionKey}/templates`, "GET", {});
  }

  sendDataApi(initialInfo, currentChat, formData) {
    return defaultFetch(
      `${this.url}/${initialInfo.connectionKey}/${initialInfo.destination}/${currentChat.chatId}/upload`,
      "POST",
      {},
      formData
    );
  }

  async loadMessages(initialInfo, currentChat, page, chatApiUrl) {
    return await fetchMessages({
      chatApiUrl,
      connectionKey: initialInfo.connectionKey,
      destination: initialInfo.destination,
      chatId: currentChat.chatId,
      page: page,
      updateUnreadWhenOpen: currentChat.updateUnreadWhenOpen,
    });
  }
}
