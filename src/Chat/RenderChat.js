import React, { useEffect, useRef, useState } from "react";
import { Chat } from "@tecsinapse/ui-kit/build/Chat/Chat";
import SockJsClient from "react-stomp";

import { defaultFetch } from "../Util/fetch";
import { buildChatMessageObject } from "../Util/message";
import {UploaderDialog} from "./UploaderDialog";

export const RenderChat = ({ chatApiUrl, chatId, disabled }) => {
  
  const [messages, setMessages] = useState([]);
  const [lastMessageAt, setLastMessageAt] = useState(null);
  const [open, setOpen] = useState(false);

  const messagesEndRef = useRef(null);
  let clientRef = useRef();
  const fromId = chatId;


  useEffect(() => {
    defaultFetch(
      `${chatApiUrl}/api/messages/${chatId}?page=0&size=100`,
      "GET",
      {}
    ).then(pageResults => {
      const messages = pageResults.content.map(externalMessage => {
        return buildChatMessageObject(externalMessage, fromId);
      });
      setMessages(messages);
      setLastMessageAt(messages.length > 0 ? messages[messages.length - 1].at : null);
      setTimeout(function() {
        // workaround to wait for all elements to render
        messagesEndRef.current.scrollIntoView({
          block: "end",
          behavior: "smooth"
        });
      }, 700);
    });
  }, [messagesEndRef, lastMessageAt, fromId, chatApiUrl, chatId]);

  const handleNewExternalMessage = newMessage => {
    if (newMessage.type === "CHAT") {
      let message = buildChatMessageObject(newMessage, fromId);
      let newMessages = [...messages, message];
      setMessages(newMessages);
    }
  };

  const onConnect = () => {
    const chatMessage = {
      from: fromId,
      type: "JOIN"
    };

    clientRef.sendMessage(
      "/chat/addUser/room/" + chatId,
      JSON.stringify(chatMessage)
    );
  };

  const handleNewUserMessage = newMessage => {
    const chatMessage = {
      from: fromId,
      type: "CHAT",
      text: newMessage
    };

    try {
      clientRef.sendMessage(
        "/chat/sendMessage/room/" + chatId,
        JSON.stringify(chatMessage)
      );
    } catch (e) {
      // TODO: Implement error ui feedback
      console.log("Error with Websocket connection", e);
    }
  };
  
  const handleNewUserAudio = recordedBlob => {
    setOpen(true);
    const formData = new FormData();
    formData.append('file', recordedBlob.blob);
    defaultFetch(`${chatApiUrl}/api/messages/${chatId}/upload`, 'POST', {}, formData).then(result => {
      // TODO: implement ui to warn user that the audio has been uploaded
      setOpen(false);
    });
  }

  const handleNewUserFiles = (title, files) => {
    // TODO: how to send the title ?!

    Object.keys(files).forEach((uid, i) => {
      setOpen(true);
      const formData = new FormData();
      formData.append('file', files[uid].file);
      defaultFetch(`${chatApiUrl}/api/messages/${chatId}/upload`, 'POST', {}, formData).then(result => {
          setOpen(false);
      });
    });
  }

  return (
    <div className="App">
      <Chat
        disabled={disabled}
        isMaximizedOnly
        messages={messages}
        onMessageSend={text => {
          // TODO: should it add to message array ?!
          handleNewUserMessage(text);
        }}
        onAudio={blob => {
          // TODO: should it add to message array ?!
          handleNewUserAudio(blob);
        }}
        title="Cliente Oportunidade"
        subtitle={`Última mensagem: ${lastMessageAt == null ? 'nenhuma mensagem' : lastMessageAt}`}
        messagesEndRef={messagesEndRef}
        onMediaSend={handleNewUserFiles}
      />

      <SockJsClient
        url={`${chatApiUrl}/ws`}
        topics={["/topic/" + chatId]}
        onMessage={handleNewExternalMessage}
        onConnect={onConnect}
        ref={client => clientRef = client}
      />

      {/* TODO: improve the ux/ui for showing progress uploading files  */}
      <UploaderDialog open={open} setOpen={setOpen}/>

    </div>
  );
};
