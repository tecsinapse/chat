import React, {useState} from "react";
import {mdiArrowLeft, mdiChevronLeft, mdiChevronRight, mdiClose, mdiForum,} from "@mdi/js";
import Icon from "@mdi/react";
import {Divider, FloatingButton} from "@tecsinapse/ui-kit";
import {makeStyles, useTheme} from "@material-ui/styles";
import {Badge, CircularProgress, Drawer, Grid, Typography,} from "@material-ui/core";
import {completeChatInfoWith, load} from "./loadChatsInfos";
import {ComponentLocations} from "./ComponentLocations";
import {UnreadChats} from "./UnreadChats";
import {RenderChat} from "./RenderChat";
import {InitWebsockets} from "./InitWebsockets";
import {MessageManagement} from "./MessageManagement";
import {defaultOrange} from "@tecsinapse/ui-kit/build/colors";

const useStyle = makeStyles((theme) => ({
  fabContainer: {
    position: "fixed",
    right: 0,
    bottom: theme.spacing(2),
  },
  badgeAlign: {
    top: "7px",
    left: "7px",
  },
  fab: {
    borderRadius: "24px 0 0 24px",
    padding: 0,
    width: "48px",
    backgroundColor: defaultOrange,
  },
  fabProgress: {
    color: theme.palette.secondary.dark,
  },
  drawerContainer: {
    margin: theme.spacing(2, 0, 0, 0),
    height: "100%",
    overflowX: "hidden",
    maxWidth: "80vw",
    minWidth: "35vw",
  },
  drawerHeader: {
    margin: theme.spacing(0, 2, 1.6, 2),
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
    setView(ComponentLocations.SPECIFIC_CHAT);
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
                       openWhenLoad = false
                     }) => {

  const classes = useStyle();
  const theme = useTheme();
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true);
  const [view, setView] = useState(ComponentLocations.UNREAD);
  const [componentInfo, setComponentInfo] = useState({});
  const [currentChat, setCurrentChat] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  React.useEffect(() => {
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
  ]);

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

  const onSelectChat = (chat) => {
    setCurrentChat({
      name: chat.name,
      connectionKey: componentInfo.connectionKey,
      disabled: false,
      chats: [chat],
    });
    setView(ComponentLocations.CHAT);
  };

  return (
    <div className="Chat">
      <div className={classes.fabContainer}>
        <Badge
          color="error"
          badgeContent={unreadTotal}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          classes={{
            anchorOriginTopLeftRectangle: classes.badgeAlign,
          }}
        >
          <FloatingButton
            onClick={() => {
              if (!isLoadingInitialState) {
                setIsDrawerOpen(true);
              }
            }}
            variant="secondary"
            className={classes.fab}
          >
            {isLoadingInitialState ? (
              <CircularProgress size={20} className={classes.fabProgress} />
            ) : (
              <Icon path={mdiChevronLeft} size={1.25} color="#7b4e00" />
            )}
          </FloatingButton>
        </Badge>
      </div>

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
                  {(view === ComponentLocations.CHAT ||
                    view === ComponentLocations.MESSAGE_MANAGEMENT) && (
                    <Grid item style={{ marginRight: theme.spacing(1) }}>
                      <Badge
                        color="error"
                        overlap={"circle"}
                        variant={"dot"}
                        badgeContent={unreadTotal}
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                      >
                        <Icon
                          onClick={() => setView(ComponentLocations.UNREAD)}
                          color={theme.palette.primary.main}
                          size={1.25}
                          style={{ cursor: "pointer" }}
                          path={mdiArrowLeft}
                        />
                      </Badge>
                    </Grid>
                  )}
                  <Grid item>
                    <Typography variant="h5" color="textPrimary">
                      {(view === ComponentLocations.CHAT ||
                        view === ComponentLocations.SPECIFIC_CHAT) &&
                        "Mensagens do Chat"}
                      {view === ComponentLocations.UNREAD && "Painel do Chat"}
                      {view === ComponentLocations.MESSAGE_MANAGEMENT &&
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

          {view !== ComponentLocations.MESSAGE_MANAGEMENT &&
            view !== ComponentLocations.SPECIFIC_CHAT && (
              <div
                className={classes.messageManagementLinkContainer}
                onClick={() => setView(ComponentLocations.MESSAGE_MANAGEMENT)}
              >
                <Grid container justify="space-between">
                  <Grid item>
                    <Grid container spacing={1}>
                      <Grid item>
                        <Icon
                          path={mdiForum}
                          size={0.8}
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
                      onClick={() => setIsDrawerOpen(false)}
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

          {view === ComponentLocations.UNREAD && (
            <UnreadChats
              chats={componentInfo.allChats}
              onSelectChat={onSelectChat}
            />
          )}
          {(view === ComponentLocations.CHAT ||
            view === ComponentLocations.SPECIFIC_CHAT) && (
            <RenderChat initialInfo={currentChat} chatApiUrl={chatApiUrl} />
          )}
          {view === ComponentLocations.MESSAGE_MANAGEMENT && (
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
