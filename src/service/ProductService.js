import { noAuthJsonFetch } from "../utils/fetch";

export class ProductService {
  constructor(urlBase) {
    this.url = urlBase;
  }

  loadComponentInfo(globalSearch, onlyNotClients, page, pageSize) {
    return noAuthJsonFetch(`${this.url}/componentInfo`, "POST", {
      globalSearch,
      onlyNotClients,
      page,
      pageSize,
    });
  }

  createChat(connectionKey, phoneNumber, args) {
    return noAuthJsonFetch(
      `${this.url}/${connectionKey}/${phoneNumber}/create`,
      "POST",
      args
    );
  }

  deleteChat(chat) {
    return noAuthJsonFetch(
      `${this.url}/${chat.connectionKey}/${chat.chatId}`,
      "DELETE",
      {}
    );
  }
}
