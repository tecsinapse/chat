import React, { useContext, useState } from "react";
import { useStyle } from "./styles";
import { Table } from "@tecsinapse/table";
import { toMoment } from "../../utils/dates";
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
import { getOptions, runSwitchToOnlyNotClients } from "./functions";
import useFiltered from "../../hooks/useFiltered";
import ChatContext from "../../context";

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
  const [chatContext] = useContext(ChatContext);
  const { extraInfoColumns } = componentInfo;
  const allChats = Array.from(chatContext.values());
  const [chats, setChats] = useState(sortChatsByContactAt(allChats));
  const [chatsFiltered, setChatsFiltered] = useState(
    sortChatsByContactAt(allChats)
  );
  const [showOnlyNotClients, setShowOnlyNotClients] = useState(false);
  const [deletingChat, setDeletingChat] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");
  const classes = useStyle();

  useFiltered(globalSearch, setChatsFiltered, chats);

  const switchToOnlyNotClients = () =>
    runSwitchToOnlyNotClients(
      showOnlyNotClients,
      allChats,
      setChats,
      setShowOnlyNotClients
    );

  const deleteChat = () => {
    onDeleteChat(deletingChat).then((updatedAllChats) => {
      setDeletingChat({});
      setChats(updatedAllChats);
    });
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

  const exportOptions = !mobile ? getOptions(chats, extraInfoColumns) : {};

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
