import { DELIVERY_STATUS } from "@tecsinapse/chat";
import ReactGA from "react-ga4";
import { defaultFetch } from "./utils";
import { momentNow } from "../components/utils";

export class ChatService {
  constructor(baseUrl) {
    this.url = `${baseUrl}/api/chats`;
  }

  sendNotification(userkeycloakId, chat, templateId, templateArgs) {
    return defaultFetch(`${this.url}/notification/send`, "POST", {
      userId: userkeycloakId,
      templateId,
      chat,
      args: templateArgs,
    });
  }

  deleteSessionChat(deletedChat) {
    return defaultFetch(
      `${this.url}/${deletedChat.connectionKey}/${deletedChat.chatId}/sessions/finish`,
      "DELETE",
      {}
    );
  }

  getAllTemplates(connectionKey) {
    return defaultFetch(`${this.url}/${connectionKey}/templates`, "GET", {});
  }

  getAllTemplatesByUser(connectionKey, userId) {
    return defaultFetch(
      `${this.url}/${connectionKey}/templates/${userId}`,
      "GET",
      {}
    );
  }

  updateMessageStatusToRead(messageId) {
    return defaultFetch(
      `${this.url}/${messageId}/update/status/read`,
      "POST",
      {}
    );
  }

  sendDataApi(currentChat, formData) {
    const { connectionKey, destination, chatId } = currentChat;

    return defaultFetch(
      `${this.url}/${connectionKey}/${destination}/${chatId}/upload`,
      "POST",
      {},
      formData
    );
  }

  loadMessages(currentChat, page) {
    const {
      connectionKey,
      destination,
      chatId,
      updateUnreads,
      archived,
    } = currentChat;

    const uri = `${this.url}/${connectionKey}/${destination}/${chatId}/messages?page=${page}&size=100&updateUnreads=${updateUnreads}&archived=${archived}`;

    return defaultFetch(uri, "GET", {});
  }

  async completeComponentInfo(componentInfo) {
    return defaultFetch(
      `${this.url}/completeComponentInfo`,
      "POST",
      componentInfo
    );
  }

  sendErrorReport(currentChat, userkeycloakId, chatMessage, error) {
    let attempt = 0;
    const maxAttemps = 5;
    const timeout = 1000 * 60; // 1 minuto

    const data = JSON.stringify(chatMessage);
    const { connectionKey, destination, chatId } = currentChat;
    const at = momentNow().toISOString();
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
            console.error(e);
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
    userkeycloakId,
    chatMessage,
    currentChat,
    setCurrentChat,
    handleChangeMessageStatus,
    handleBlockCurrentChat
  ) {
    let attempt = 0;

    const maxAttemps = 3;
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
          console.error(e);

          if (e.status && e.status === 403 && e.errors === "Chat bloqueado") {
            handleBlockCurrentChat();
            handleChangeMessageStatus(localId, DELIVERY_STATUS.ERROR.key);

            return;
          }

          attempt += 1;

          if (attempt >= maxAttemps) {
            handleChangeMessageStatus(localId, DELIVERY_STATUS.ERROR.key);

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

  sendComponentMetric(componentMetric) {
    const uri = `${this.url}/componentLoadMetric`;

    return defaultFetch(uri, "POST", componentMetric);
  }
}
