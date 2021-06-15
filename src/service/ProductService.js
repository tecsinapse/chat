import { noAuthJsonFetch } from "../utils/fetch";

export class ProductService {
  constructor(urlBase) {
    this.url = urlBase;
  }

  createChat(connectionKey, phoneNumber, args, token) {
    return noAuthJsonFetch(
      `${this.url}/${connectionKey}/${phoneNumber.replace(
        /[^0-9]/g,
        ""
      )}/create`,
      "POST",
      args,
      token
    );
  }

  deleteChat(deletedChat, token) {
    return noAuthJsonFetch(
      `${this.url}/${deletedChat.connectionKey}/${deletedChat.chatId}`,
      "DELETE",
      {},
      token
    );
  }
}
