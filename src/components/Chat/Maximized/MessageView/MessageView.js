/* eslint-disable react/no-array-index-key */
import React, { useEffect } from 'react';
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
  isBlocked,
  blockedMessageTitle,
  addBlockMessageInfo,
  setAddBlockMessageInfo,
}) => {
  const style = {
    display: 'flex',
    alignItems: 'center',
  };
  const style1 = {
    flex: 1,
  };

  useEffect(() => {
    console.log(messages);

    if (isBlocked && blockedMessageTitle && addBlockMessageInfo) {
      const tempMessage = {
        at: messages?.at(messages.length - 1)?.at,
        id: new Date().getTime().toString(),
        text: blockedMessageTitle,
        style: 'INFO',
        isTempMessage: true,
      };

      if (!messages.at(messages.length - 1)?.isTempMessage) {
        messages?.push(tempMessage);
      } else {
        messages = messages.pop().push(tempMessage);
      }
      setAddBlockMessageInfo(false);
    }
  }, [isBlocked, blockedMessageTitle]);

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
