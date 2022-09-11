import React, { useCallback, useState } from "react";
import { Table } from "@tecsinapse/table";
import {
  Button,
  debounce,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
  Typography,
} from "@material-ui/core";
import ReactGA from "react-ga4";
import { Input } from "@tecsinapse/ui-kit";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
import { COMPONENT_VIEW } from "../../constants/COMPONENT_VIEW";
import { Loading } from "../Loading/Loading";
import { generateColumns } from "./utils";
import { useStyle } from "./styles";

export const MessageManagement = ({
  loading,
  onlyNotClients,
  setOnlyNotClients,
  onlyUnreads,
  setOnlyUnreads,
  globalSearch,
  setGlobalSearch,
  setCurrentChat,
  setConnectionError,
  componentInfo,
  userNamesById,
  userkeycloakId,
  setView,
  page,
  setPage,
  pageSize,
  productService,
  chatService,
}) => {
  const classes = useStyle();

  const [selectedChat, setSelectedChat] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { chats, totalChats, extraInfoColumns } = componentInfo;

  const handleChangeOnlyNotClients = () => {
    setOnlyNotClients(!onlyNotClients);
  };

  const handleChangeOnlyUnreads = () => {
    setOnlyUnreads(!onlyUnreads);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceGlobalSearch = useCallback(
    debounce((value) => {
      setGlobalSearch(value);
    }, 800),
    []
  );

  const handleChangeGlobalSearch = (event) => {
    if (event.target.value !== globalSearch) {
      debounceGlobalSearch(event.target.value);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleSelectCurrentChat = (chat) => {
    setCurrentChat(chat);
    setView(COMPONENT_VIEW.CHAT_MESSAGES);
  };

  const handleDeleteChat = () => {
    setDeleting(true);

    productService
      .deleteChat(selectedChat)
      .then(() => {
        chatService
          .deleteSessionChat(selectedChat)
          .then(() => {
            const { connectionKey } = selectedChat;

            ReactGA.event({
              category: connectionKey,
              action: "Discard Chat",
            });

            setSelectedChat(null);
            setDeleting(false);
          })
          .catch(() => {
            setSelectedChat(null);
            setDeleting(false);
            setConnectionError(true);
          });
      })
      .catch(() => {
        setSelectedChat(null);
        setDeleting(false);
        setConnectionError(true);
      });
  };

  const handleCloseDeleteChat = () => {
    setSelectedChat(null);
  };

  const handleFetchTableData = () =>
    new Promise((resolve) => {
      resolve({ data: chats, totalCount: totalChats });
    });

  return (
    <div className={classes.container}>
      {loading || deleting ? (
        <div className={classes.loadingContainer}>
          <Loading />
        </div>
      ) : (
        <Table
          columns={generateColumns(
            classes,
            extraInfoColumns,
            userkeycloakId,
            userNamesById,
            handleSelectCurrentChat,
            handleSelectChat,
            globalSearch
          )}
          data={handleFetchTableData}
          rowId={({ chatId, connectionKey }) => `${chatId}-${connectionKey}`}
          onRowClick={handleSelectCurrentChat}
          toolbarOptions={{
            title: (
              <>
                <div className={classes.toolbarContainer}>
                  <FormControlLabel
                    label="Exibir apenas clientes não cadastrados no sistema"
                    control={<Switch size="small" />}
                    onChange={handleChangeOnlyNotClients}
                    checked={onlyNotClients}
                    classes={{
                      root: classes.toolbarSwitch,
                      label: classes.toolbarSwitchLabel,
                    }}
                  />
                  <FormControlLabel
                    label="Exibir apenas conversas com mensagens não lidas"
                    control={<Switch size="small" />}
                    onChange={handleChangeOnlyUnreads}
                    checked={onlyUnreads}
                    classes={{
                      root: classes.toolbarSwitch,
                      label: classes.toolbarSwitchLabel,
                    }}
                  />
                  <Typography
                    variant="caption"
                    className={classes.toolbarAppVersion}
                  >
                    Versão: {process.env.REACT_APP_VERSION}
                  </Typography>
                  <br />
                </div>
                <Input
                  placeholder="Pesquise por dados em qualquer campo"
                  name="globalSearch"
                  defaultValue={globalSearch}
                  startAdornment={
                    <Icon path={mdiMagnify} size={1} color="#c6c6c6" />
                  }
                  onChange={handleChangeGlobalSearch}
                  fullWidth
                />
              </>
            ),
          }}
          page={page}
          setPage={setPage}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10]}
          hideSelectFilterLabel
          pagination
        />
      )}
      {selectedChat && (
        <Dialog open={selectedChat} onClose={handleCloseDeleteChat}>
          <DialogTitle>Arquivar Conversa</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que você deseja arquivar essa conversa?
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
    </div>
  );
};
