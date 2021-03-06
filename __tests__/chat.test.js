import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { TestComponent } from './TestComponent';

jest.mock('@tecsinapse/react-mic', () =>
  // eslint-disable-next-line
  jest.fn(() => () =>
    // eslint-disable-next-line
    (audioContext = require('../__mocks__/AudioContext.mock'))
  )
);

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

  const { getByText, getAllByText, container } = render(
    <TestComponent onMessageSend={onMessageSend} messages={messages} />
  );

  expect(container).toContainElement(getByText('1'));
  expect(container).toContainElement(getByText('2'));

  const items = getAllByText('Felipe Rodrigues');

  expect(items).toHaveLength(2); // Header and one message
  expect(container).toContainElement(
    getByText('Última mensagem 10/10/2019 10:10')
  );
});
