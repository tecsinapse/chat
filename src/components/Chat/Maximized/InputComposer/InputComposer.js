import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  IconButton,
  Row,
  SendButton,
  TextComposer,
  TextInput,
} from '@livechat/ui-kit';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@material-ui/core';
import {
  mdiFilmstripBoxMultiple,
  mdiImage,
  mdiMicrophone,
  mdiPaperclip,
  mdiSend,
  mdiTextBoxMultiple,
} from '@mdi/js';
import Icon from '@mdi/react';
import {
  defaultGreyLight2,
  defaultGreyDisabled,
} from '@tecsinapse/ui-kit/build/utils/colors';
import { Button } from '@tecsinapse/ui-kit';
import { MicRecorder } from './MicRecorder/MicRecorder';
import { CustomUploader, onAccept } from './CustomUploader/CustomUploader';
import { PreviewList } from './PreviewList/PreviewList';
import { microphoneByBrowser } from '../../../utils';
import { useStyle } from './InputComposerStyle';

const ENTER_KEYCODE = 13;
const wasEnterPressed = function wasEnterPressed(event) {
  return event.which === ENTER_KEYCODE;
};

const wasOnlyEnterPressed = function wasOnlyEnterPressed(event) {
  return wasEnterPressed(event) && !event.altKey && !event.shiftKey;
};

