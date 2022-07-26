import React from "react";
import { useTheme } from "@material-ui/styles";
import { mdiMessageText } from "@mdi/js";
import Icon from "@mdi/react";
import { Divider } from "@tecsinapse/ui-kit";
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { format } from "../../utils/dates";
import { useStyle } from "./styles";

export const UnreadChats = ({ chats, onSelectChat, mobile }) => {
  const classes = useStyle();
  const theme = useTheme();

  let unreadTotal = 0;
  const chatWithUnreadMessages = [];

  // verificar se função tem o mesmmo retorno de getUnreadTotal
  chats.forEach((chat) => {
    if (chat.unread > 0 && !chat.archived) {
      unreadTotal += chat.unread;
      chatWithUnreadMessages.push(chat);
    }
  });

  const listPadding = { paddingTop: 0, paddingBottom: 0 };
  const textIconMargin = { marginTop: "3px" };
  const unreadFontWeight = { fontWeight: "bold" };
  const dividerMargin = { marginLeft: 0 };
  const unreadGridHeight = { height: "100%" };

  const lastDividerMargin = { marginLeft: 0 };

  return (
    <>
      <div style={{ marginBottom: mobile ? 65 : 0 }}>
        <div className={classes.root}>
          <div className={classes.header}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Icon
                      path={mdiMessageText}
                      size={0.95}
                      color={theme.palette.text.secondary}
                      style={textIconMargin}
                    />
                  </Grid>
                  <Grid item>
                    <Typography
                      color="textSecondary"
                      variant="body1"
                      display="inline"
                      style={unreadFontWeight}
                    >
                      {unreadTotal} Mensagens não lidas
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
          {unreadTotal > 0 && <Divider variant="solid" style={dividerMargin} />}
          <List component="nav" style={listPadding}>
            {chatWithUnreadMessages.map((chat) => (
              <div key={chat.chatId} className={classes.border}>
                <ListItem
                  button
                  key={chat.chatId}
                  onClick={() => onSelectChat(chat)}
                >
                  <ListItemText
                    primary={
                      <Grid container justify="space-between" spacing={5}>
                        <Grid item>
                          <Typography noWrap className={classes.itemText1}>
                            {chat.name}
                          </Typography>

                          <Typography noWrap className={classes.itemText2}>
                            {chat.phone}
                          </Typography>

                          <Typography
                            noWrap
                            color="textSecondary"
                            className={classes.itemText3}
                          >
                            {format(chat.lastMessageAt)}
                          </Typography>

                          <Typography noWrap className={classes.itemText4}>
                            {chat.lastMessage}
                          </Typography>
                        </Grid>
                        {chat.unread !== undefined && chat.unread > 0 && (
                          <Grid item>
                            <Grid
                              style={unreadGridHeight}
                              container
                              align="center"
                              justify="center"
                              direction="column"
                            >
                              <Grid item>
                                <div
                                  className={classes.contactListNotification}
                                >
                                  <Typography
                                    className={classes.notificationBadgeText}
                                  >
                                    {chat.unread}
                                  </Typography>
                                </div>
                              </Grid>
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    }
                  />
                </ListItem>
              </div>
            ))}
          </List>
        </div>
        <Divider variant="solid" style={lastDividerMargin} />
      </div>
    </>
  );
};
