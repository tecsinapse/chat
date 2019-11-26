import React, { useState, useRef } from 'react';
import {
  TextInput,
  MessageList,
  Message,
  MessageText,
  AgentBar,
  Title,
  Subtitle,
  MessageTitle,
  MessageMedia,
  TextComposer,
  Row,
  IconButton,
  SendButton,
  Column,
  Bubble,
} from '@livechat/ui-kit';
import { Typography, Avatar } from '@material-ui/core';
import {
  mdiMicrophone,
  mdiPaperclip,
  mdiImage,
  mdiLibraryVideo,
  mdiClose,
  mdiFile,
  mdiDownload,
  mdiSend,
} from '@mdi/js';
import Icon from '@mdi/react';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';

import { makeStyles, useTheme } from '@material-ui/styles';
import clsx from 'classnames';
import { IconButton as IconButtonMaterial } from '@tecsinapse/ui-kit/build/Buttons/IconButton';

import {
  defaultGreyLight2,
  defaultGreyLight5,
  defaultGrey2,
} from '@tecsinapse/ui-kit/build/colors';
import { MicRecorder } from './MicRecorder';

import { CustomUploader } from './CustomUploader';
import { PreviewList } from './PreviewList';
import { Loading } from './Loading';

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
  videoImage: {
    maxHeight: '200px',
    border: '1px solid black',
  },
  audio: {
    display: 'flex',
    padding: '5px',
  },
}));

