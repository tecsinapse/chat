import React from "react";
import { makeStyles, useTheme } from "@material-ui/styles";
import { mdiMessageText } from "@mdi/js";
import Icon from "@mdi/react";
import moment from "moment";
import { Divider } from "@tecsinapse/ui-kit";
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";

const useStyle = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 0, 0, 2),
    backgroundColor: theme.palette.grey[100],
  },
  header: {
    padding: theme.spacing(1, 0),
  },
  contactListName: {
    paddingBottom: "5px",
  },
  contactListMessage: {
    justifyContent: "space-between",
  },
  contactListNotification: {
    height: "16px",
    width: "16px",
    borderRadius: "10px",
    backgroundColor: "#e12626",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    flexShrink: 0,
  },
  itemText1: {
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "14px",
    letterSpacing: "-0.1px",
  },
  itemText2: {
    textTransform: "capitalize",
    fontSize: "12px",
    fontWeight: "500",
    letterSpacing: "-0.3px",
  },
  itemText3: {
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: "10px",
    letterSpacing: "-0.1px",
    marginTop: "5px",
  },
  itemText4: {
    fontSize: "13px",
    letterSpacing: "-0.25px",
    marginTop: theme.spacing(3 / 4),
    maxWidth: theme.spacing(28),
  },
  notificationBadgeText: {
    fontWeight: 900,
    fontSize: "11px",
  },
  border: {
    borderBottom: "1px solid #ccc",
    "&:last-child": {
      borderBottom: "none",
    },
  },
}));

export const UnreadChats = ({ chats, onSelectChat }) => {
  const classes = useStyle();
  const theme = useTheme();

  let unreadTotal = 0;
  const chatWithUnreadMessages = [];
  chats.forEach((chat) => {
    if (chat.unread > 0) {
      unreadTotal += chat.unread;
      chatWithUnreadMessages.push(chat);
    }
  });
  chatWithUnreadMessages.sort(
    (a, b) => moment(a.lastMessageAt).unix() - moment(b.lastMessageAt).unix()
  );

  let listPadding = { paddingTop: 0, paddingBottom: 0 };
  return (
    <>
      <div className={classes.root}>
        <div className={classes.header}>
          <Grid container justify="space-between">
            <Grid item>
              <Grid container spacing={1}>
                <Grid item>
                  <Icon
                    path={mdiMessageText}
                    size={0.75}
                    color={theme.palette.text.secondary}
                    style={{ marginTop: "3px" }}
                  />
                </Grid>
                <Grid item>
                  <Typography
                    color="textSecondary"
                    variant="body1"
                    display="inline"
                    style={{ fontWeight: "bold" }}
                  >
                    {unreadTotal} Mensagens não lidas
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <Divider variant="inset" component="li" style={{ marginLeft: 0 }} />
        <List component="nav" style={listPadding}>
          {chatWithUnreadMessages.map((chat, id) => (
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
                          {chat.lastMessageAt}
                        </Typography>

                        <Typography noWrap className={classes.itemText4}>
                          {chat.lastMessage}
                        </Typography>
                      </Grid>
                      {chat.unread !== undefined && chat.unread > 0 && (
                        <Grid item>
                          <Grid
                            style={{ height: "100%" }}
                            container
                            align="center"
                            justify="center"
                            direction="column"
                          >
                            <Grid item>
                              <div className={classes.contactListNotification}>
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
      <Divider variant="inset" component="li" style={{ marginLeft: 0 }} />
    </>
  );
};
