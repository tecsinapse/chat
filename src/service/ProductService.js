import { noAuthJsonFetch } from "./utils";

export class ProductService {
  constructor(urlBase) {
    this.url = urlBase;
  }

  loadComponentInfo(
    globalSearch,
    onlyNotClients,
    onlyUnreads,
    chatIds,
    params,
    page,
    pageSize
  ) {
    return noAuthJsonFetch(`${this.url}/componentInfo`, "POST", {
      globalSearch,
      onlyNotClients,
      onlyUnreads,
      unreadChatIds: onlyUnreads ? chatIds.filter((it) => it.unreads > 0) : [],
      ...params,
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

  deleteChat(connectionKey, chatId) {
    return noAuthJsonFetch(
      `${this.url}/${connectionKey}/${chatId}`,
      "DELETE",
      {}
    );
  }
}
