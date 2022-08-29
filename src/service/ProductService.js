import { noAuthJsonFetch } from "../utils/fetch";

export class ProductService {
  constructor(urlBase) {
    this.url = urlBase;
  }

  createChat(connectionKey, phoneNumber, args) {
    return noAuthJsonFetch(
      `${this.url}/${connectionKey}/${phoneNumber.replace(
        /[^0-9]/g,
        ""
      )}/create`,
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
