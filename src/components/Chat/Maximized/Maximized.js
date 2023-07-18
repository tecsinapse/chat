import React, { useCallback, useState } from 'react';
import { MessageList } from '@livechat/ui-kit';

import { useTheme } from '@material-ui/styles';

import { useDropzone } from 'react-dropzone';
import { ChatHeader } from './ChatHeader/ChatHeader';
import { InputComposer } from './InputComposer/InputComposer';
import { CHAT_LOCATIONS } from '../constants';
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
  composerBlockedMessageTitle,
  composerBlockedMessage,
  composerStyle,
  chatList,
  onBackToChatList,
  location,
  setLocation,
  onSelectedChat,
  notificationNumber,
  disabledSend,
  chatOptions,
  headerLabel,
  headerText,
  warningMessage,
  uploadOptions,
  backAction,
  onSendReactGAEvent,
  openDefaultMessages,
  onDefaultMessageSend,
  defaultMessage,
  setDefaultMessage,
}) => {
  const classes = useStyle();
  const theme = useTheme();
  const [droppedFiles, setDroppedFiles] = useState(null);

  const onBackward =
    backAction ||
    (location === CHAT_LOCATIONS.MESSAGES &&
      chatList !== undefined &&
      (() => {
        setLocation(CHAT_LOCATIONS.CHAT_LIST);
        onBackToChatList();
      }));

  const padding = location === CHAT_LOCATIONS.CHAT_LIST && 0;

  const onDrop = useCallback(acceptedFiles => {
    setDroppedFiles({ items: acceptedFiles });
  }, []);
  const { getRootProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    accept: ['image/*', 'video/*', 'application/*'],
    maxSize: maxFileUploadSize,
    maxFiles: uploadOptions?.maxFilesPerMessage,
    onDrop,
  });

  const dropZoneHeight = { height: '100%' };

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
        chatOptions={chatOptions}
        headerLabel={headerLabel}
        headerText={headerText}
        isBlocked={isBlocked}
        errorMessage={error}
        warningMessage={warningMessage}
        backAction={backAction}
        blockedMessage={blockedMessage}
      />
      <MessageList
        active
        onScrollTop={location === CHAT_LOCATIONS.MESSAGES && loadMore}
        style={{
          padding,
        }}
      >
        {location === CHAT_LOCATIONS.MESSAGES && (
          <div {...getRootProps()} style={dropZoneHeight}>
            <MessageView
              messages={messages}
              messagesEndRef={messagesEndRef}
              title={title}
              onMessageResend={onMessageResend}
              classes={classes}
              theme={theme}
              isLoading={isLoading}
            />
          </div>
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
          blockedMessageTitle={composerBlockedMessageTitle}
          blockedMessage={composerBlockedMessage}
          style={composerStyle}
          disabledSend={disabledSend}
          droppedFiles={droppedFiles}
          setDroppedFiles={setDroppedFiles}
          uploadOptions={uploadOptions}
          onSendReactGAEvent={onSendReactGAEvent}
          openDefaultMessages={openDefaultMessages}
          onDefaultMessageSend={onDefaultMessageSend}
          defaultMessage={defaultMessage}
          setDefaultMessage={setDefaultMessage}
        />
      )}
    </div>
  );
};

export default Maximized;
