import * as React from 'react'
import {Fragment} from 'react'
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
  TitleBar,
} from '@livechat/ui-kit'

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
                     messages,
                     lastMessageAt,
                     onMessageSend,
                     messagesEndRef,
                     disabled,
                     webSocketError,
                   }) => {

  return (
    <Fragment>
      <div
        style={{
          height: '15%',
        }}
      >
        <TitleBar
          title={`Última mensagem: ${lastMessageAt == null ? 'nenhuma mensagem' : lastMessageAt}`}/>
      </div>
      <div
        style={{
          height: '70%',
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
                    <a href={media.url} target="_blank" rel="noopener noreferrer">Download</a>
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
          height: '15%',
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
