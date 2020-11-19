import { mockUnreadInitialState } from "./mockUnreadInitialState";

const mock = { ...mockUnreadInitialState };

mock.currentClient = {
  clientName: "Denner Vidal",
  disabled: false,
  // could have many chats to client contacts
  clientChatIds: ["5567992678000"],
  connectionKey: "sandbox-homolog",
  destination: "mercedes",
};

export const mockClientChatInitialState = mock;
