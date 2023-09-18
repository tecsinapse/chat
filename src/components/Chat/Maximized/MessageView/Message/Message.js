import React, { useState } from 'react';
import {
  Bubble,
  Message as LiveChatMessage,
  MessageMedia,
  MessageText,
  MessageTitle,
} from '@livechat/ui-kit';
import { Typography } from '@material-ui/core';
import { isStringNotBlank } from '@tecsinapse/es-utils/build/object';

import { mdiAlertCircleOutline, mdiImageOff } from '@mdi/js';
import clsx from 'clsx';
import Icon from '@mdi/react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import {
  IconButton as IconButtonMaterial,
  MessagePreviewUtils,
} from '@tecsinapse/ui-kit';

import { DeliveryStatus } from './DeliveryStatus/DeliveryStatus';

import { ImageLoader } from './ImageLoader/ImageLoader';
import { ApplicationLoader } from './ApplicationLoader/ApplicationLoader';
import { VideoLoader } from './VideoLoader/VideoLoader';
import { AudioLoader } from './AudioLoader/AudioLoader';
import { DELIVERY_STATUS, MESSAGE_STYLE } from '../../../constants';
import { Warning } from '../../Warning/Warning';

export const Message = ({
  title,
  onMessageResend,
  classes,
  message,
  addMessageName,
  addMessageDate,
  theme,
}) => {
  const [showDate, setShowDate] = useState(false);

  const style = {
    padding: '4px',
    height: '32px',
    alignSelf: 'center',
    top: addMessageName ? undefined : '-10px',
  };

  const isError = DELIVERY_STATUS.isEquals(
    message?.status,
    DELIVERY_STATUS.ERROR
  );

  const isSending = DELIVERY_STATUS.isEquals(
    message?.status,
    DELIVERY_STATUS.SENDING
  );

  const isInfoStyle = MESSAGE_STYLE.isEquals(
    message?.style,
    MESSAGE_STYLE.INFO
  );

  return (
    <div
      className={clsx({
        [classes.messageRootOwn]: !isInfoStyle && message.own,
        [classes.messageRootError]: !isInfoStyle && isError && message.own,
        [classes.messageRootInfo]: isInfoStyle,
      })}
    >
      <LiveChatMessage
        className={clsx({
          [classes.messageWithoutName]: !addMessageName,
          [classes.messageWithoutDate]: !addMessageDate,
        })}
        date={
          addMessageName &&
          !isInfoStyle && (
            <Typography variant="caption" className={classes.authorName}>
              {/* Workaround to overcome lack of authorName on message object */}
              {message.authorName}
              {!isStringNotBlank(message.authorName) && message.own && 'Wingo'}
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
        {isInfoStyle && (
          <Warning
            infoMessage={message.text}
            className={classes.messageInfo}
            isShowIcon={false}
            isClosable={false}
            isDense
          />
        )}
        {!isInfoStyle && (
          <Bubble
            isOwn={message.own}
            onClick={
              !addMessageDate
                ? () => setShowDate(currentShowDate => !currentShowDate)
                : undefined
            }
          >
            {message.medias &&
              message.medias.length > 0 &&
              message.medias.map(media => (
                <MessageMedia key={media.url}>
                  {(media.mediaType.startsWith('image') ||
                    media.mediaType.startsWith('video')) && (
                    <>
                      {isSending || isError ? (
                        <div className={classes.emptyBubble}>
                          {isSending && (
                            <CircularProgress className={classes.progress} />
                          )}
                          {isError && (
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
            {message.text && !isInfoStyle && (
              <MessageText>
                <Typography
                  variant="body1"
                  dangerouslySetInnerHTML={{
                    __html: MessagePreviewUtils.normalizeInHtml(message.text),
                  }}
                />
              </MessageText>
            )}
            {message.title && (
              <MessageTitle
                title={<Typography variant="body1">{message.title}</Typography>}
              />
            )}
          </Bubble>
        )}
      </LiveChatMessage>

      {isError && (
        <Tooltip title="Reenviar" placement="bottom-end" arrow>
          <IconButtonMaterial
            key="send again"
            onClick={() => {
              onMessageResend(message.localId);
            }}
            style={style}
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
