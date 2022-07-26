import { format } from "../../utils/dates";
import { matcher } from "./globalSearch";
import { completeChatInfoWith } from "../../utils/loadChatsInfos";

const filterChatsByFields = (chats, globalSearch) =>
  chats.filter(
    (el) =>
      matcher(globalSearch, format(el.contactAt)).length > 0 ||
      matcher(globalSearch, el.phone).length > 0 ||
      matcher(globalSearch, el?.lastMessage).length > 0 ||
      matcher(globalSearch, el.name).length > 0 ||
      matcher(globalSearch, el?.subName || "").length > 0 ||
      matcher(globalSearch, el.extraInfo?.segmento || "").length > 0 ||
      matcher(globalSearch, el.extraInfo?.responsavel || "").length > 0 ||
      matcher(globalSearch, el.extraInfo?.dealer || "").length > 0
  );

const getOptions = (extraInfoColumns) => ({
  exportFileName: "chat-mensagens",
  position: "footer",
  footerSpan: 2,
  exportTypes: [
    {
      label: "Exportar para CSV",
      type: "custom",
      exportFunc: (data) => exportToCSV(data, extraInfoColumns),
    },
  ],
});

const exportToCSV = (chats, extraInfoColumns) => {
  const fileNameWithExt = "gestao-mensagens.csv";
  const exportedColumns = ["Data do Contato", "Cliente", "Telefone"];

  Object.keys(extraInfoColumns).forEach((key) => {
    exportedColumns.push(extraInfoColumns[key]);
  });

  const dataToExport = [];

  chats.forEach((chat) => {
    const row = [
      format(chat?.lastMessageAt || chat?.contactAt),
      chat.name,
      chat.phone,
    ];

    Object.keys(extraInfoColumns).forEach((key) => {
      row.push(chat.extraInfo[key]);
    });
    dataToExport.push(row.join(";"));
  });

  dataToExport.splice(0, 0, exportedColumns.join(";"));

  const csvData = dataToExport.join("\n");
  const csvFile = window.URL.createObjectURL(
    new Blob(["\ufeff", csvData], { type: "text/csv;charset=utf-8;" })
  );

  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(csvFile, fileNameWithExt);
  } else {
    const hiddenElement = document.createElement("a");

    hiddenElement.href = csvFile;
    hiddenElement.target = "_blank";
    hiddenElement.download = fileNameWithExt;
    hiddenElement.style.visibility = "hidden";
    document.body.appendChild(hiddenElement);
    hiddenElement.click();
    document.body.removeChild(hiddenElement);
  }
};

const getGroupedChats = (allChats) => {
  const groupedChatIds = new Map();

  (allChats || []).forEach((chat) => {
    const key = `${chat.connectionKey}/${chat.destination}`;

    if (groupedChatIds.has(key)) {
      groupedChatIds.get(key).push(chat.chatId);
    } else {
      groupedChatIds.set(key, [chat.chatId]);
    }
  });

  return groupedChatIds;
};

const filterChats = (chats = [], onlyNotClients = false, globalSearch = "") => {
  const chatsByFields = filterChatsByFields(chats, globalSearch);

  return onlyNotClients
    ? chatsByFields.filter((item) => item?.highlighted)
    : chatsByFields;
};

const findInitialInfo = (componentInfo, chatItem) =>
  componentInfo.allChats.find(
    (contact) =>
      contact.chatId === chatItem.chatId &&
      contact.destination === chatItem.destination &&
      contact.connectionKey === chatItem.connectionKey
  );

const sortChatsByContact = (a, b) => {
  const contactA = a?.contactAt;
  const contactB = b?.contactAt;

  if (contactA > contactB) {
    return -1;
  }

  if (contactA < contactB) {
    return 1;
  }

  return 0;
};

const dataFetcher = ({
  queryClient,
  componentInfo,
  chatService,
  showOnlyNotClients,
  globalSearch,
}) => async (filters) => {
  const { page, rowsPerPage, ascending, sortField } = filters;
  const data = await queryClient.fetchQuery(
    ["FetchMessages", { page, showOnlyNotClients, globalSearch }],
    ({ queryKey }) => {
      const {
        page: currentPage,
        showOnlyNotClients: onlyNotClients,
        globalSearch: search,
      } = queryKey[1];
      const chatsToFetch = filterChats(
        componentInfo?.allChats,
        onlyNotClients,
        search
      );
      const groupedChats = !globalSearch
        ? getGroupedChats(chatsToFetch.filter((it) => it.archived === false))
        : getGroupedChats(chatsToFetch);

      return chatService.findMessagesByCurrentUser(
        groupedChats,
        currentPage,
        rowsPerPage
      );
    }
  );
  let totalElements = 0;
  const mergedKeys = data
    ?.map((ckey) => {
      totalElements += ckey?.totalElements;

      return ckey.content;
    })
    .flat();
  const filledData = mergedKeys
    ?.map((chatItem) =>
      completeChatInfoWith(findInitialInfo(componentInfo, chatItem), chatItem)
    )
    .sort((a, b) =>
      ascending && !!sortField
        ? sortChatsByContact(b, a)
        : sortChatsByContact(a, b)
    );

  if (totalElements < 1) {
    return {
      data: [],
      totalCount: 0,
    };
  }

  return {
    data: filledData,
    totalCount: totalElements,
  };
};

export { dataFetcher, getOptions, getGroupedChats, filterChatsByFields };
