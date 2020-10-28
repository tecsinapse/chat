import React, { useEffect, useState } from "react";
import { mdiArrowLeft, mdiChevronRight, mdiClose, mdiForum } from "@mdi/js";
import Icon from "@mdi/react";
import { Divider } from "@tecsinapse/ui-kit";
import { makeStyles, useTheme } from "@material-ui/styles";
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  Grid,
  Typography,
} from "@material-ui/core";
import { completeChatInfoWith, load } from "../../utils/loadChatsInfos";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { UnreadChats } from "../UnreadChats/UnreadChats";
import { RenderChat } from "../RenderChat/RenderChat";
import { InitWebsockets } from "./InitWebsockets";
import { MessageManagement } from "../MessageManagement/MessageManagement";
import { ChatButton } from "../ChatButton/ChatButton";
import { defaultFetch, noAuthJsonFetch } from "../../utils/fetch";
import { encodeChatData } from "../../utils/encodeChatData";
import { SendNotification } from "../SendNotification/SendNotification";

const useStyle = makeStyles((theme) => ({
  drawerContainer: {
    fontFamily:
      "font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI , Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
    margin: theme.spacing(2, 0, 0, 0),
    height: "100%",
    overflowX: "hidden",
    maxWidth: "80vw",
    minWidth: "40vw",
    /* TODO verificar uma forma melhor */
    /* Limpando estilos do Bootstrap para os inputs */
    "& input": {
      border: "0 !important",
      margin: 0,
      paddingTop: "10.5px",
      paddingBottom: "10.5px",
    },
    "& input:focus": {
      border: "0 !important",
      borderColor: "#fff",
      boxShadow: "none",
    },
    "& textarea": {
      border: "0 !important",
      margin: 0,
      paddingTop: "10.5px",
      paddingBottom: "10.5px",
    },
    "& textarea:focus": {
      border: "0 !important",
      borderColor: "#fff",
      boxShadow: "none",
    },
  },
  drawerHeader: {
    margin: theme.spacing(0, 2, 20 / 12, 2),
  },
  messageManagementLinkContainer: {
    padding: theme.spacing(1, 2, 3 / 4, 2),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.grey["300"],
    },
  },
  title: {
    padding: 0,
  },
}));

async function loadComponent(
  { chatApiUrl, getInitialStatePath, params, standalone },
  setComponentInfo,
  setIsLoadingInitialState,
  setView,
  setCurrentChat
) {
  const info = await load({
    chatApiUrl,
    getInitialStatePath,
    params,
    standalone,
  });
  setComponentInfo(info);
  setIsLoadingInitialState(false);
  if (info.currentClient && Object.keys(info.currentClient).length > 0) {
    // quando a visualização é de um cliente específico, então define as informações
    // desse cliente como currentChat e exibe o chat direto
    setView(COMPONENT_LOCATION.CHAT);
    const chats = info.allChats.filter((chat) =>
      info.currentClient.clientChatIds.includes(chat.chatId)
    );
    setCurrentChat({
      name: info.currentClient.clientName,
      connectionKey: info.currentClient.connectionKey,
      destination: info.currentClient.destination,
      disabled: info.currentClient.disabled,
      chats: chats,
    });
  }
}

