import { mockUnreadInitialState } from "./mockUnreadInitialState";

const mock = { ...mockUnreadInitialState };

mock.currentClient = {
  clientName: "João Paulo Bassinello",
  disabled: false,
  // could have many chats to client contacts
  clientChatIds: ["5548999012888"],
  connectionKey: "sandbox-dev",
  destination: "nissan",
};

export const mockClientChatInitialState = mock;
