import React from 'react';
import ReactDOM from 'react-dom';
import {RenderChat} from "./Chat/RenderChat";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<RenderChat />, div);
  ReactDOM.unmountComponentAtNode(div);
});