export const Init = ({ chatInitConfig }) => {
  const homeLocation = chatInitConfig.onlyMessageManagement
    ? COMPONENT_LOCATION.MESSAGE_MANAGEMENT
    : COMPONENT_LOCATION.UNREAD;

  const classes = useStyle();
  const theme = useTheme();
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true);
  const [view, setView] = useState(homeLocation);
  const [componentInfo, setComponentInfo] = useState({});
  const [currentChat, setCurrentChat] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chatToOpenFirstAction, setChatToOpenFirstAction] = useState({});
  const [chatToSendNotification, setChatToSendNotification] = useState();

  useEffect(() => {
    loadComponent(
      chatInitConfig,
      setComponentInfo,
      setIsLoadingInitialState,
      setView,
      setCurrentChat
    ).then(() => {
      if (chatInitConfig?.openImmediately) {
        setIsDrawerOpen(true);
      }
    });
  }, [
    chatInitConfig,
    setComponentInfo,
    setIsLoadingInitialState,
    setView,
    setCurrentChat,
    setIsDrawerOpen,
  ]);

  const reloadComponent = () => {
    loadComponent(
      chatInitConfig,
      setComponentInfo,
      setIsLoadingInitialState,
      setView,
      setCurrentChat
    ).then(() => {});
  };

  const chatIds = (componentInfo.allChats || [])
    .map((chat) => chat.chatId)
    .join(",");
  let unreadTotal = (componentInfo.allChats || []).reduce(
    (acc, chat) => acc + chat.unread,
    0
  );

  const onChatUpdated = (updatedChat) => {
    let chatsToUpdate = [];
    let newChat = true;
    const toUpdateInfo = { ...componentInfo };
    componentInfo.allChats.forEach((chat) => {
      if (
        chat.chatId === updatedChat.chatId &&
        chat.connectionKey === updatedChat.connectionKey &&
        chat.destination === updatedChat.destination
      ) {
        updatedChat = completeChatInfoWith(chat, updatedChat);

        chatsToUpdate.push(updatedChat);
        newChat = false;
      } else {
        chatsToUpdate.push(chat);
      }
    });
    if (newChat) {
      chatsToUpdate.push(updatedChat);
    }
    toUpdateInfo.allChats = chatsToUpdate;
    setComponentInfo(toUpdateInfo);
  };

  const onReadAllMessagesOfChat = (readChat) => {
    let chatsToUpdate = [];
    const toUpdateInfo = { ...componentInfo };
    componentInfo.allChats.forEach((chat) => {
      if (
        chat.chatId === readChat.chatId &&
        chat.connectionKey === readChat.connectionKey &&
        chat.destination === readChat.destination
      ) {
        const updatedChat = { ...chat };
        updatedChat.unread = 0;
        chatsToUpdate.push(updatedChat);
      } else {
        chatsToUpdate.push(chat);
      }
    });
    toUpdateInfo.allChats = chatsToUpdate;
    setComponentInfo(toUpdateInfo);
  };

  const onSelectUnreadChat = (chat) => {
    if (chatInitConfig.clickOnUnreadOpenFirstAction) {
      setChatToOpenFirstAction(chat);
    } else {
      onSelectChat(chat);
    }
  };

  const onSelectChat = (chat) => {
    setCurrentChat({
      name: chat.name,
      connectionKey: chat.connectionKey,
      destination: chat.destination,
      disabled: false,
      chats: [chat],
    });
    setView(COMPONENT_LOCATION.CHAT);
  };

  async function onStartSendNotification() {
    if (COMPONENT_LOCATION.CHAT !== view) {
      setChatToSendNotification(null);
    }
    setView(COMPONENT_LOCATION.SEND_NOTIFICATION);
  }

  async function onDeleteChat(deletedChat) {
    await noAuthJsonFetch(
      `${chatInitConfig.deleteChatPath}/${deletedChat.connectionKey}/${deletedChat.chatId}`,
      "DELETE",
      {}
    );
    await defaultFetch(
      `${chatInitConfig.chatApiUrl}/api/chats/${deletedChat.connectionKey}/${deletedChat.chatId}/sessions/finish`,
      "DELETE",
      {}
    );
    const toUpdateInfo = { ...componentInfo };
    toUpdateInfo.allChats = componentInfo.allChats.filter(
      (chat) => chat.chatId !== deletedChat.chatId
    );

    const { currentClient } = componentInfo;
    if (currentClient && Object.keys(currentClient).length > 0) {
      if (currentClient.clientChatIds.includes(deletedChat.chatId)) {
        toUpdateInfo.currentClient = {};
      }
    }
    setComponentInfo(toUpdateInfo);
    return toUpdateInfo.allChats;
  }

  const onChatStatusChanged = (statusChangedChat, isBlocked) => {
    // controls if the current chat is expired and the button to send a notification is visible to a chat
    if (statusChangedChat) {
      componentInfo.allChats.forEach((chat) => {
        if (
          chat.chatId === statusChangedChat.chatId &&
          chat.connectionKey === statusChangedChat.connectionKey &&
          chat.destination === statusChangedChat.destination
        ) {
          // will only show the button if the chat is blocked
          setChatToSendNotification(isBlocked ? chat : null);
        }
      });
    } else {
      setChatToSendNotification(null);
    }
  };

  let showBackButton =
    view === COMPONENT_LOCATION.CHAT ||
    view === COMPONENT_LOCATION.SEND_NOTIFICATION ||
    (view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT &&
      !chatInitConfig.onlyMessageManagement);
  let showMessageManagement = view !== COMPONENT_LOCATION.MESSAGE_MANAGEMENT;
  if (
    view === COMPONENT_LOCATION.CHAT &&
    !chatInitConfig.navigateWhenCurrentChat
  ) {
    showBackButton = false;
    showMessageManagement = false;
  }

  const isChatViewAndIsBlocked =
    view === COMPONENT_LOCATION.CHAT && chatToSendNotification != null;
  const showSendNotification =
    chatInitConfig.canSendNotification &&
    (view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT ||
      view === COMPONENT_LOCATION.UNREAD ||
      isChatViewAndIsBlocked);

  return (
    <div className="Chat">
      {!isDrawerOpen && (
        <ChatButton
          isLoadingInitialState={isLoadingInitialState}
          setIsDrawerOpen={setIsDrawerOpen}
          unreadTotal={unreadTotal}
        />
      )}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <div className={classes.drawerContainer}>
          <div className={classes.drawerHeader}>
            <Grid container justify="space-between">
              <Grid item>
                <Grid container>
                  {showBackButton && (
                    <Grid item style={{ marginRight: theme.spacing(1) }}>
                      <Badge
                        color="error"
                        overlap="circle"
                        variant="dot"
                        badgeContent={unreadTotal}
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                      >
                        <Icon
                          onClick={() => setView(homeLocation)}
                          color={theme.palette.primary.main}
                          size={1.25}
                          style={{ cursor: "pointer", marginLeft: "-8px" }}
                          path={mdiArrowLeft}
                        />
                      </Badge>
                    </Grid>
                  )}
                  <Grid item>
                    <Typography
                      variant="h5"
                      color="textPrimary"
                      className={classes.title}
                    >
                      {view === COMPONENT_LOCATION.CHAT &&
                        chatInitConfig.onChatTitle}
                      {view === COMPONENT_LOCATION.UNREAD && "Painel do Chat"}
                      {view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT &&
                        "Gestão de Mensagens"}
                      {view === COMPONENT_LOCATION.SEND_NOTIFICATION &&
                        "Iniciar Nova Conversa"}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Icon
                  onClick={() => setIsDrawerOpen(false)}
                  color={theme.palette.primary.main}
                  size={1.25}
                  style={{ cursor: "pointer" }}
                  path={mdiClose}
                />
              </Grid>
            </Grid>
          </div>
          <Divider variant="inset" component="li" />

          {showMessageManagement && (
            <div
              className={classes.messageManagementLinkContainer}
              onClick={() => setView(COMPONENT_LOCATION.MESSAGE_MANAGEMENT)}
            >
              <Grid container justify="space-between" alignItems="center">
                <Grid item>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Icon
                        path={mdiForum}
                        size={1}
                        color={theme.palette.text.secondary}
                        style={{ marginTop: "3px" }}
                      />
                    </Grid>
                    <Grid item>
                      <Typography
                        color="textPrimary"
                        variant="body1"
                        display="inline"
                        style={{ fontWeight: "bold" }}
                      >
                        Gestão de mensagens
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Icon
                    color={theme.palette.text.primary}
                    size={1}
                    style={{ cursor: "pointer" }}
                    path={mdiChevronRight}
                  />
                </Grid>
              </Grid>
            </div>
          )}
          <Divider variant="inset" component="li" />

          {view === COMPONENT_LOCATION.UNREAD && (
            <UnreadChats
              chats={componentInfo.allChats}
              onSelectChat={onSelectUnreadChat}
            />
          )}
          {view === COMPONENT_LOCATION.CHAT && (
            <RenderChat
              initialInfo={currentChat}
              chatApiUrl={chatInitConfig.chatApiUrl}
              userkeycloakId={chatInitConfig.userkeycloakId}
              onReadAllMessagesOfChat={onReadAllMessagesOfChat}
              navigateWhenCurrentChat={chatInitConfig.navigateWhenCurrentChat}
              onChatStatusChanged={onChatStatusChanged}
              userNamesById={componentInfo.userNameById}
            />
          )}
          {view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT && (
            <MessageManagement
              componentInfo={componentInfo}
              onSelectChat={onSelectChat}
              onDeleteChat={onDeleteChat}
              userkeycloakId={chatInitConfig.userkeycloakId}
              showMessagesLabel={chatInitConfig.showMessagesLabel}
              showDiscardOption={chatInitConfig.showDiscardOption}
            />
          )}
          {view === COMPONENT_LOCATION.SEND_NOTIFICATION && (
            <SendNotification
              chat={chatToSendNotification}
              chatApiUrl={chatInitConfig.chatApiUrl}
              connectionKeys={componentInfo.connectionKeys}
              destination={componentInfo.destination}
            />
          )}

          {showSendNotification && (
            <div style={{ marginTop: theme.spacing(2), textAlign: "center" }}>
              <Button
                color="secondary"
                variant="contained"
                onClick={() => onStartSendNotification()}
              >
                INICIAR NOVA CONVERSA
              </Button>
            </div>
          )}
        </div>
      </Drawer>

      {!isLoadingInitialState && (
        <InitWebsockets
          chatApiUrl={chatInitConfig.chatApiUrl}
          userkeycloakId={chatInitConfig.userkeycloakId}
          chatIds={chatIds}
          connectionKeys={componentInfo.connectionKeys}
          destination={componentInfo.destination}
          onChatUpdated={onChatUpdated}
          reloadComponent={reloadComponent}
        />
      )}

      {chatInitConfig.clickOnUnreadOpenFirstAction && (
        <Dialog
          open={
            chatToOpenFirstAction &&
            Object.keys(chatToOpenFirstAction).length > 0
          }
          onClose={() => setChatToOpenFirstAction({})}
          aria-labelledby="dialog-title"
        >
          <DialogTitle id="dialog-title">{"Confirmação"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Voce será direcionado e pode perder a ação que está executando no
              momento. Deseja continuar?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => setChatToOpenFirstAction({})}
              color="primary"
            >
              Não
            </Button>
            <Button
              onClick={() => {
                const encodedData = encodeChatData(
                  chatToOpenFirstAction,
                  chatInitConfig.userkeycloakId
                );
                window.open(
                  `${chatToOpenFirstAction.actions[0].path}?data=${encodedData}`,
                  "_self"
                );
              }}
              color="primary"
              autoFocus
            >
              Sim
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};
