import React, { useRef, useState } from "react";
import { mdiChevronLeft, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { Divider, FloatingButton } from "@tecsinapse/ui-kit";
import { makeStyles, useTheme } from "@material-ui/styles";
import {
  Badge,
  CircularProgress,
  Drawer,
  Grid,
  Typography
} from "@material-ui/core";
import { loadChatsInfos } from "./loadChatsInfos";
import SockJsClient from "react-stomp";

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
    margin: theme.spacing(2, 0, 2)
  },
  drawerHeader: {
    margin: theme.spacing(0, 2, 2, 2)
  }
}));

export const Init = ({
  componentId,
  reloadInitialState,
  chatApiUrl,
  initialInfo,
  disabled
}) => {
  const classes = useStyle();
  const theme = useTheme();
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true);
  const [chats, setChats] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  React.useEffect(() => {
    if (reloadInitialState) {
      loadChatsInfos(initialInfo, chatApiUrl).then(chats => {
        setChats(chats);
        setIsLoadingInitialState(false);
      });
    } else {
      setIsLoadingInitialState(false);
    }
  }, [
    chatApiUrl,
    initialInfo,
    reloadInitialState,
    setChats,
    setIsLoadingInitialState
  ]);

  let mainSocketClientRef = useRef();
  const chatIds = initialInfo.chats.map(chat => chat.chatId).join(",");
  const connectionKey = initialInfo.connectionKey;
  const unreadTotal = chats.reduce((acc, chat) => acc + chat.unread, 0);

  const onConnectMainSocket = () => {
    mainSocketClientRef.sendMessage(
      `/chat/addUser/main/${connectionKey}/${componentId}`,
      JSON.stringify({ chatIds: chatIds })
    );
  };

  const handleNewMainWebsocketMessage = updatedChatInfo => {
    let chatsToUpdate = [];
    chats.forEach(chat => {
      if (chat.chatId === updatedChatInfo.chatId) {
        chatsToUpdate.push(updatedChatInfo);
      } else {
        chatsToUpdate.push(chat);
      }
    });

    setChats(chatsToUpdate);
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
              <CircularProgress size={20} className={classes.fabProgress} />
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
                <Typography variant="h5" color="primary">
                  Painel do Chat
                </Typography>
              </Grid>
              <Grid item>
                <Icon
                  color={theme.palette.primary.main}
                  size={1.25}
                  path={mdiClose}
                />
              </Grid>
            </Grid>
          </div>
          <Divider variant="solid" />
        </div>
      </Drawer>

      {!isLoadingInitialState && (
        <SockJsClient
          url={`${chatApiUrl}/ws`}
          topics={[`/topic/main.${componentId}`]}
          onMessage={handleNewMainWebsocketMessage}
          onConnect={onConnectMainSocket}
          ref={client => (mainSocketClientRef = client)}
        />
      )}
    </div>
  );
};
