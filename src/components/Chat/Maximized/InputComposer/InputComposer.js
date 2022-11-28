import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  IconButton,
  Row,
  SendButton,
  TextComposer,
  TextInput,
} from '@livechat/ui-kit';
import { Typography } from '@material-ui/core';
import {
  mdiFilmstripBoxMultiple,
  mdiImage,
  mdiMicrophone,
  mdiPaperclip,
  mdiSend,
} from '@mdi/js';
import Icon from '@mdi/react';
import { defaultGreyLight2 } from '@tecsinapse/ui-kit/build/utils/colors';
import { MicRecorder } from './MicRecorder/MicRecorder';
import { CustomUploader, onAccept } from './CustomUploader/CustomUploader';
import { PreviewList } from './PreviewList/PreviewList';

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
  composerBlockedMessage,
  disabledSend,
  droppedFiles,
  setDroppedFiles,
  uploadOptions,
  setMicDanied,
  setMicWaitResponse,
}) => {
  const [writing, setWriting] = useState(false);
  const [recording, setRecording] = useState(false);
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

  const blockedMessageSpacing = { letterSpacing: '-0.1px' };
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
      onMessageSend(text);
    }
    setFiles({});
    setWriting(false);
  };
  const onChange = e => setWriting(e.currentTarget.value !== '');
  const inputRef1 = ref => setInputRef(ref);
  const style = { maxHeight: 37, maxWidth: 35 };
  const style1 = { maxHeight: 26, maxWidth: 24 };
  const size = 1.143;

  const onClick = () => {
    navigator.permissions.query({ name: 'microphone' }).then(r => {
      console.log(r);

      if (r.state !== 'granted') {
        if (r.state !== 'denied') {
          setMicWaitResponse(true);
        }
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(() => {
            setMicWaitResponse(false);
            setRecording(true);
          })
          .catch(e => {
            if (e) {
              setMicWaitResponse(false);
              setMicDanied(true);
            }
          });
      } else {
        setRecording(true);
      }
    });
  };
  const onClick1 = () => imageUpRef.current.open();
  const iconSize = 0.75;
  const onClick2 = () => videoUpRef.current.open();
  const onClick3 = () => appUpRef.current.open();

  return (
    <>
      <PreviewList files={files} setFiles={setFiles} />
      <>
        {isBlocked && composerBlockedMessage && (
          <TextComposer
            onSend={onSend}
            onKeyDown={onKeyDown}
            onChange={onChange}
            inputRef={inputRef1}
            active={!disabledSend}
          >
            <Row align="center" justifyContent="space-around">
              <Typography
                variant="body2"
                color="textSecondary"
                style={blockedMessageSpacing}
              >
                {composerBlockedMessage}
              </Typography>
            </Row>
          </TextComposer>
        )}

        {!isBlocked && (
          <TextComposer
            onSend={onSend}
            onKeyDown={onKeyDown}
            onChange={onChange}
            inputRef={inputRef1}
            active={!disabledSend && !isBlocked}
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
                  style={style}
                >
                  <Icon
                    path={mdiSend}
                    size={size}
                    color="#427fe1"
                    style={style1}
                  />
                </IconButton>
              )}

              {!writing &&
                isThereAudioSupport &&
                Object.keys(files).length <= 0 &&
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

              {recording && <MicRecorder onStopRecording={onStopRecording} />}
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
