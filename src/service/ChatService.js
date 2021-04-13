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
        phoneNumber,
        template: selectedTemplate,
        args,
      }
    );
  }

  deleteSessionChat(deletedChat) {
    return defaultFetch(
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

  loadMessages(initialInfo, currentChat, page) {
    return fetchMessages({
      chatApiUrl: `${this.url}`,
      connectionKey: initialInfo.connectionKey,
      destination: initialInfo.destination,
      chatId: currentChat.chatId,
      page,
      updateUnreadWhenOpen: currentChat.updateUnreadWhenOpen,
    });
  }

  async findMessagesByCurrentUser(groupedChats, page = 0, rowsPerPage = 10) {
    const promiseMap = Array.from(groupedChats.keys()).map((key) =>
      defaultFetch(
        `${this.url}/${key}/infos?page=${page}&size=${rowsPerPage}`,
        "POST",
        groupedChats.get(key)
      )
    );

    return Promise.all(promiseMap);
  }
}
