import {defaultFetch, noAuthJsonFetch} from "../Util/fetch";
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
  if (process.env.NODE_ENV === "development") {
    // mock para tela de UNREAD
    initialInfoFromProduct = {...mockUnreadInitialState};
    // mock para tela com currentClient
    // initialInfoFromProduct = { ...mockClientChatInitialState };
  } else {
    initialInfoFromProduct = await noAuthJsonFetch(
      getInitialStatePath,
      "GET",
      {}
    );
  }

  const chatIds = initialInfoFromProduct.allChats
    .map((chat) => chat.chatId)
    .join(",");
  const completeChatInfos = await defaultFetch(
    `${chatApiUrl}/api/chats/${initialInfoFromProduct.connectionKey}/infos`,
    "POST",
    {chatIds: chatIds}
  );

  const chats = [];
  if (completeChatInfos && Array.isArray(completeChatInfos)) {
    completeChatInfos.forEach((completeInfo) => {
      // considerando a possibilidade de que o objeto inicial tenha essas informações preenchidas
      // caso positivo, devem ser consideradas com maior procedência do que a informação retornada do chatApi
      const info = initialInfoFromProduct.allChats.filter(
        (chat) => chat.chatId === completeInfo.chatId
      )[0];

      completeInfo = completeChatInfoWith(info, completeInfo);

      chats.push(completeInfo);
    });
  }

  initialInfoFromProduct.allChats = chats;
  return initialInfoFromProduct;
}

export function completeChatInfoWith(initialInfo, updatedInfo) {
  const finalInfo = {...initialInfo, ...updatedInfo};

  // deve manter somente algumas informações dos valores iniciais
  if (initialInfo.name && initialInfo.name !== "") {
    finalInfo.name = initialInfo.name;
  }
  if (initialInfo.phone && initialInfo.phone !== "") {
    finalInfo.phone = initialInfo.phone;
  }

  finalInfo.lastMessageAt = format(finalInfo.lastMessageAt);
  finalInfo.contactAt = format(finalInfo.contactAt);

  return finalInfo;
}

function format(dateTime) {
  let m;
  if (Array.isArray(dateTime)) {
    m = moment(dateTime.slice(0, 6));
  } else {
    m = moment(dateTime);
  }

  return m.isValid()
    ? m.format("DD/MM/YYYY HH:mm")
    : dateTime; // already formatted
}
