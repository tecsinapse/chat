import React, { useState } from 'react';
import {
  MessageText,
  MessageTitle,
  MessageMedia,
  Bubble,
  Message as LiveChatMessage,
} from '@livechat/ui-kit';
import { Typography } from '@material-ui/core';
import { isStringNotBlank } from '@tecsinapse/es-utils/build/object';

import { mdiAlertCircleOutline, mdiImageOff } from '@mdi/js';
import clsx from 'clsx';
import Icon from '@mdi/react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import { IconButton as IconButtonMaterial } from '@tecsinapse/ui-kit/build/Buttons/IconButton';

import { DeliveryStatus } from './DeliveryStatus';

import { ImageLoader } from './ImageLoader';
import { ApplicationLoader } from './ApplicationLoader';
import { VideoLoader } from './VideoLoader';
import { AudioLoader } from './AudioLoader';

export const Message = ({
  title,
  onMessageResend,
  classes,
  message,
  addMessageName,
  addMessageDate,
  theme,
  id,
}) => {
  const [showDate, setShowDate] = useState(false);

  return (
    <div
      className={clsx({
        [classes.messageRootOwn]: message.own,
        [classes.messageRootError]: message.status === 'error' && message.own,
      })}
    >
      <LiveChatMessage
        className={clsx({
          [classes.messageWithoutName]: !addMessageName,
          [classes.messageWithoutDate]: !addMessageDate,
        })}
        date={
          addMessageName && (
            <Typography variant="caption" className={classes.authorName}>
              {/* Workaround to overcome lack of authorName on message object */}
              {message.authorName}
              {!isStringNotBlank(message.authorName) && message.own && 'Você'}
              {!isStringNotBlank(message.authorName) && !message.own && title}
            </Typography>
          )
        }
        deliveryStatus={
          <DeliveryStatus
            message={message}
            classes={classes}
            addMessageDate={addMessageDate}
            showDate={showDate}
          />
        }
        isOwn={message.own}
        key={message.id}
      >
        <Bubble
          isOwn={message.own}
          onClick={
            addMessageDate
              ? undefined
              : () => setShowDate(currentShowDate => !currentShowDate)
          }
        >
          {message.text && (
            <MessageText>
              <Typography variant="body1">{message.text}</Typography>
            </MessageText>
          )}
          {message.title && (
            <MessageTitle
              title={<Typography variant="body1">{message.title}</Typography>}
            />
          )}
          {message.medias &&
            message.medias.length > 0 &&
            message.medias.map(media => (
              <MessageMedia key={media.url}>
                {(media.mediaType.startsWith('image') ||
                  media.mediaType.startsWith('video')) && (
                  <>
                    {message.status === 'sending' ||
                    message.status === 'error' ? (
                      <div className={classes.emptyBubble}>
                        {message.status === 'sending' && (
                          <CircularProgress className={classes.progress} />
                        )}
                        {message.status === 'error' && (
                          <Icon
                            path={mdiImageOff}
                            size={1}
                            color={message.own ? 'white' : 'black'}
                            className={classes.imageError}
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        {media.mediaType.startsWith('image') && (
                          <ImageLoader url={media.url} classes={classes} />
                        )}

                        {media.mediaType.startsWith('video') && (
                          <VideoLoader media={media} classes={classes} />
                        )}
                      </>
                    )}
                  </>
                )}

                {media.mediaType.startsWith('audio') && (
                  <AudioLoader media={media} classes={classes} />
                )}

                {media.mediaType.startsWith('application') && (
                  <ApplicationLoader message={message} media={media} />
                )}
              </MessageMedia>
            ))}
        </Bubble>
      </LiveChatMessage>

      {message.status === 'error' && (
        <Tooltip title="Reenviar" placement="top">
          <IconButtonMaterial
            fill
            key="send again"
            onClick={() => {
              onMessageResend(message.localId);
            }}
            style={{
              padding: '4px',
              height: '32px',
              alignSelf: 'center',
              top: addMessageName ? undefined : '-10px',
            }}
          >
            <Icon
              path={mdiAlertCircleOutline}
              size={1}
              color={theme.palette.error.main}
            />
          </IconButtonMaterial>
        </Tooltip>
      )}
    </div>
  );
};
