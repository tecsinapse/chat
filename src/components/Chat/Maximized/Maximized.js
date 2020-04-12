import React, { useState } from 'react';
import { MessageList } from '@livechat/ui-kit';

import { useTheme } from '@material-ui/styles';
import { isStringNotBlank } from '@tecsinapse/es-utils/build/object';

import { ChatHeader } from './ChatHeader/ChatHeader';
import { ErrorDialog } from './ErrorDialog/ErrorDialog';
import { InputComposer } from './InputComposer/InputComposer';
import { CHAT_LOCATIONS } from '../constants/CHAT_LOCATIONS';
import MessageView from './MessageView/MessageView';
import { ChatList } from './ChatList/ChatList';
import { useStyle } from './maximizedStyles';

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
  disabledSend,
}) => {
  const classes = useStyle();
  const theme = useTheme();
  const [showError, setShowError] = useState(true);

  const onBackward =
    location === CHAT_LOCATIONS.MESSAGES &&
    chatList !== undefined &&
    (() => {
      setLocation(CHAT_LOCATIONS.CHAT_LIST);
      onBackToChatList();
    });

  const padding = location === CHAT_LOCATIONS.CHAT_LIST && 0;

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
        onScrollTop={location === CHAT_LOCATIONS.MESSAGES && loadMore}
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

        {location === CHAT_LOCATIONS.MESSAGES && (
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
        {location === CHAT_LOCATIONS.CHAT_LIST && (
          <ChatList
            chatList={chatList}
            onSelectedChat={onSelectedChat}
            setLocation={setLocation}
            classes={classes}
            isLoading={isLoading}
          />
        )}
      </MessageList>

      {!disabled && location === CHAT_LOCATIONS.MESSAGES && (
        <InputComposer
          onMessageSend={onMessageSend}
          onAudio={onAudio}
          onMediaSend={onMediaSend}
          maxFileUploadSize={maxFileUploadSize}
          isBlocked={isBlocked}
          blockedMessage={blockedMessage}
          disabledSend={disabledSend}
        />
      )}
    </div>
  );
};

export default Maximized;
