import { defaultFetch } from "../Util/fetch";
import moment from "moment";

/**
 * Fetch complete data from server
 *
 * @param initialChatsInfos initial information about chats. Should contain at least the connectionKey and chats IDs
 * @param chatApiUrl api URL
 * @returns {Promise<[]>} with the complete chats informations
 */
export async function loadChatsInfos(initialChatsInfos, chatApiUrl) {
  const chatIds = initialChatsInfos.chats.map(chat => chat.chatId).join(",");
  const completeChatInfos = await defaultFetch(
    `${chatApiUrl}/api/chats/${initialChatsInfos.connectionKey}/infos`,
    "POST",
    { chatIds: chatIds }
  );

  const chats = [];
  completeChatInfos.forEach(completeInfo => {
    // considerando a possibilidade de que o objeto inicial tenha essas informações preenchidas
    // caso positivo, devem ser consideradas com maior procedência do que a informação retornada do chatApi
    const info = initialChatsInfos.chats.filter(
      chat => chat.chatId === completeInfo.chatId
    )[0];
    completeInfo.name = info.name || completeInfo.name;
    completeInfo.phone = info.phone || completeInfo.phone;
    completeInfo.lastMessageAt = moment(completeInfo.lastMessageAt).format(
      "DD/MM/YYYY HH:mm"
    );

    chats.push(completeInfo);
  });

  return chats;
}
