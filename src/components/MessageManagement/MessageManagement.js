import React, { useState } from "react";
import { Table } from "@tecsinapse/table";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { useQueryClient } from "react-query";
import { useStyle } from "./styles";
import { TableHeader } from "./TableHeader";
import { customActionsMobile, generateColumns } from "./tableUtils";
import { getOptions, dataFetcher } from "./functions";
import ReactGA from "react-ga4";

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
  chatService,
  reload,
}) => {
  const classes = useStyle();
  const queryClient = useQueryClient();
  const { extraInfoColumns } = componentInfo;

  const [showOnlyNotClients, setShowOnlyNotClients] = useState(false);
  const [deletingChat, setDeletingChat] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");

  const deleteChat = () => {
    onDeleteChat(deletingChat).then(() => {
      setDeletingChat({});
      ReactGA.event({
        category: deletingChat.connectionKey,
        action: "Discard Chat",
      });
      reload();
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

  const exportOptions = !mobile ? getOptions(extraInfoColumns) : {};

  const handleSwitchClients = () => setShowOnlyNotClients(!showOnlyNotClients);

  const toolbarOptions = {
    title: (
      <TableHeader
        showNotClient={showOnlyNotClients}
        switchToOnlyNotClients={handleSwitchClients}
        headerClass={headerClass}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        mobile={mobile}
      />
    ),
  };

  const fetcherProps = {
    queryClient,
    componentInfo,
    chatService,
    showOnlyNotClients,
    globalSearch,
  };

  return (
    <>
      <Table
        onDrawerClose={() => {}}
        classes={{ rootMobile: classes.rootMobile }}
        columns={columns}
        data={dataFetcher(fetcherProps)}
        rowId={(row) => row.chatId}
        customActionsMobile={generateActionsMobile}
        pagination
        onRowClick={(row) => !mobile && onSelectChat(row)}
        exportOptions={exportOptions}
        toolbarOptions={toolbarOptions}
        rowsPerPage={10}
        rowsPerPageOptions={[5, 10, 20, 30, 50, 100]}
        hideSelectFilterLabel
      />
      <Dialog
        open={deletingChat && Object.keys(deletingChat).length > 0}
        onClose={() => setDeletingChat({})}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">Confirmação</DialogTitle>
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
