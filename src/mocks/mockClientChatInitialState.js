import { mockUnreadInitialState } from "./mockUnreadInitialState";

const mock = { ...mockUnreadInitialState };

mock.currentClient = {
  clientName: "Denner",
  connectionKey: "sandbox-dev",
  destination: "fiat",
  disabled: false,
  status: "OK",
  clientChatIds: ["5567992678000"],
  archived: false,
};

export const mockClientChatInitialState = mock;
