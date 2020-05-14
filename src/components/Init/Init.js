import React, { useEffect, useState } from "react";
import { mdiArrowLeft, mdiChevronRight, mdiClose, mdiForum } from "@mdi/js";
import Icon from "@mdi/react";
import { Divider } from "@tecsinapse/ui-kit";
import { makeStyles, useTheme } from "@material-ui/styles";
import { Badge, Drawer, Grid, Typography } from "@material-ui/core";
import { completeChatInfoWith, load } from "../../utils/loadChatsInfos";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { UnreadChats } from "../UnreadChats/UnreadChats";
import { RenderChat } from "../RenderChat/RenderChat";
import { InitWebsockets } from "./InitWebsockets";
import { MessageManagement } from "../MessageManagement/MessageManagement";
import { ChatButton } from "../ChatButton/ChatButton";

const useStyle = makeStyles((theme) => ({
  drawerContainer: {
    margin: theme.spacing(2, 0, 0, 0),
    height: "100%",
    overflowX: "hidden",
    maxWidth: "80vw",
    minWidth: "35vw",
    /* TODO verificar uma forma melhor */
    /* Limpando estilos do Bootstrap para os inputs */
    "& input": {
      border: "0 !important",
      margin: 0,
      paddingTop: "10.5px",
      paddingBottom: "10.5px",
    },
    "& input:focus": {
      border: '0 !important',
      borderColor: '#fff',
      boxShadow: 'none'
    },
    "& textarea": {
      border: '0 !important',
      margin: 0,
      paddingTop: '10.5px',
      paddingBottom: '10.5px'
    },
    "& textarea:focus": {
      border: '0 !important',
      borderColor: '#fff',
      boxShadow: 'none'
    }
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
}));

async function loadComponent(
  chatApiUrl,
  getInitialStatePath,
  setComponentInfo,
  setIsLoadingInitialState,
  setView,
  setCurrentChat
) {
  const info = await load(chatApiUrl, getInitialStatePath);
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
      connectionKey: info.connectionKey,
      disabled: info.currentClient.disabled,
      chats: chats,
    });
  }
}

export const Init = ({
  userkeycloakId,
  chatApiUrl,
  getInitialStatePath,
  openWhenLoad = false,
}) => {
  const classes = useStyle();
  const theme = useTheme();
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true);
  const [view, setView] = useState(COMPONENT_LOCATION.UNREAD);
  const [componentInfo, setComponentInfo] = useState({});
  const [currentChat, setCurrentChat] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadComponent(
      chatApiUrl,
      getInitialStatePath,
      setComponentInfo,
      setIsLoadingInitialState,
      setView,
      setCurrentChat
    ).then(() => {
      if (openWhenLoad) {
        setIsDrawerOpen(true);
      }
    });
  }, [
    chatApiUrl,
    getInitialStatePath,
    setComponentInfo,
    setView,
    setIsLoadingInitialState,
    openWhenLoad,
  ]);

  const reloadComponent = () => {
    loadComponent(
      chatApiUrl,
      getInitialStatePath,
      setComponentInfo,
      setIsLoadingInitialState,
      setView,
      setCurrentChat
    ).then(() => {});
  };

  const chatIds = (componentInfo.allChats || [])
    .map((chat) => chat.chatId)
    .join(",");
  const connectionKey = componentInfo.connectionKey;
  let unreadTotal = (componentInfo.allChats || []).reduce(
    (acc, chat) => acc + chat.unread,
    0
  );

  const onChatUpdated = (updatedChat) => {
    let chatsToUpdate = [];
    let newChat = true;
    const toUpdateInfo = { ...componentInfo };
    componentInfo.allChats.forEach((chat) => {
      if (chat.chatId === updatedChat.chatId) {
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

  const onSelectChat = (chat) => {
    setCurrentChat({
      name: chat.name,
      connectionKey: componentInfo.connectionKey,
      disabled: false,
      chats: [chat],
    });
    setView(COMPONENT_LOCATION.CHAT);
  };

  return (
    <div className="Chat">
      <ChatButton
        isLoadingInitialState={isLoadingInitialState}
        setIsDrawerOpen={setIsDrawerOpen}
        unreadTotal={unreadTotal}
      />
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
                  {(view === COMPONENT_LOCATION.CHAT ||
                    view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT) && (
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
                          onClick={() => setView(COMPONENT_LOCATION.UNREAD)}
                          color={theme.palette.primary.main}
                          size={1.25}
                          style={{ cursor: "pointer", marginLeft: "-8px" }}
                          path={mdiArrowLeft}
                        />
                      </Badge>
                    </Grid>
                  )}
                  <Grid item>
                    <Typography variant="h5" color="textPrimary">
                      {view === COMPONENT_LOCATION.CHAT &&
                        "Mensagens do RenderChat"}
                      {view === COMPONENT_LOCATION.UNREAD &&
                        "Painel do RenderChat"}
                      {view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT &&
                        "Gestão de Mensagens"}
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

          {view !== COMPONENT_LOCATION.MESSAGE_MANAGEMENT && (
            <div
              className={classes.messageManagementLinkContainer}
              onClick={() => setView(COMPONENT_LOCATION.MESSAGE_MANAGEMENT)}
            >
              <Grid container justify="space-between">
                <Grid item>
                  <Grid container spacing={1}>
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
              onSelectChat={onSelectChat}
            />
          )}
          {view === COMPONENT_LOCATION.CHAT && (
            <RenderChat
              initialInfo={currentChat}
              chatApiUrl={chatApiUrl}
              userkeycloakId={userkeycloakId}
            />
          )}
          {view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT && (
            <MessageManagement
              componentInfo={componentInfo}
              onSelectChat={onSelectChat}
              userkeycloakId={userkeycloakId}
            />
          )}
        </div>
      </Drawer>

      {!isLoadingInitialState && (
        <InitWebsockets
          chatApiUrl={chatApiUrl}
          userkeycloakId={userkeycloakId}
          chatIds={chatIds}
          connectionKey={connectionKey}
          onChatUpdated={onChatUpdated}
          reloadComponent={reloadComponent}
        />
      )}
    </div>
  );
};
