import { noAuthJsonFetch } from "./fetch";
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
 * @param token                 token keycloack do usuário
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
    initialInfoFromProduct = await noAuthJsonFetch(
      getInitialStatePath,
      "POST",
      params,
      token
    );
  }

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
