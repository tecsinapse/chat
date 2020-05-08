import React, { useState } from 'react';
import { FixedWrapper } from '@livechat/ui-kit';
import PropTypes from 'prop-types';
import { useTheme } from '@material-ui/styles';

import Maximized from './Maximized';
import Minimized from './Minimized';
import ChatTheme from './ChatTheme';
import { ChatLocations } from './ChatLocations';

export const Chat = ({
  messages,
  onMessageSend,
  messagesEndRef,
  disabled,
  isMaximizedOnly,
  onAudio,
  title,
  subtitle,
  onCloseChat,
  error,
  onMediaSend,
  notifyNumber,
  isLoading,
  loadMore,
  maxFileUploadSize,
  onMessageResend,
  isBlocked,
  blockedMessage,
  roundedCorners,
  chatList,
  onBackToChatList,
  onSelectedChat,
  notificationNumber,
  containerHeight,
  chatOptions,
  customHeader,
  warningMessage,
}) => {
  const theme = useTheme();
  const [location, setLocation] = useState(
    chatList ? ChatLocations.CHAT_LIST : ChatLocations.MESSAGES
  );
  const { headerBackground, headerText, headerLabel } = customHeader;

  return (
    <div>
      <ChatTheme
        materialTheme={theme}
        roundedCorners={roundedCorners}
        containerHeight={containerHeight}
        headerBackground={headerBackground}
      >
        <div>
          <FixedWrapper.Root maximizedOnInit={isMaximizedOnly}>
            <FixedWrapper.Maximized>
              <Maximized
                messages={messages}
                onMessageSend={onMessageSend}
                messagesEndRef={messagesEndRef}
                onAudio={onAudio}
                disabled={disabled}
                isMaximizedOnly={isMaximizedOnly}
                hasCloseButton={!isMaximizedOnly}
                title={title}
                subtitle={subtitle}
                onCloseChat={onCloseChat}
                error={error}
                onMediaSend={onMediaSend}
                isLoading={isLoading}
                loadMore={loadMore}
                maxFileUploadSize={maxFileUploadSize}
                onMessageResend={onMessageResend}
                isBlocked={isBlocked}
                blockedMessage={blockedMessage}
                chatList={chatList}
                onBackToChatList={onBackToChatList}
                location={location}
                setLocation={setLocation}
                onSelectedChat={onSelectedChat}
                notificationNumber={notificationNumber}
                chatOptions={chatOptions}
                headerLabel={headerLabel}
                headerText={headerText}
                warningMessage={warningMessage}
              />
            </FixedWrapper.Maximized>

            <FixedWrapper.Minimized>
              {!isMaximizedOnly && <Minimized notifyNumber={notifyNumber} />}
            </FixedWrapper.Minimized>
          </FixedWrapper.Root>
        </div>
      </ChatTheme>
    </div>
  );
};

Chat.defaultProps = {
  onAudio: undefined,
  disabled: false,
  isMaximizedOnly: false,
  title: '',
  subtitle: '',
  onCloseChat: undefined,
  error: undefined,
  onMediaSend: undefined,
  notifyNumber: 0,
  isLoading: false,
  loadMore: undefined,
  maxFileUploadSize: 20971520, // 20 MB
  onMessageResend: undefined,
  isBlocked: undefined,
  blockedMessage: 'The chat is blocked',
  chatList: undefined,
  onBackToChatList: undefined,
  onSelectedChat: undefined,
  notificationNumber: 0,
  chatOptions: {
    show: false,
    color: '#fff',
    handleFunc: () => {},
  },
  customHeader: {
    headerLabel: undefined,
    headerBackground: undefined,
    headerText: undefined,
  },
  warningMessage: undefined,
  roundedCorners: true,
  containerHeight: '500px',
};

Chat.propTypes = {
  /** Messages array */
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      localId: PropTypes.string,
      at: PropTypes.string,
      own: PropTypes.bool,
      id: PropTypes.string,
      text: PropTypes.string,
      title: PropTypes.string,
      authorName: PropTypes.string,
      medias: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string,
          mediaType: PropTypes.oneOf([
            'image',
            'video',
            'audio',
            'application',
          ]),
          name: PropTypes.string,
          size: PropTypes.number,
          data: PropTypes.object,
        })
      ),
      status: PropTypes.oneOf(['sending', 'error', 'delivered']),
    })
  ).isRequired,
  /** Message sender */
  onMessageSend: PropTypes.func.isRequired,
  /** Message resend */
  onMessageResend: PropTypes.func,
  /** onAudio is not required, when it is not informed the chat doesn't support audio */
  onAudio: PropTypes.func,
  /** Event handler closing the chat */
  onCloseChat: PropTypes.func,
  /** onMedia is not required, when it is not informed the chat doesn't support media */
  onMediaSend: PropTypes.func,
  /** Disable the chat */
  disabled: PropTypes.bool,
  /** Chat stays maximized */
  isMaximizedOnly: PropTypes.bool,
  /** Chat title */
  title: PropTypes.string,
  /** Chat subtitle */
  subtitle: PropTypes.string,
  /** Display error message */
  error: PropTypes.string,
  /** Number of notifications */
  notifyNumber: PropTypes.number,
  /** Loading state */
  isLoading: PropTypes.bool,
  /** Loader when more content is requested */
  loadMore: PropTypes.func,
  /** Max file size upload */
  maxFileUploadSize: PropTypes.number,
  /** Chat blocked state */
  isBlocked: PropTypes.bool,
  /** Message displayed when chat is blocked */
  blockedMessage: PropTypes.string,
  /** Callback called after the ChatList view is rendered */
  onBackToChatList: PropTypes.func,
  /** ChatList with recipients */
  chatList: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      phone: PropTypes.string,
      lastMessage: PropTypes.string,
      unread: PropTypes.number,
      type: PropTypes.oneOf([
        'WHATSAPP',
        'TELEGRAM',
        'SKYPE',
        // TODO: Add other channels
      ]),
      chatId: PropTypes.string,
    })
  ),
  /** Action performed when chat is selected */
  onSelectedChat: PropTypes.func,
  /** Number of notification */
  notificationNumber: PropTypes.number,
  /** Disable default rounded corners of divs */
  roundedCorners: PropTypes.bool,
  /** Message Chat Container height */
  containerHeight: PropTypes.string,
  /** Show vertical dots on chat window for options */
  chatOptions: PropTypes.shape({
    show: PropTypes.bool,
    color: PropTypes.string,
    handleFunc: PropTypes.func,
  }),
  /** Change header label (text), background color and text color */
  customHeader: PropTypes.shape({
    headerLabel: PropTypes.string,
    headerBackground: PropTypes.string,
    headerText: PropTypes.string,
  }),
  /** Display a message in warning format */
  warningMessage: PropTypes.string,
};

export default Chat;
