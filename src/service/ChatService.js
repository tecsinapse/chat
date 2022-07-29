import { DELIVERY_STATUS } from "@tecsinapse/chat";
import ReactGA from "react-ga4";
import { defaultFetch, fetchMessages } from "../utils/fetch";
import * as dates from "../utils/dates";
import { ChatStatus } from "../constants";

export class ChatService {
  constructor(baseUrl) {
    this.url = baseUrl;
  }

  sendNotification(
    chatApiUrl,
    selectedConnectionKey,
    destination,
    phoneNumber,
    selectedTemplate,
    args,
    userId
  ) {
    return defaultFetch(
      `${this.url}/${selectedConnectionKey}/${destination}/notification/send`,
      "POST",
      {
        phoneNumber,
        template: selectedTemplate,
        args,
        userId,
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
      archived: currentChat.archived,
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

  async getChatInfo(connectionKey, destination, chatId) {
    return defaultFetch(
      `${this.url}/${connectionKey}/${destination}/${chatId}/info`,
      "GET"
    );
  }

  sendErrorReport(currentChat, userkeycloakId, chatMessage, error) {
    let attempt = 0;
    const maxAttemps = 5;
    const timeout = 1000 * 60; // 1 minuto

    const data = JSON.stringify(chatMessage);
    const { connectionKey, destination, chatId } = currentChat;
    const at = dates.momentNow().toISOString();
    const payload = { at, data, error, userId: userkeycloakId };

    const execute = () => {
      defaultFetch(
        `${this.url}/${connectionKey}/${destination}/${chatId}/error-report`,
        "POST",
        payload
      )
        .then(() => {
          ReactGA.event({
            category: error,
            action: "Error Report",
            nonInteraction: true,
          });
        })
        .catch((e) => {
          attempt += 1;

          if (attempt >= maxAttemps) {
            console.log(e);
            ReactGA.event({
              category: "Max Attempts Reached",
              action: "Error Report",
              nonInteraction: true,
            });

            return;
          }
          setTimeout(execute, timeout);
        });
    };

    execute();
  }

  sendMessage(
    chatMessage,
    setStatusMessage,
    currentChat,
    setCurrentChat,
    userkeycloakId,
    setBlocked
  ) {
    let attempt = 0;
    const maxAttemps = 6;
    const timeout = 1000 * 5; // 5 segundos

    const { localId } = chatMessage;
    const { connectionKey, destination, chatId } = currentChat;

    const execute = () => {
      defaultFetch(
        `${this.url}/${connectionKey}/${destination}/${chatId}/message/send`,
        "POST",
        chatMessage
      )
        .then(() => {
          ReactGA.event({
            category: connectionKey,
            action: "Send Message",
          });
        })
        .catch((e) => {
          console.log(e);

          if (e.status && e.status === 403 && e.errors === "Chat bloqueado") {
            setBlocked(currentChat, true);
            setCurrentChat((current) => ({
              ...current,
              status: ChatStatus.BLOCKED,
              minutesToBlock: 0,
            }));

            return;
          }

          attempt += 1;

          if (attempt >= maxAttemps) {
            setStatusMessage(localId, DELIVERY_STATUS.ERROR.key);
            this.sendErrorReport(
              currentChat,
              userkeycloakId,
              chatMessage,
              e.message || e.errors
            );

            return;
          }
          setTimeout(execute, timeout);
        });
    };

    execute();
  }
}
