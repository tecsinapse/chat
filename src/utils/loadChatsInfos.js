import { defaultFetch, noAuthJsonFetch } from "./fetch";
import { mockUnreadInitialState } from "../mocks/mockUnreadInitialState";
import { format, toMoment } from "./dates";

export async function load({
  chatApiUrl,
  getInitialStatePath,
  params,
  standalone,
  userMock = mockUnreadInitialState,
  token,
}) {
  let completeChatInfos;

  if (standalone) {
    completeChatInfos = userMock;
  } else {
    completeChatInfos = await noAuthJsonFetch(
      getInitialStatePath,
      "POST",
      params,
      token
    );
  }

  const { allChats, connectionKeys, destination } = completeChatInfos;

  for (const connectionKey of getDistinctConnectionKeys(connectionKeys)) {
    const chatIds = getChatIdsByConnectionKey(allChats, connectionKey);

    const coreChatInfos = await defaultFetch(
      `${chatApiUrl}/api/chats/${connectionKey}/${destination}/infos`,
      "POST",
      chatIds
    );

    completeChatInfos.allChats = completeChatInfosWith(
      completeChatInfos.allChats,
      coreChatInfos
    );
  }

  return completeChatInfos;
}

export function completeChatInfoWith(initialInfo, updatedInfo) {
  const finalInfo = { ...initialInfo, ...updatedInfo };

  if (initialInfo.name && initialInfo.name !== "") {
    finalInfo.name = initialInfo.name;
  }

  if (initialInfo.phone && initialInfo.phone !== "") {
    finalInfo.phone = initialInfo.phone;
  }

  if (
    initialInfo.contactAt &&
    updatedInfo.lastMessageAt &&
    toMoment(updatedInfo.lastMessageAt).isAfter(toMoment(initialInfo.contactAt))
  ) {
    finalInfo.contactAt = updatedInfo.lastMessageAt;
  }

  if (finalInfo.lastMessageAt) {
    finalInfo.lastMessageAtFormatted = format(finalInfo.lastMessageAt);
  }

  return finalInfo;
}

const completeChatInfosWith = (initialChatInfos, chatInfos) => {
  initialChatInfos.forEach((chat, index) => {
    const chatInfo = chatInfos.find(
      (chatInfo) => getChatId(chat) === getChatId(chatInfo)
    );
    initialChatInfos[index] = completeChatInfoWith(chat, chatInfo);
  });

  return initialChatInfos;
};

const getChatIdsByConnectionKey = (chatInfos, connectionKey) =>
  (chatInfos || [])
    .filter((it) => it.connectionKey === connectionKey)
    .map((it) => it.chatId);

const getDistinctConnectionKeys = (connectionKeys) =>
  connectionKeys
    .map((it) => it.value)
    .filter((it, index, self) => self.indexOf(it) === index);

const getChatId = (chat) =>
  `${chat.chatId}.${chat.connectionKey}.${chat.destination}`;