const ENTER_KEYCODE = 13;
const wasEnterPressed = function wasEnterPressed(event) {
  return event.which === ENTER_KEYCODE;
};
const wasOnlyEnterPressed = function wasOnlyEnterPressed(event) {
  return wasEnterPressed(event) && !event.altKey && !event.shiftKey;
};

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
  isBlocked,
  blockedMessage,
}) => {
  const classes = useStyle();
  const theme = useTheme();

  const [writing, setWriting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [files, setFiles] = useState({});

  const isThereAudioSupport = onAudio !== undefined;
  const imageUpRef = useRef(null);
  const videoUpRef = useRef(null);
  const appUpRef = useRef(null);
  const [inputRef, setInputRef] = useState(null);

  const onStopRecording = (blob, accept) => {
    setRecording(false);
    if (accept) {
      onAudio(blob);
    }
  };

  const onCloseChatClicked = e => {
    if (onCloseChat) {
      onCloseChat(e);
    }
    minimize(e);
  };

  return (
    <div className={classes.root}>
      <AgentBar>
        <Row flexFill>
          <Column flexFill>
            <Title>
              <Typography
                variant="h6"
                style={{ color: theme.palette.primary.contrastText }}
              >
                {title}
              </Typography>
            </Title>
            <Subtitle>
              <Typography
                variant="subtitle2"
                style={{ color: theme.palette.primary.contrastText }}
              >
                {subtitle}
              </Typography>
            </Subtitle>
          </Column>
          {hasCloseButton && (
            <Column style={{ justifyContent: 'center' }}>
              <IconButtonMaterial key="close" onClick={onCloseChatClicked}>
                <Icon
                  path={mdiClose}
                  size={1.0}
                  color={theme.palette.primary.contrastText}
                />
              </IconButtonMaterial>
            </Column>
          )}
        </Row>
      </AgentBar>

      {isLoading && <Loading />}
      <MessageList active onScrollTop={loadMore}>
        {messages.map(message => (
          <Message
            date={
              <Typography variant="caption" className={classes.authorName}>
                {/* Workaround to overcome lack of authorName on message object */}
                {message.authorName}
                {(message.authorName === '' ||
                  message.authorName === undefined) &&
                  message.own &&
                  'Você'}
                {(message.authorName === '' ||
                  message.authorName === undefined) &&
                  !message.own &&
                  title}
              </Typography>
            }
            deliveryStatus={
              <Typography variant="caption" className={classes.at}>
                {message.at}
              </Typography>
            }
            isOwn={message.own}
            key={message.id}
          >
            <Bubble
              isOwn={message.own}
              className={clsx({
                [classes.bubbleTransparent]:
                  message.medias &&
                  message.medias.filter(
                    media =>
                      media.mediaType.startsWith('video') ||
                      media.mediaType.startsWith('image')
                  ).length > 0 &&
                  !message.text &&
                  !message.title,
              })}
            >
              {message.text && (
                <MessageText>
                  <Typography variant="body1">{message.text}</Typography>
                </MessageText>
              )}
              {message.title && (
                <MessageTitle
                  title={
                    <Typography variant="body1">{message.title}</Typography>
                  }
                />
              )}

              {/* TODO: Use a media object instead of a array, given that it has only one media by message */}
              {message.medias &&
                message.medias.length > 0 &&
                message.medias.map(media => (
                  <MessageMedia key={media.url}>
                    {media.mediaType.startsWith('image') && (
                      <img
                        src={media.url}
                        alt="Imagem"
                        className={classes.videoImage}
                      />
                    )}
                    {media.mediaType.startsWith('audio') && (
                      <audio controls className={classes.audio}>
                        <source src={media.url} />
                        {/* TODO: ADD A REAL TRACK OBJECT */}
                        <track default kind="captions" src={media.url} />
                      </audio>
                    )}
                    {media.mediaType.startsWith('video') && (
                      <video
                        controls
                        height={200}
                        className={classes.videoImage}
                      >
                        <source src={media.url} />
                        {/* TODO: ADD A REAL TRACK OBJECT */}
                        <track default kind="captions" src={media.url} />
                      </video>
                    )}
                    {media.mediaType.startsWith('application') && (
                      <List style={{ padding: 0 }}>
                        <ListItem
                          style={{
                            paddingTop: media.size ? 0 : undefined,
                            paddingBottom: media.size ? 0 : undefined,
                            paddingLeft: 8,
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <Icon
                                path={mdiFile}
                                size={1.0}
                                color={message.own ? 'white' : 'black'}
                              />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={media.name}
                            secondary={media.size && `${media.size} Kb`}
                            style={{
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                            }}
                          />
                          <ListItemSecondaryAction
                            style={{
                              right: 0,
                            }}
                          >
                            <a href={media.url} download>
                              <IconButtonMaterial aria-label="download">
                                <Icon
                                  path={mdiDownload}
                                  size={1.2}
                                  color={message.own ? 'white' : 'black'}
                                />
                              </IconButtonMaterial>
                            </a>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    )}
                  </MessageMedia>
                ))}
            </Bubble>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessageList>

      <PreviewList files={files} setFiles={setFiles} />

      {!disabled && (
        <TextComposer
          onSend={text => {
            if (Object.keys(files).length > 0) {
              onMediaSend(text, files);
            } else {
              onMessageSend(text);
            }
            setFiles({});
            setWriting(false);
          }}
          onKeyDown={e => {
            if (
              !writing &&
              wasOnlyEnterPressed(e) &&
              Object.keys(files).length > 0
            ) {
              onMediaSend('', files);
              setFiles({});
            }
          }}
          onChange={e => setWriting(e.currentTarget.value !== '')}
          inputRef={ref => setInputRef(ref)}
        >
          {(error !== '' && error !== undefined) || isBlocked ? (
            <Row align="center" justifyContent="space-around">
              <Typography variant="subtitle2" color="error">
                {isBlocked ? blockedMessage : error}
              </Typography>
            </Row>
          ) : (
            <>
              <Row align="center">
                {!recording && (
                  <TextInput fill placeholder="Digite uma mensagem" />
                )}

                {/* 
                  It's using the <SendButton/ /> to handle the send when typing 
                  some text (easier because it is implemented by the livechat).
                  This scenario cannot handle the attachment files with no text (active bug), though.
                  So, we are using the <Icon /> to handle the bug scenario and keeping the 
                  livechat for user text scenario (with or without attachment).
                  TODO: Keep only one handler, either by fixing the active bug or implementing the text 
                  handler on our <Icon /> (using controlled component passing 'value ' to TextComposer)
                */}
                {(writing || !isThereAudioSupport) && <SendButton fill />}
                {!writing && !recording && Object.keys(files).length > 0 && (
                  <IconButton
                    fill
                    key="send"
                    onClick={() => {
                      onMediaSend('', files);
                      setFiles({});
                    }}
                    style={{ maxHeight: 37, maxWidth: 35 }}
                  >
                    <Icon
                      path={mdiSend}
                      size={1.143}
                      color="#427fe1"
                      style={{ maxHeight: 26, maxWidth: 24 }}
                    />
                  </IconButton>
                )}

                {!writing &&
                  isThereAudioSupport &&
                  Object.keys(files).length <= 0 &&
                  !recording && (
                    <IconButton
                      fill
                      key="mic"
                      onClick={() => setRecording(true)}
                    >
                      <Icon
                        path={mdiMicrophone}
                        size={1}
                        color={defaultGreyLight2}
                      />
                    </IconButton>
                  )}

                {recording && <MicRecorder onStopRecording={onStopRecording} />}
              </Row>

              {!recording && (
                <Row verticalAlign="center" justify="left">
                  <IconButton
                    fill
                    key="image"
                    onClick={() => imageUpRef.current.open()}
                  >
                    <Icon
                      path={mdiImage}
                      size={0.75}
                      color={defaultGreyLight2}
                    />
                  </IconButton>

                  <IconButton
                    fill
                    key="movie"
                    onClick={() => videoUpRef.current.open()}
                  >
                    <Icon
                      path={mdiLibraryVideo}
                      size={0.75}
                      color={defaultGreyLight2}
                    />
                  </IconButton>

                  <IconButton
                    fill
                    key="paperclip"
                    onClick={() => appUpRef.current.open()}
                  >
                    <Icon
                      path={mdiPaperclip}
                      size={0.75}
                      color={defaultGreyLight2}
                    />
                  </IconButton>
                </Row>
              )}
              <CustomUploader
                focusRef={inputRef}
                ref={imageUpRef}
                files={files}
                setFiles={setFiles}
                mediaType="image/*"
                maxFileUploadSize={maxFileUploadSize}
              />
              <CustomUploader
                focusRef={inputRef}
                ref={videoUpRef}
                files={files}
                setFiles={setFiles}
                mediaType="video/*"
                maxFileUploadSize={maxFileUploadSize}
              />
              <CustomUploader
                focusRef={inputRef}
                ref={appUpRef}
                files={files}
                setFiles={setFiles}
                maxFileUploadSize={maxFileUploadSize}
              />
            </>
          )}
        </TextComposer>
      )}
    </div>
  );
};

export default Maximized;
