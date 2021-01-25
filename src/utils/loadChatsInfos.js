import { defaultFetch, noAuthJsonFetch } from "./fetch";
import { mockUnreadInitialState } from "../mocks/mockUnreadInitialState";
import { format, toMoment } from "./dates";

/**
 * Busca dos dados para inicializar o componente
 *
 * @param chatApiUrl            URL da api do tec-chat
 * @param getInitialStatePath   caminho para o endpoint do produto de informações iniciais dos chats
 * @param params                objeto JSON para busca dos dados
 * @param standalone            condicional de renderização se o ambiente atual é desenvolvimento
 * @param userMock              dados de configuração do usuário logado para testes em desenvolvimento
 * @returns {Promise<[]>}       informações completas do objeto que representa esse componente
 */
export async function load({
  chatApiUrl,
  getInitialStatePath,
  params,
  standalone,
  userMock = mockUnreadInitialState,
  token,
}) {
  // primeiro busca a informação do produto local. É essa informação que fará a inicialização do chat
  // é essa informação que carrega quais chats são do usuário que está acessando o componente
  let initialInfoFromProduct;
  if (standalone) {
    // mock para tela de UNREAD
    initialInfoFromProduct = userMock;
  } else {
    // A configuração inicial do servidor chega nessa requisição (componentInfo), o mock é o ponto de partida
    initialInfoFromProduct = await noAuthJsonFetch(
      getInitialStatePath,
      "POST",
      params,
      token
    );
  }

  const groupedChatIds = new Map();
  initialInfoFromProduct.allChats.forEach((chat) => {
    const key = `${chat.connectionKey}/${chat.destination}`;
    if (groupedChatIds.has(key)) {
      groupedChatIds.get(key).push(chat.chatId);
    } else {
      groupedChatIds.set(key, [chat.chatId]);
    }
  });

  const chats = [];
  for (const key of groupedChatIds.keys()) {
    await defaultFetch(
      `${chatApiUrl}/api/chats/${key}/infos`,
      "POST",
      groupedChatIds.get(key)
    ).then((completeChatInfos) => {
      if (completeChatInfos && Array.isArray(completeChatInfos)) {
        completeChatInfos.forEach((completeInfo) => {
          // considerando a possibilidade de que o objeto inicial tenha essas informações preenchidas
          // caso positivo, devem ser consideradas com maior procedência do que a informação retornada do chatApi
          const info = initialInfoFromProduct.allChats.filter(
            (chat) =>
              chat.chatId === completeInfo.chatId &&
              key === `${chat.connectionKey}/${chat.destination}`
          )[0];

          completeInfo = completeChatInfoWith(info, completeInfo);
          chats.push(completeInfo);
        });
      }
    });
  }

  chats.sort((a, b) => toMoment(b.lastMessageAt) - toMoment(a.lastMessageAt));

  initialInfoFromProduct.allChats = chats;
  return initialInfoFromProduct;
}

export function completeChatInfoWith(initialInfo, updatedInfo) {
  const finalInfo = { ...initialInfo, ...updatedInfo };

  // deve manter somente algumas informações dos valores iniciais
  if (initialInfo.name && initialInfo.name !== "") {
    finalInfo.name = initialInfo.name;
  }
  if (initialInfo.phone && initialInfo.phone !== "") {
    finalInfo.phone = initialInfo.phone;
  }
  if (finalInfo.lastMessageAt) {
    finalInfo.lastMessageAtFormatted = format(finalInfo.lastMessageAt);
  }

  return finalInfo;
}