export const InputComposer = ({
  onMessageSend,
  onAudio,
  onMediaSend,
  maxFileUploadSize,
  isBlocked,
  blockedMessageTitle,
  blockedMessage,
  style,
  disabledSend,
  droppedFiles,
  setDroppedFiles,
  uploadOptions,
  onSendReactGAEvent,
  openDefaultMessages,
  message,
  setMessage,
  updateText,
}) => {
  const classes = useStyle();
  const [writing, setWriting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const [micWaitResponse, setMicWaitResponse] = useState(false);
  const [files, setFiles] = useState({});

  const isThereAudioSupport = onAudio !== undefined;
  const imageUpRef = useRef(null);
  const videoUpRef = useRef(null);
  const appUpRef = useRef(null);
  const [inputRef, setInputRef] = useState(null);

  const transformImages = useCallback(
    data => {
      onAccept({ setFiles, files })(
        (Array.from(data.items) || [])
          .filter(
            item =>
              ![['image/gif', 'image/png', 'image/jpeg', 'image/bmp']].includes(
                item.type
              )
          )
          .map(a => (a instanceof File ? a : a.getAsFile()))
      );
    },
    [files]
  );

  const pasteHandler = useCallback(
    e =>
      e.clipboardData &&
      e.clipboardData.items.length > 0 &&
      transformImages(e.clipboardData),
    [transformImages]
  );

  useEffect(() => {
    const pasteRef = window;

    pasteRef.addEventListener('paste', pasteHandler);

    return () => {
      pasteRef.removeEventListener('paste', pasteHandler);
    };
  }, [pasteHandler]);

  useEffect(() => {
    if (droppedFiles && droppedFiles.items?.length > 0) {
      transformImages(droppedFiles);
    }
    setDroppedFiles(null);
  }, [droppedFiles, setDroppedFiles, transformImages]);

  const onStopRecording = (blob, accept) => {
    setRecording(false);

    if (accept) {
      onAudio(blob);
    }
  };

  const onKeyDown = e => {
    if (!writing && wasOnlyEnterPressed(e) && Object.keys(files).length > 0) {
      onMediaSend('', files);
      setFiles({});
    }
  };

  const onSend = text => {
    if (Object.keys(files).length > 0) {
      onMediaSend(text, files);
    } else {
      onMessageSend(text, message?.media);
    }
    setFiles({});
    setWriting(false);
  };

  useEffect(() => {
    setWriting(message.body !== '');
  }, [message]);

  const onChange = e => {
    setWriting(e.currentTarget.value !== '');
    updateText(e.currentTarget.value);
  };
  const inputRef1 = ref => setInputRef(ref);
  const style1 = { maxHeight: 37, maxWidth: 35 };
  const style2 = { maxHeight: 26, maxWidth: 24 };
  const style3 = { lineHeight: 1.2, letterSpacing: 0 };
  const size = 1.143;
  const onClick = () => {
    onSendReactGAEvent({
      label: 'CHAT USO DO MICROFONE',
      action: 'CLICK_GRAVAR_AUDIO',
    });

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setMicWaitResponse(false);
        setRecording(true);
      })
      .catch(e => {
        if (e) {
          setMicDenied(true);
        }
      })
      .finally(setMicWaitResponse(true));
  };
  const onClick1 = () => imageUpRef.current.open();
  const iconSize = 0.75;
  const onClick2 = () => videoUpRef.current.open();
  const onClick3 = () => appUpRef.current.open();

  const closeMicrophoneModal = () => {
    if (micDenied) {
      onSendReactGAEvent({
        label: 'CHAT USO DO MICROFONE',
        action: 'CLICK_FECHAR_MICROFONE_BLOQUEADO',
      });
    } else {
      onSendReactGAEvent({
        label: 'CHAT USO DO MICROFONE',
        action: 'CLICK_FECHAR_PERMITIR_MICROFONE',
      });
    }

    setMicDenied(false);
    setMicWaitResponse(false);
  };

  const getTextModalMicPermission = () => {
    if (micDenied) {
      return (
        <DialogContentText>
          O Wingo Chat precisa ter acesso ao microfone do seu computador para
          que você possa gravar mensagens de voz. Para permitir o acesso, clique
          em
          <img alt="" width="25px" src={microphoneByBrowser()} /> na barra de
          endereços e selecione a opção &quot;Sempre permitir que{' '}
          {window.location.href} acesse seu microfone&quot;.
        </DialogContentText>
      );
    }

    return (
      <DialogContentText>
        Para gravar uma mensagem de voz clique em &quot;Permitir&quot;, logo
        acima, para dar ao Wingo Chat acessso ao microfone do seu computador
      </DialogContentText>
    );
  };

  return (
    <>
      {isBlocked && blockedMessage && (
        <div>
          <div className={classes.blockedMessageTitle}>
            <Typography className={classes.title}>
              {blockedMessageTitle}
            </Typography>
          </div>
          <TextComposer
            onSend={onSend}
            onKeyDown={onKeyDown}
            onChange={onChange}
            inputRef={inputRef1}
            active={!disabledSend}
            style={style}
          >
            <div className={classes.blockedMessage}>
              <Typography
                variant="caption"
                color="textSecondary"
                style={style3}
              >
                {blockedMessage}
              </Typography>
            </div>
          </TextComposer>
        </div>
      )}

      {(micWaitResponse || micDenied) && (
        <Dialog open>
          <DialogTitle>Permitir microfone</DialogTitle>
          <DialogContent>{getTextModalMicPermission()}</DialogContent>
          <DialogActions>
            <Button
              color="primary"
              variant="contained"
              autoFocus
              onClick={closeMicrophoneModal}
            >
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <PreviewList
        files={files}
        setFiles={setFiles}
        message={message}
        setMessage={setMessage}
        writing={writing}
      />
      <>
        {!isBlocked && (
          <TextComposer
            onSend={onSend}
            onKeyDown={onKeyDown}
            onChange={onChange}
            inputRef={inputRef1}
            active={!disabledSend && !isBlocked}
            defaultValue={message?.body}
            style={style}
          >
            <Row align="center">
              {!recording && (
                <TextInput fill="true" placeholder="Digite uma mensagem" />
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
              {(writing || !isThereAudioSupport) && (
                <SendButton fill="true" disabled={disabledSend} />
              )}
              {!writing && !recording && Object.keys(files).length > 0 && (
                <IconButton
                  fill="true"
                  key="send"
                  disabled={disabledSend}
                  onClick={() => {
                    onMediaSend('', files);
                    setFiles({});
                  }}
                  style={style1}
                >
                  <Icon
                    path={mdiSend}
                    size={size}
                    color="#427fe1"
                    style={style2}
                  />
                </IconButton>
              )}
              {!writing && !recording && Boolean(message?.media) && (
                <IconButton
                  fill="true"
                  key="send"
                  disabled={disabledSend}
                  onClick={() => {
                    onMessageSend(text, message.media);
                  }}
                  style={style1}
                >
                  <Icon
                    path={mdiSend}
                    size={size}
                    color="#427fe1"
                    style={style2}
                  />
                </IconButton>
              )}

              {!writing &&
                isThereAudioSupport &&
                Object.keys(files).length <= 0 &&
                !message?.media &&
                !recording && (
                  <IconButton
                    fill="true"
                    key="mic"
                    onClick={onClick}
                    disabled={disabledSend}
                  >
                    <Icon
                      path={mdiMicrophone}
                      size={1}
                      color={defaultGreyLight2}
                    />
                  </IconButton>
                )}

              {recording && (
                <MicRecorder
                  onStopRecording={onStopRecording}
                  onSendReactGAEvent={onSendReactGAEvent}
                />
              )}
            </Row>

            {!recording && (
              <Row verticalAlign="center" justify="left">
                <IconButton
                  fill="true"
                  key="image"
                  onClick={onClick1}
                  disabled={disabledSend}
                >
                  <Icon
                    path={mdiImage}
                    size={iconSize}
                    color={defaultGreyLight2}
                  />
                </IconButton>

                <IconButton
                  fill="true"
                  key="movie"
                  onClick={onClick2}
                  disabled={disabledSend}
                >
                  <Icon
                    path={mdiFilmstripBoxMultiple}
                    size={iconSize}
                    color={defaultGreyLight2}
                  />
                </IconButton>

                <IconButton
                  fill="true"
                  key="paperclip"
                  onClick={onClick3}
                  disabled={disabledSend}
                >
                  <Icon
                    path={mdiPaperclip}
                    size={iconSize}
                    color={defaultGreyLight2}
                  />
                </IconButton>

                <IconButton
                  fill="true"
                  key="defaultmessages"
                  onClick={openDefaultMessages}
                  disabled={writing}
                >
                  <Icon
                    path={mdiTextBoxMultiple}
                    size={iconSize}
                    color={!writing ? defaultGreyLight2 : defaultGreyDisabled}
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
              uploadOptions={uploadOptions}
            />
            <CustomUploader
              focusRef={inputRef}
              ref={videoUpRef}
              files={files}
              setFiles={setFiles}
              mediaType=".mov,video/*"
              maxFileUploadSize={maxFileUploadSize}
              uploadOptions={uploadOptions}
            />
            <CustomUploader
              focusRef={inputRef}
              ref={appUpRef}
              files={files}
              setFiles={setFiles}
              maxFileUploadSize={maxFileUploadSize}
              uploadOptions={uploadOptions}
            />
          </TextComposer>
        )}
      </>
    </>
  );
};
