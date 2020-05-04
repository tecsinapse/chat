import {defaultFetch} from "../Util/fetch";
import moment from "moment";
import {mockUnreadInitialState} from "./mockUnreadInitialState";

/**
 * Busca dos dados para inicializar o componente
 *
 * @param chatApiUrl            URL da api do tec-chat
 * @param getInitialStatePath   caminho para o endpoint do produto de informações iniciais dos chats
 * @returns {Promise<[]>}       informações completas do objeto que representa esse componente
 */
export async function load(chatApiUrl, getInitialStatePath) {
  // primeiro busca a informação do produto local. É essa informação que fará a inicialização do chat
  // é essa informação que carrega quais chats são do usuário que está acessando o componente
  let initialInfoFromProduct;
  if (process.env.NODE_ENV === 'development') {
    initialInfoFromProduct = {...mockUnreadInitialState};
    // initialInfoFromProduct = {...mockClientChatInitialState};
  } else {
    initialInfoFromProduct = await defaultFetch(getInitialStatePath,
      "GET",
      {});
  }

  const chatIds = initialInfoFromProduct.allChats.map(chat => chat.chatId).join(",");
  const completeChatInfos = await defaultFetch(
    `${chatApiUrl}/api/chats/${initialInfoFromProduct.connectionKey}/infos`,
    "POST",
    {chatIds: chatIds}
  );

  const chats = [];
  completeChatInfos.forEach(completeInfo => {
    // considerando a possibilidade de que o objeto inicial tenha essas informações preenchidas
    // caso positivo, devem ser consideradas com maior procedência do que a informação retornada do chatApi
    const info = initialInfoFromProduct.allChats.filter(
      chat => chat.chatId === completeInfo.chatId
    )[0];

    completeInfo = completeChatInfoWith(info, completeInfo);

    chats.push(completeInfo);
  });

  initialInfoFromProduct.allChats = chats;
  return initialInfoFromProduct;
}

export function completeChatInfoWith(initialInfo, updatedInfo) {
  const finalInfo = {...updatedInfo, ...initialInfo};

  const m1 = moment(finalInfo.lastMessageAt);
  finalInfo.lastMessageAt = m1.isValid() ?
    m1.format("DD/MM/YYYY HH:mm")
    : updatedInfo.lastMessageAt; // already formatted

  const m2 = moment(finalInfo.contactAt);
  finalInfo.contactAt = m2.isValid() ?
    m2.format("DD/MM/YYYY HH:mm")
    : finalInfo.contactAt; // already formatted

  return finalInfo;
}
