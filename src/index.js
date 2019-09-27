import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import RenderChatComponent from './RenderChatComponent';
import * as serviceWorker from './serviceWorker';

/*** IF YOU WANT TO TEST LOCALLY, UNCOMMENT ***/
// ReactDOM.render(<RenderChatComponent />, document.getElementById('root'));

window.renderChatComponent = function renderChatComponent() {
  ReactDOM.render(
    <RenderChatComponent chatId={window.CHAT_ID} />,
    document.getElementById("chat-component-div")
  );
  serviceWorker.unregister();
};
