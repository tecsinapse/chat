import React from "react";
import {makeStyles, useTheme} from "@material-ui/styles";
import {mdiMessageText} from "@mdi/js";
import Icon from "@mdi/react";
import moment from "moment";
import {Divider} from "@tecsinapse/ui-kit";
import {Grid, List, ListItem, ListItemText, Typography,} from '@material-ui/core';

const useStyle = makeStyles(theme => ({
  root: {
    padding: theme.spacing(0, 0, 2, 2),
    backgroundColor: theme.palette.grey[100]
  },
  header: {
    padding: theme.spacing(1, 0)
  },
  contactListName: {
    paddingBottom: '5px',
  },
  contactListMessage: {
    justifyContent: 'space-between',
  },
  contactListNotification: {
    height: '20px',
    width: '20px',
    borderRadius: '10px',
    backgroundColor: 'red',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    flexShrink: 0,
  },
  itemText1: {
    textTransform: "uppercase",
    fontWeight: "bold"
  },
  itemText2: {
    fontWeight: "bold",
    fontSize: theme.typography.fontSize - 1
  },
  itemText3: {
    fontWeight: "bold",
    fontSize: theme.typography.fontSize - 3
  },
  itemText4: {
    fontSize: theme.typography.fontSize - 1,
    marginTop: theme.spacing(1),
    maxWidth: theme.spacing(28)
  }
}));

export const UnreadChats = ({
                              chats,
                              onSelectChat
                            }) => {
  const classes = useStyle();
  const theme = useTheme();

  let unreadTotal = 0;
  const chatWithUnreadMessages = [];
  chats.forEach(chat => {
    if (chat.unread > 0) {
      unreadTotal += chat.unread;
      chatWithUnreadMessages.push(chat);
    }
  });
  chatWithUnreadMessages.sort((a, b) => moment(a.lastMessageAt).unix() - moment(b.lastMessageAt).unix());

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Grid container justify="space-between">
          <Grid item>
            <Grid container spacing={1}>
              <Grid item>
                <Icon path={mdiMessageText} size={0.75} color={theme.palette.text.secondary}
                      style={{marginTop: '3px'}}/>
              </Grid>
              <Grid item>
                <Typography color="textSecondary" variant="body1" display="inline" style={{fontWeight: "bold"}}>
                  {unreadTotal} Mensagens não lidas
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Divider variant="inset" component="li" style={{marginLeft: 0}}/>
      <List component="nav">
        {chatWithUnreadMessages.map((chat, id) => (
          <React.Fragment key={chat.chatId}>
            <ListItem
              button
              key={chat.chatId}
              onClick={() => onSelectChat(chat)}
            >
              <ListItemText
                primary={
                  <Grid container justify="space-between" spacing={5}>
                    <Grid item>
                      <Typography noWrap variant="body1" className={classes.itemText1}>
                        {chat.name}
                      </Typography>

                      <Typography
                        noWrap
                        variant="body2"
                        className={classes.itemText2}>
                        {chat.phone}
                      </Typography>

                      <Typography
                        noWrap
                        variant="body2"
                        color="textSecondary"
                        className={classes.itemText3}>
                        {chat.lastMessageAt}
                      </Typography>

                      <Typography
                        variant="body2"
                        noWrap
                        className={classes.itemText4}>
                        {chat.lastMessage}
                      </Typography>
                    </Grid>
                    {chat.unread !== undefined && chat.unread > 0 && (
                      <Grid item>
                        <Grid style={{height: "100%"}}
                              container align="center"
                              justify="center"
                              direction="column">
                          <Grid item>
                            <div className={classes.contactListNotification}>
                              <Typography variant="caption">
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
            <Divider variant="inset" component="li" style={{marginLeft: 0}}/>
          </React.Fragment>
        ))}
      </List>
    </div>
  );
};
