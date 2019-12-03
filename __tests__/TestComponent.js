import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';

import { Chat } from '../src/Chat';

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: purple[300],
      main: purple[500],
      dark: purple[700],
    },
    secondary: {
      light: green[300],
      main: green[500],
      dark: green[700],
    },
  },
  success: {
    main: 'pink',
  },
});

export const TestComponent = ({ onMessageSend, messages }) => (
  <MuiThemeProvider theme={theme}>
    <Chat
      isMaximizedOnly
      title="Felipe Rodrigues"
      subtitle="Última mensagem 10/10/2019 10:10"
      onMessageSend={onMessageSend}
      messages={messages}
    />
  </MuiThemeProvider>
);
export default TestComponent;
