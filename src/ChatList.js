import React from 'react';
import { Row, Subtitle, Column } from '@livechat/ui-kit';

import {
  Typography,
  List,
  ListItem,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@material-ui/core';
import { ChatLocations } from './ChatLocations';

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
              <Avatar src="https://imagepng.org/wp-content/uploads/2017/08/WhatsApp-icone.png" />
            </ListItemAvatar>

            <ListItemText
              primary={
                <Row justify className={classes.contactListName}>
                  <Column>
                    <Typography noWrap variant="subtitle2">
                      {chatClient.name}
                    </Typography>

                    <Typography noWrap variant="caption">
                      {chatClient.phone}
                    </Typography>
                  </Column>
                  <Subtitle nowrap>
                    <Typography noWrap variant="caption">
                      {chatClient.lastMessageAt}
                    </Typography>
                  </Subtitle>
                </Row>
              }
              secondary={
                <Subtitle nowrap>
                  <Row className={classes.contactListMessage}>
                    <Typography noWrap variant="body1">
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
