import React, { useState } from 'react';
import { MessageList } from '@livechat/ui-kit';

import { makeStyles, useTheme } from '@material-ui/styles';
import { isStringNotBlank } from '@tecsinapse/es-utils/build/object';

import {
  defaultGrey2,
  defaultGreyLight5,
} from '@tecsinapse/ui-kit/build/colors';

import { ChatHeader } from './ChatHeader';
import { ErrorDialog } from './ErrorDialog';
import { InputComposer } from './InputComposer';
import { ChatLocations } from './ChatLocations';
import MessageView from './MessageView';
import { ChatList } from './ChatList';

const useStyle = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  at: {
    color: defaultGreyLight5,
  },
  authorName: {
    color: defaultGrey2,
  },
  bubbleTransparent: {
    border: 'unset',
    borderRadius: 'unset',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    boxShadow: 'unset',
  },
  audio: {
    display: 'flex',
    padding: '5px',
  },
  progress: {
    width: '20px !important',
    height: '20px !important',
    color: 'black',
  },
  imageError: {
    opacity: '0.4',
  },
  emptyBubble: {
    width: '75px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    maxWidth: '300px',
    maxHeight: '200px',
    border: '1px solid black',
  },
  errorDiv: {
    backgroundColor: theme.palette.error.main,
    color: 'white',
    zIndex: 2,
    padding: '4px',
    boxShadow: '0 1px 1px grey',
    border: `1px solid ${theme.palette.error.main}`,
    position: 'absolute',
    display: 'flex',
    left: 0,
    right: 0,
    margin: '6px',
    alignItems: 'center',
    borderRadius: '6px 6px 6px 6px',
  },
  errorDivIcon: {
    padding: '6px',
    display: 'flex',
  },
  errorDivText: {
    flexGrow: '2',
    display: 'flex',
    alignItems: 'center',
  },
  imageMessage: {
    maxHeight: '200px',
  },
  messageRootOwn: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  messageRootError: {
    marginRight: '-8px',
  },
  messageWithoutName: {
    marginTop: '0 !important',
  },
  messageWithoutDate: {
    marginBottom: '0 !important',
  },
  badgeNotification: {
    padding: 0,
  },
  contactListRoot: {
    padding: 0,
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
  channelAvatar: {
    width: '40px',
    height: '40px',
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
    fontSize: '1.25rem',
    alignItems: 'center',
    flexShrink: '0',
    lineHeight: '1',
    userSelect: 'none',
    justifyContent: 'center',
  },
}));

const Maximized = ({
  messages,
  onMessageSend,
  minimize,
  messagesEndRef,
  disabled,
  onAudio,
  hasCloseButton = true,
  title,
  subtitle,
  onCloseChat,
  error,
  onMediaSend,
  isLoading,
  loadMore,
  maxFileUploadSize,
  onMessageResend,
  isBlocked,
  blockedMessage,
  chatList,
  onBackToChatList,
  location,
  setLocation,
  onSelectedChat,
  notificationNumber,
}) => {
  const classes = useStyle();
  const theme = useTheme();
  const [showError, setShowError] = useState(true);

  const onBackward =
    location === ChatLocations.MESSAGES &&
    chatList !== undefined &&
    (() => {
      setLocation(ChatLocations.CHAT_LIST);
      onBackToChatList();
    });

  const padding = location === ChatLocations.CHAT_LIST && 0;

  return (
    <div className={classes.root}>
      <ChatHeader
        minimize={minimize}
        hasCloseButton={hasCloseButton}
        title={title}
        subtitle={subtitle}
        onCloseChat={onCloseChat}
        theme={theme}
        onBackward={onBackward}
        notificationNumber={notificationNumber}
        classes={classes}
      />
      <MessageList
        active
        onScrollTop={location === ChatLocations.MESSAGES && loadMore}
        style={{
          padding,
        }}
      >
        {isStringNotBlank(error) && showError && (
          <ErrorDialog
            classes={classes}
            theme={theme}
            error={error}
            setShowError={setShowError}
          />
        )}

        {location === ChatLocations.MESSAGES && (
          <MessageView
            messages={messages}
            messagesEndRef={messagesEndRef}
            title={title}
            onMessageResend={onMessageResend}
            classes={classes}
            theme={theme}
            isLoading={isLoading}
          />
        )}
        {location === ChatLocations.CHAT_LIST && (
          <ChatList
            chatList={chatList}
            onSelectedChat={onSelectedChat}
            setLocation={setLocation}
            classes={classes}
            isLoading={isLoading}
          />
        )}
      </MessageList>

      {!disabled && location === ChatLocations.MESSAGES && (
        <InputComposer
          onMessageSend={onMessageSend}
          onAudio={onAudio}
          onMediaSend={onMediaSend}
          maxFileUploadSize={maxFileUploadSize}
          isBlocked={isBlocked}
          blockedMessage={blockedMessage}
        />
      )}
    </div>
  );
};

export default Maximized;