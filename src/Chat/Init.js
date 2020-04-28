import React, {useRef, useState} from "react";
import {mdiArrowLeft, mdiChevronLeft, mdiChevronRight, mdiClose, mdiForum} from "@mdi/js";
import Icon from "@mdi/react";
import {Divider, FloatingButton} from "@tecsinapse/ui-kit";
import {makeStyles, useTheme} from "@material-ui/styles";
import {Badge, CircularProgress, Drawer, Grid, Typography} from "@material-ui/core";
import {completeChatInfoWith, load} from "./loadChatsInfos";
import SockJsClient from "react-stomp";
import {ComponentLocations} from "./ComponentLocations";
import {UnreadChats} from "./UnreadChats";
import {RenderChat} from "./RenderChat";

const useStyle = makeStyles(theme => ({
  fabContainer: {
    position: "fixed",
    right: 0,
    bottom: theme.spacing(2)
  },
  fab: {
    borderRadius: "50% 0 0 50%"
  },
  fabProgress: {
    color: theme.palette.secondary.dark
  },
  drawerContainer: {
    margin: theme.spacing(2, 0, 2),
    overflowX: "hidden",
    width: theme.spacing(40)
  },
  drawerHeader: {
    margin: theme.spacing(0, 2, 2, 2)
  },
  messageManagementLinkContainer: {
    padding: theme.spacing(1, 2),
    cursor: "pointer",
    '&:hover': {
      backgroundColor: theme.palette.grey['300']
    }
  }
}));

export const Init = ({
                       userkeycloakId,
                       chatApiUrl,
                       getInitialStatePath
                     }) => {

  const classes = useStyle();
  const theme = useTheme();
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true);
  const [view, setView] = useState(ComponentLocations.UNREAD);
  const [componentInfo, setComponentInfo] = useState({});
  const [currentChat, setCurrentChat] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  React.useEffect(() => {
    load(chatApiUrl, getInitialStatePath).then(info => {
      setComponentInfo(info);
      setIsLoadingInitialState(false);
      if (info.currentClient && Object.keys(info.currentClient).length > 0) {
        // quando a visualização é de um cliente específico, então define as informações
        // desse cliente como currentChat e exibe o chat direto
        setView(ComponentLocations.CHAT);
        const chats = info.allChats
          .filter(chat => info.currentClient.clientChatIds.includes(chat.chatId));
        setCurrentChat({
          name: info.currentClient.clientName,
          connectionKey: info.connectionKey,
          disabled: info.currentClient.disabled,
          chats: chats
        });
      }
    });
  }, [
    chatApiUrl,
    getInitialStatePath,
    setComponentInfo,
    setView,
    setIsLoadingInitialState
  ]);

  let mainSocketClientRef = useRef();
  const chatIds = (componentInfo.allChats || []).map(chat => chat.chatId).join(",");
  const connectionKey = componentInfo.connectionKey;
  let unreadTotal = (componentInfo.allChats || []).reduce((acc, chat) => acc + chat.unread, 0);

  const onConnectMainSocket = () => {
    mainSocketClientRef.sendMessage(
      `/chat/addUser/main/${connectionKey}/${userkeycloakId}`,
      JSON.stringify({chatIds: chatIds}) // informação dos chats que esse usuário está acompanhando
    );
  };

  const handleNewMainWebsocketMessage = updatedChatInfo => {
    let chatsToUpdate = [];
    let newChat = true;
    const toUpdateInfo = {...componentInfo};
    componentInfo.allChats.forEach(chat => {
      if (chat.chatId === updatedChatInfo.chatId) {
        updatedChatInfo = completeChatInfoWith(chat, updatedChatInfo);

        chatsToUpdate.push(updatedChatInfo);
        newChat = false;
      } else {
        chatsToUpdate.push(chat);
      }
    });
    if (newChat) {
      chatsToUpdate.push(updatedChatInfo);
    }
    toUpdateInfo.allChats = chatsToUpdate;
    setComponentInfo(toUpdateInfo);
  };

  const onSelectChat = (chat) => {
    setCurrentChat({
      name: chat.name,
      connectionKey: componentInfo.connectionKey,
      disabled: false,
      chats: [chat]
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
            horizontal: "left"
          }}
        >
          <FloatingButton
            className={classes.fab}
            onClick={() => setIsDrawerOpen(true)}
            variant="secondary"
            size="small"
          >
            {isLoadingInitialState ? (
              <CircularProgress size={20} className={classes.fabProgress}/>
            ) : (
              <Icon
                path={mdiChevronLeft}
                size={1.25}
                color={theme.palette.secondary.dark}
              />
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
                  {view === ComponentLocations.CHAT &&
                  <Grid item style={{marginRight: theme.spacing(1)}}>
                    <Icon
                      onClick={() => {
                      }}
                      color={theme.palette.primary.main}
                      size={1.25}
                      style={{cursor: 'pointer'}}
                      path={mdiArrowLeft}
                    />
                  </Grid>
                  }
                  <Grid item>
                    <Typography variant="h5" color="primary">
                      {view === ComponentLocations.CHAT ? 'Mensagens do Chat' : 'Painel do Chat'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Icon
                  onClick={() => setIsDrawerOpen(false)}
                  color={theme.palette.primary.main}
                  size={1.25}
                  style={{cursor: 'pointer'}}
                  path={mdiClose}
                />
              </Grid>
            </Grid>
          </div>
          <Divider variant="inset" component="li"/>

          <div className={classes.messageManagementLinkContainer}>
            <Grid container justify="space-between">
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item>
                    <Icon path={mdiForum} size={0.75} color={theme.palette.text.primary}
                          style={{marginTop: '3px'}}/>
                  </Grid>
                  <Grid item>
                    <Typography color="textPrimary" variant="body1" display="inline" style={{fontWeight: "bold"}}>
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
                  style={{cursor: 'pointer'}}
                  path={mdiChevronRight}
                />
              </Grid>
            </Grid>
          </div>
          <Divider variant="inset" component="li"/>

          {view === ComponentLocations.UNREAD && (
            <UnreadChats
              chats={componentInfo.allChats}
              onSelectChat={onSelectChat}
            />
          )}
          {view === ComponentLocations.CHAT && (
            <RenderChat
              initialInfo={currentChat}
              chatApiUrl={chatApiUrl}
            />
          )}
        </div>
      </Drawer>

      {!isLoadingInitialState && (
        <SockJsClient
          url={`${chatApiUrl}/ws`}
          topics={[`/topic/main.${userkeycloakId}`]}
          onMessage={handleNewMainWebsocketMessage}
          onConnect={onConnectMainSocket}
          ref={client => (mainSocketClientRef = client)}
        />
      )}
    </div>
  );
};
