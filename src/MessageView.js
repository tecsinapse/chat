import React from 'react';
import { Message } from './Message';
import { Loading } from './Loading';

const MessageView = ({
  messages,
  messagesEndRef,
  title,
  onMessageResend,
  classes,
  theme,
  isLoading,
}) => {
  return (
    <>
      {isLoading && <Loading />}
      {messages.map((message, id) => (
        <Message
          title={title}
          onMessageResend={onMessageResend}
          classes={classes}
          message={message}
          addMessageName={
            messages[id - 1] === undefined ||
            messages[id].own !== messages[id - 1].own
          }
          addMessageDate={
            messages[id + 1] === undefined ||
            messages[id].own !== messages[id + 1].own
          }
          theme={theme}
          id={id}
        />
      ))}

      <div ref={messagesEndRef} />
    </>
  );
};

export default MessageView;
