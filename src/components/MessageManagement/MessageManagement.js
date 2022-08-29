import React from "react";
import { Table } from "@tecsinapse/table";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import ReactGA from "react-ga4";
import { TableHeader } from "./TableHeader";
import { MESSAGES_INFO } from "../../constants/MessagesInfo";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { Loading } from "../../utils/Loading";
import { generateColumns } from "./utils";

export const MessageManagement = ({
  loading,
  setLoading,
  onlyNotClients,
  setOnlyNotClients,
  globalSearch,
  setGlobalSearch,
  selectedChat,
  setSelectedChat,
  setCurrentChat,
  componentInfo,
  userkeycloakId,
  setView,
  page,
  setPage,
  pageSize,
  productService,
  chatService,
}) => {
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleSelectCurrentChat = (chat) => {
    setCurrentChat(chat);
    setView(COMPONENT_LOCATION.CHAT);
  };

  const handleDeleteChat = async () => {
    try {
      setLoading(true);

      await productService.deleteChat(selectedChat);
      await chatService.deleteSessionChat(selectedChat);

      ReactGA.event({
        category: selectedChat.connectionKey,
        action: "Discard Chat",
      });
    } catch (e) {
      console.error("[DELETE_CHAT] Error when deleting", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeleteChat = () => {
    setSelectedChat(null);
  };

  const { chats, totalChats, extraInfoColumns } = componentInfo;

  const columns = generateColumns(
    extraInfoColumns,
    userkeycloakId,
    handleSelectCurrentChat,
    handleSelectChat,
    globalSearch
  );

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={{ data: chats, totalCount: totalChats }}
          rowId={({ chatId, connectionKey }) => chatId + "-" + connectionKey}
          onRowClick={handleSelectCurrentChat}
          toolbarOptions={{
            title: (
              <TableHeader
                onlyNotClients={onlyNotClients}
                setOnlyNotClients={setOnlyNotClients}
                globalSearch={globalSearch}
                setGlobalSearch={setGlobalSearch}
              />
            ),
          }}
          page={page}
          setPage={setPage}
          rowsPerPage={pageSize}
          hideSelectFilterLabel
          pagination
        />
      )}
      {selectedChat && (
        <Dialog
          open={selectedChat}
          onClose={handleCloseDeleteChat}
          aria-labelledby="dialog-title"
        >
          <DialogTitle id="dialog-title">Confirmação</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {MESSAGES_INFO.DISCARD_LABEL}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleCloseDeleteChat} color="primary">
              Não
            </Button>
            <Button onClick={handleDeleteChat} color="primary" autoFocus>
              Sim
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
