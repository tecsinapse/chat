import React from 'react';
import { Divider, Typography } from '@material-ui/core';
import { Message } from './Message/Message';
import { Loading } from '../../Loading/Loading';

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
        <>
          {(messages[id - 1] === undefined ||
            messages[id - 1].at.split(' ')[0] !== message.at.split(' ')[0]) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Divider
                variant="middle"
                style={{
                  flex: 1,
                }}
              />
              <Typography variant="caption" className={classes.at}>
                {message.at.split(' ')[0]}
              </Typography>
              <Divider
                variant="middle"
                style={{
                  flex: 1,
                }}
              />
            </div>
          )}
          <Message
            title={title}
            onMessageResend={onMessageResend}
            classes={classes}
            message={message}
            addMessageName={
              messages[id - 1] === undefined ||
              messages[id].own !== messages[id - 1].own ||
              messages[id - 1].at.split(' ')[0] !== message.at.split(' ')[0]
            }
            addMessageDate={
              messages[id + 1] === undefined ||
              messages[id].own !== messages[id + 1].own ||
              messages[id + 1].at.split(' ')[0] !== message.at.split(' ')[0]
            }
            theme={theme}
            id={id}
          />
        </>
      ))}

      <div ref={messagesEndRef} />
    </>
  );
};

export default MessageView;
