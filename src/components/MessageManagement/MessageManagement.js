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
import { Input } from "@tecsinapse/ui-kit";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
import { COMPONENT_VIEW } from "../../constants/COMPONENT_VIEW";
import { Loading } from "../Loading/Loading";
import { generateColumns } from "./utils";
import { useStyle } from "./styles";
import { encodeChatData } from "../utils";
import { DeleteChat } from "../DeleteChat/DeleteChat";
import { ANALYTICS_EVENTS } from "../../constants/ANALYTICS_EVENTS";
import { LoadMetric } from "../LoadMetric/LoadMetric";

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
  view,
  setView,
  page,
  setPage,
  pageSize,
  executeFirstAction,
  productService,
  chatService,
}) => {
  const classes = useStyle();

  const [chatToDelete, setChatToDelete] = useState(null);
  const [chatToExecFirstAction, setChatToExecFirstAction] = useState(null);
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
    }, 1000),
    []
  );

  const handleChangeGlobalSearch = (event) => {
    if (event.target.value !== globalSearch) {
      debounceGlobalSearch(event.target.value);
    }
  };

  const handleSelectChatToDelete = (chat) => {
    setChatToDelete(chat);
    setDeleting(true);
  };

  const handleSelectCurrentChat = (firstAction) => (chat) => {
    if (firstAction && executeFirstAction) {
      setChatToExecFirstAction(chat);
    } else {
      setCurrentChat(chat);
      setView(COMPONENT_VIEW.CHAT_MESSAGES);
    }
  };

  const handleExecuteFirstAction = () => {
    const encodedData = encodeChatData(chatToExecFirstAction, userkeycloakId);

    window.open(
      `${chatToExecFirstAction.actions[0].path}?data=${encodedData}`,
      "_self"
    );
  };

  const handleCloseExecuteFirstAction = () => {
    setChatToExecFirstAction(null);
  };

  const handleFetchTableData = () =>
    new Promise((resolve) => {
      resolve({ data: chats, totalCount: totalChats });
    });

  return (
    <div className={classes.container}>
      {loading ? (
        <div className={classes.loadingContainer}>
          <LoadMetric metricId={view} userkeyloakId={userkeycloakId}>
            <Loading />
          </LoadMetric>
        </div>
      ) : (
        <Table
          columns={generateColumns(
            classes,
            extraInfoColumns,
            userkeycloakId,
            userNamesById,
            handleSelectCurrentChat(false),
            handleSelectChatToDelete,
            globalSearch,
            executeFirstAction
          )}
          data={handleFetchTableData}
          rowId={({ chatId, connectionKey }) => `${chatId}-${connectionKey}`}
          onRowClick={handleSelectCurrentChat(true)}
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
          rowsPerPageOptions={[10, 20, 30]}
          hideSelectFilterLabel
          pagination
        />
      )}
      {deleting && (
        <DeleteChat
          setChatToDelete={setChatToDelete}
          setDeleting={setDeleting}
          chatToDelete={chatToDelete}
          productService={productService}
          chatService={chatService}
          setView={setView}
          setConnectionError={setConnectionError}
          analyticsEventName={ANALYTICS_EVENTS.DISCART_CHAT_MESSAGE_MANAGEMENT}
          userkeycloakId={userkeycloakId}
        />
      )}
      {executeFirstAction && chatToExecFirstAction?.actions[0] && (
        <Dialog
          open={chatToExecFirstAction}
          onClose={handleCloseExecuteFirstAction}
          aria-labelledby="dialog-title"
        >
          <DialogTitle id="dialog-title">Confirmação</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Voce será direcionado e pode perder a ação que está executando no
              momento. Deseja continuar?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={handleCloseExecuteFirstAction}
              color="primary"
            >
              Não
            </Button>
            <Button onClick={handleExecuteFirstAction}>Sim</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};
