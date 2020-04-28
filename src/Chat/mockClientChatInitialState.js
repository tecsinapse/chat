import {mockUnreadInitialState} from "./mockUnreadInitialState";

const mock = {...mockUnreadInitialState};

mock.currentClient = {
  clientName: 'João Paulo Bassinello',
  disabled: false,
  // could have many chats to client contacts
  clientChatIds: ['ee4011bc-1fab-439e-a35a-18eb92ec3afc@tunnel.msging.net']
};

export const mockClientChatInitialState = mock;
