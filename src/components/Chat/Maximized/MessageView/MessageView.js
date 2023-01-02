/* eslint-disable react/no-array-index-key */
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
  const style = {
    display: 'flex',
    alignItems: 'center',
  };
  const style1 = {
    flex: 1,
  };

  return (
    <>
      {isLoading && <Loading />}
      {messages.map((message, id) => (
        <React.Fragment key={id}>
          {(messages[id - 1] === undefined ||
            messages[id - 1].at.split(' ')[0] !== message.at.split(' ')[0]) && (
            <div style={style}>
              <Divider variant="middle" style={style1} />
              <Typography variant="caption" className={classes.at}>
                {message.at.split(' ')[0]}
              </Typography>
              <Divider variant="middle" style={style1} />
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
        </React.Fragment>
      ))}

      <div ref={messagesEndRef} />
    </>
  );
};

export default MessageView;
