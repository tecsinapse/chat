import React, {Fragment, useRef} from 'react';
import {
  Bubble,
  Fill,
  Fit,
  Message,
  MessageList,
  MessageMedia,
  MessageText,
  MessageTitle,
  Row,
  SendButton,
  TextComposer,
  TextInput,
  TitleBar
} from '@livechat/ui-kit'
import {IconButton, ThemeProvider} from "@tecsinapse/ui-kit";
import {mdiPaperclip} from '@mdi/js';
import Icon from "@mdi/react";
import {CustomUploader} from "./CustomUploader";
import {MicRecorder} from "./MicRecorder";

// forcing border radius. @livechat/ui-kit is not working when it's own message
// check in the future if they fix the problema
const forceBorderRadiusOwnMessage = (isOwn) => {
  return {
    borderTopLeftRadius: isOwn ? '1.4em' : '0.3em',
    borderTopRightRadius: isOwn ? '0.3em' : '1.4em',
    borderBottomLeftRadius: isOwn ? '1.4em' : '0.3em',
    borderBottomRightRadius: isOwn ? '0.3em' : '1.4em',
    backgroundColor: isOwn ? '#cfd8dc' : '#fff',
  };
};

const Maximized = ({
                     chatApiUrl,
                     chatId,
                     messages,
                     lastMessageAt,
                     onMessageSend,
                     messagesEndRef,
                     disabled,
                     webSocketError,
                   }) => {

  const Uploader = () => {
    const fancyRef = useRef(null);
    return (
      <ThemeProvider variant='green'>
        <div>
          <IconButton
            onClick={() => {
              fancyRef.current.open();
            }}
          >
            <Icon path={mdiPaperclip} size={1} color="white"/>
          </IconButton>
          <CustomUploader silent ref={fancyRef} chatApiUrl={chatApiUrl} chatId={chatId}/>
        </div>
      </ThemeProvider>
    );
  };

  return (
    <Fragment>
      <div
        style={{
          height: '10%',
        }}
      >
        <TitleBar
          title={`Última mensagem: ${lastMessageAt == null ? 'nenhuma mensagem' : lastMessageAt}`}
          rightIcons={[
            <Uploader key="uploader1"/>
          ]}/>
      </div>
      <div
        style={{
          height: '80%',
        }}
      >
        <MessageList active>
          {messages.map((message) => (
            <Message
              date={message.at}
              isOwn={message.own}
              key={message.id}
            >
              <Bubble isOwn={message.own} style={forceBorderRadiusOwnMessage(message.own)}>
                {message.text && <MessageText>{message.text}</MessageText>}
                {message.title && <MessageTitle title={message.title}/>}

                {(message.medias && message.medias.length > 0) && message.medias.map((media) =>
                  <MessageMedia key={media.url}>
                    {media.mediaType.startsWith('image') &&
                    <img src={media.url} alt="Imagem" style={{maxHeight: '200px'}}/>}
                    {media.mediaType.startsWith('audio') &&
                    <audio controls>
                      <source src={media.url}/>
                    </audio>}
                    {media.mediaType.startsWith('video') &&
                    <video controls height={200}>
                      <source src={media.url}/>
                    </video>}
                    {media.mediaType.startsWith('application') &&
                    <p style={{textAlign: 'center'}}>
                      <a href={media.url} target="_blank"
                         rel="noopener noreferrer">Download</a>
                    </p>
                    }
                  </MessageMedia>
                )}
              </Bubble>
            </Message>
          ))}
          <div ref={messagesEndRef}/>
        </MessageList>
      </div>
      <div
        style={{
          height: '10%',
        }}
      >
        {!disabled &&
        <TextComposer onSend={onMessageSend}>
          <Row align="center">
            <Fill>
              <TextInput
                placeholder={webSocketError ? 'Problema ao se conectar ao chat. Tente novamente em alguns minutos' : 'Digite uma mensagem'}/>
            </Fill>
            {!webSocketError &&
            <Fit>
              <SendButton/>
              <MicRecorder chatId={chatId} chatApiUrl={chatApiUrl}/>
            </Fit>
            }
          </Row>
        </TextComposer>
        }
      </div>
    </Fragment>
  )
};

export default Maximized;
