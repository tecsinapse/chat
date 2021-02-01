import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Table } from "@tecsinapse/table";
import { format, toMoment } from "../../utils/dates";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { TableHeader } from "./TableHeader";
import { customActionsMobile, generateColumns } from "./tableUtils";
import { matcher } from "./globalSearch";

const sortChatsByContactAt = (allChats) =>
  allChats.sort((a, b) => {
    const contactA = toMoment(a?.contactAt);
    const contactB = toMoment(b?.contactAt);
    if (contactA > contactB) return -1;
    else if (contactA < contactB) return 1;
    else return 0;
  });

export const MessageManagement = ({
  componentInfo,
  onSelectChat,
  onDeleteChat,
  userkeycloakId,
  showMessagesLabel,
  showDiscardOption,
  headerClass,
  mobile,
  customActions,
  setDrawerOpen,
}) => {
  const { extraInfoColumns, allChats = [] } = componentInfo;
  const [chats, setChats] = useState(sortChatsByContactAt(allChats));
  const [chatsFiltered, setChatsFiltered] = useState(
    sortChatsByContactAt(allChats)
  );
  const [showOnlyNotClients, setShowOnlyNotClients] = useState(false);
  const [deletingChat, setDeletingChat] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");
  const classes = useStyle();

  useEffect(() => {
    const filtered = chats.filter(
      (el) =>
        matcher(globalSearch, format(el.contactAt)).length > 0 ||
        matcher(globalSearch, el.phone).length > 0 ||
        matcher(globalSearch, el.lastMessage).length > 0 ||
        matcher(globalSearch, el.name).length > 0 ||
        matcher(globalSearch, el.subName || "").length > 0 ||
        matcher(globalSearch, el.extraInfo?.segmento || "").length > 0 ||
        matcher(globalSearch, el.extraInfo?.responsavel || "").length > 0 ||
        matcher(globalSearch, el.extraInfo?.dealer || "").length > 0
    );
    setChatsFiltered(filtered);
  }, [globalSearch, chats]);

  const switchToOnlyNotClients = () => {
    const showOnly = !showOnlyNotClients;
    if (showOnly) {
      setChats([...allChats].filter((it) => it.highlighted));
    } else {
      setChats([...allChats]);
    }
    setShowOnlyNotClients(showOnly);
  };

  const deleteChat = () => {
    onDeleteChat(deletingChat).then((updatedAllChats) => {
      setDeletingChat({});
      setChats(updatedAllChats);
    });
  };

  const exportToCSV = () => {
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

  const generateActionsMobile = (data) =>
    customActionsMobile(
      data,
      onSelectChat,
      showMessagesLabel,
      customActions,
      userkeycloakId,
      setDrawerOpen,
      showDiscardOption,
      setDeletingChat
    );

  const columns = generateColumns(
    extraInfoColumns,
    mobile,
    showMessagesLabel,
    showDiscardOption,
    userkeycloakId,
    onSelectChat,
    setDeletingChat,
    classes,
    globalSearch
  );

  const exportOptions = !mobile
    ? {
        exportFileName: "chat-mensagens",
        position: "footer",
        footerSpan: 2,
        exportTypes: [
          {
            label: "Exportar para CSV",
            type: "custom",
            exportFunc: () => exportToCSV(),
          },
        ],
      }
    : {};

  const toolbarOptions = {
    title: (
      <TableHeader
        showNotClient={showOnlyNotClients}
        switchToOnlyNotClients={switchToOnlyNotClients}
        headerClass={headerClass}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        mobile={mobile}
      />
    ),
  };

  return (
    <>
      <Table
        onDrawerClose={() => {}}
        classes={{ rootMobile: classes.rootMobile }}
        columns={columns}
        data={chatsFiltered}
        rowId={(row) => row.chatId}
        customActionsMobile={generateActionsMobile}
        pagination
        onRowClick={(row) => !mobile && onSelectChat(row)}
        exportOptions={exportOptions}
        toolbarOptions={toolbarOptions}
        hideSelectFilterLabel
      />
      <Dialog
        open={deletingChat && Object.keys(deletingChat).length > 0}
        onClose={() => setDeletingChat({})}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">{"Confirmação"}</DialogTitle>
        <DialogContent>
          <DialogContentText>Descartar a conversa?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setDeletingChat({})} color="primary">
            Não
          </Button>
          <Button onClick={deleteChat} color="primary" autoFocus>
            Sim
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const useStyle = makeStyles(() => ({
  highlighted: {
    fontWeight: "bold",
    color: "#e6433f",
  },
  badgeAlign: {
    top: "8px",
    right: "12px",
  },
  rootMobile: {
    paddingTop: "1px",
    height: "calc(100vh - 218px)",
  },
}));
