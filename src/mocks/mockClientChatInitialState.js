import { mockUnreadInitialState } from "./mockUnreadInitialState";

const mock = { ...mockUnreadInitialState };

mock.currentClient = {
  clientName: "Mauricio Dentz",
  disabled: false,
  // could have many chats to client contacts
  clientChatIds: ["5548999012888"],
  connectionKey: "sandbox-dev",
  destination: "default",
};

export const mockClientChatInitialState = mock;
