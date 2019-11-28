import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ThemeProvider } from '@tecsinapse/ui-kit';
import { Chat } from '../src/Chat';

jest.mock('@cleandersonlobo/react-mic', () => {
  return jest.fn(() => () => {
    // eslint-disable-next-line
    return (audioContext = require('../__mocks__/AudioContext.mock'));
  });
});

test('Render chat', () => {
  const messages = [
    {
      at: '02/03/2019 10:12',
      own: true,
      id: Date.now().toString(),
      authorName: 'Você',
      text: '1',
    },
    {
      at: '02/03/2019 10:13',
      own: false,
      id: Date.now().toString(),
      text: '2',
    },
  ];
  const onMessageSend = text => {
    const localId = Date.now().toString();
    messages.push({
      at: '02/03/2019 10:12',
      own: true,
      id: Date.now().toString(),
      authorName: 'Você',
      status: 'sending',
      text,
      localId,
    });
  };

  const { getByText, container } = render(
    <ThemeProvider variant="orange">
      <Chat
        isMaximizedOnly
        title="Felipe Rodrigues"
        subtitle="Última mensagem 10/10/2019 10:10"
        onMessageSend={onMessageSend}
        messages={messages}
      />
    </ThemeProvider>
  );

  expect(container).toContainElement(getByText('1'));
  expect(container).toContainElement(getByText('2'));
  expect(container).toContainElement(getByText('Felipe Rodrigues'));
  expect(container).toContainElement(
    getByText('Última mensagem 10/10/2019 10:10')
  );
});
