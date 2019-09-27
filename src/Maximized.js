import * as React from 'react'
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
} from '@livechat/ui-kit'

// forcing border radius. @livechat/ui-kit is not working when it's own message
// check in the future if they fix the problema
const forceBorderRadiusOwnMessage = (isOwn) => {
  return {
    borderTopLeftRadius: isOwn ? '1.4em' : '0.3em',
    borderTopRightRadius: isOwn ? '0.3em' : '1.4em',
    borderBottomLeftRadius: isOwn ? '1.4em' : '0.3em',
    borderBottomRightRadius: isOwn ? '0.3em' : '1.4em'
  };
};

const Maximized = ({
                     messages,
                     onMessageSend,
                     messagesEndRef,
                   }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          flexGrow: 1,
          minHeight: 0,
          height: '100%',
        }}
      >
        <MessageList active containScrollInSubtree>
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
                  </MessageMedia>
                )}
              </Bubble>
            </Message>
          ))}
          <div ref={messagesEndRef}/>
        </MessageList>
      </div>
      <TextComposer onSend={onMessageSend}>
        <Row align="center">
          <Fill>
            <TextInput placeholder="Digite a mensagem..."/>
          </Fill>
          <Fit>
            <SendButton/>
          </Fit>
        </Row>
      </TextComposer>
    </div>
  )
};

export default Maximized;
