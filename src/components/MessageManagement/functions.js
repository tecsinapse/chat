import {format} from "../../utils/dates";

const getOptions = (chats, extraInfoColumns) => {
  return {
    exportFileName: "chat-mensagens",
    position: "footer",
    footerSpan: 2,
    exportTypes: [
      {
        label: "Exportar para CSV",
        type: "custom",
        exportFunc: () => exportToCSV(chats, extraInfoColumns),
      },
    ],
  };
};

const exportToCSV = (chats, extraInfoColumns) => {
  let fileNameWithExt = "gestao-mensagens.csv";
  const exportedColumns = ["Data do Contato", "Cliente", "Telefone"];

  Object.keys(extraInfoColumns).forEach((key) => {
    exportedColumns.push(extraInfoColumns[key]);
  });

  const dataToExport = [];
  chats.forEach((chat) => {
    const row = [format(chat.lastMessageAt), chat.name, chat.phone];
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

const runSwitchToOnlyNotClients = (
  showOnlyNotClients,
  allChats,
  setChats,
  setShowOnlyNotClients
) => {
  const showOnly = !showOnlyNotClients;
  if (showOnly) {
    setChats([...allChats].filter((it) => it.highlighted));
  } else {
    setChats([...allChats]);
  }
  setShowOnlyNotClients(showOnly);
};

export { getOptions, runSwitchToOnlyNotClients };
