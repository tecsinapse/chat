import React from 'react';
import { Row, Subtitle, Column } from '@livechat/ui-kit';

import {
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@material-ui/core';
import { ChatLocations } from './ChatLocations';
import Whatsapp from '../assets/whatsapp.svg';
import Telegram from '../assets/telegram.svg';
import Skype from '../assets/skype.svg';

export const ChatList = ({
  chatList,
  onSelectedChat,
  setLocation,
  classes,
}) => {
  return (
    <List component="nav" className={classes.contactListRoot}>
      {chatList.map((chatClient, id) => (
        <>
          <ListItem
            button
            key={chatClient.chatId}
            onClick={() => {
              setLocation(ChatLocations.MESSAGES);
              onSelectedChat(chatClient);
            }}
          >
            <ListItemAvatar>
              {chatClient.type === 'WHATSAPP' && (
                <Whatsapp className={classes.channelAvatar} />
              )}
              {chatClient.type === 'TELEGRAM' && (
                <Telegram className={classes.channelAvatar} />
              )}
              {chatClient.type === 'SKYPE' && (
                <Skype className={classes.channelAvatar} />
              )}
            </ListItemAvatar>

            <ListItemText
              primary={
                <Row justify className={classes.contactListName}>
                  <Column>
                    <Typography noWrap variant="subtitle2">
                      {chatClient.name}
                    </Typography>

                    <Typography noWrap variant="caption" color="textSecondary">
                      {chatClient.phone}
                    </Typography>
                  </Column>
                  <Subtitle nowrap>
                    <Typography noWrap variant="caption" color="textSecondary">
                      {chatClient.lastMessageAt}
                    </Typography>
                  </Subtitle>
                </Row>
              }
              secondary={
                <Subtitle nowrap>
                  <Row className={classes.contactListMessage}>
                    <Typography
                      color="textPrimary"
                      variant="body2"
                      noWrap
                      style={{
                        paddingRight: '10px',
                      }}
                    >
                      {chatClient.lastMessage}
                    </Typography>

                    {chatClient.unread !== undefined && chatClient.unread > 0 && (
                      <div className={classes.contactListNotification}>
                        <Typography variant="caption">
                          {chatClient.unread}
                        </Typography>
                      </div>
                    )}
                  </Row>
                </Subtitle>
              }
            />
          </ListItem>
          <Divider variant="inset" component="li" />
        </>
      ))}
    </List>
  );
};
