import React, { useState, useRef } from 'react';
import {
  TextInput,
  TextComposer,
  Row,
  IconButton,
  SendButton,
} from '@livechat/ui-kit';
import { Typography } from '@material-ui/core';
import {
  mdiMicrophone,
  mdiPaperclip,
  mdiImage,
  mdiLibraryVideo,
  mdiSend,
} from '@mdi/js';
import Icon from '@mdi/react';
import { defaultGreyLight2 } from '../colors';
import { MicRecorder } from './MicRecorder';
import { CustomUploader } from './CustomUploader';
import { PreviewList } from './PreviewList';

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
  blockedMessage,
}) => {
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

  return (
    <>
      <PreviewList files={files} setFiles={setFiles} />

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
        {isBlocked ? (
          <Row align="center" justifyContent="space-around">
            <Typography variant="subtitle2" color="error">
              {blockedMessage}
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
                  <IconButton fill key="mic" onClick={() => setRecording(true)}>
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
                  <Icon path={mdiImage} size={0.75} color={defaultGreyLight2} />
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
    </>
  );
};

export default InputComposer;
