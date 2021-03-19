import { noAuthJsonFetch } from "../utils/fetch";

export class ProductService {
  url = "";

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

  async deleteChat(deletedChat, token) {
    return await noAuthJsonFetch(
      `${this.url}/${deletedChat.connectionKey}/${deletedChat.chatId}`,
      "DELETE",
      {},
      token
    );
  }
}
