import { mockUnreadInitialState } from "./mockUnreadInitialState";

const mock = { ...mockUnreadInitialState };

mock.currentClient = {
  clientName: "João Paulo Bassinello",
  disabled: false,
  // could have many chats to client contacts
  clientChatIds: ["5519994568196"],
  connectionKey: 'dynamo-applauso-tatui',
  destination: 'nissan'
};

export const mockClientChatInitialState = mock;
