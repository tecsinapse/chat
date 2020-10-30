import React from 'react';
import { Column, Row, Subtitle } from '@livechat/ui-kit';

import {
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { CHAT_LOCATIONS } from '../../constants';
import Whatsapp from '../../../../../assets/whatsapp.svg';
import Telegram from '../../../../../assets/telegram.svg';
import Skype from '../../../../../assets/skype.svg';
import { Loading } from '../../Loading/Loading';

const style = {
  paddingRight: '10px',
};

export const ChatList = ({
  chatList,
  onSelectedChat,
  setLocation,
  classes,
  isLoading,
}) => (
  <>
    {isLoading && <Loading />}
    <List component="nav" className={classes.contactListRoot}>
      {chatList.map((chatClient, id) => (
        <>
          <ListItem
            button
            key={chatClient.chatId}
            onClick={() => {
              setLocation(CHAT_LOCATIONS.MESSAGES);
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
                      {(chatClient.subName ? `${chatClient.subName} - ` : '') +
                        (chatClient.phone ? chatClient.phone : '')}
                    </Typography>
                  </Column>
                  <Subtitle nowrap>
                    <Typography noWrap variant="caption" color="textSecondary">
                      {chatClient.lastMessageAtFormatted
                        ? chatClient.lastMessageAtFormatted
                        : chatClient.lastMessageAt}
                    </Typography>
                  </Subtitle>
                </Row>
              }
              secondary={
                <Row className={classes.contactListMessage}>
                  <Typography
                    color="textPrimary"
                    variant="body2"
                    noWrap
                    style={style}
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
              }
            />
          </ListItem>
          <Divider variant="inset" component="li" />
        </>
      ))}
    </List>
  </>
);
