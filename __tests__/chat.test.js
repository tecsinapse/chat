import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// TODO: fix test by importing correctly.
// There are some imports by the ECSM6 inside the Chat,
// so should it transform inside node-modules ???
//
// 1. Triend import directly from the bundle
import { Chat } from '../src/Chat';

test('Render chat', () => {
  const { getByText, container } = render(
    <Chat
      isMaximizedOnly
      title="Felipe Rodrigues"
      subtitle="Última mensagem 10/10/2019 10:10"
      messages={[
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
      ]}
    />
  );

  expect(container).toContainElement(getByText('1'));
  expect(container).toContainElement(getByText('2'));
  expect(container).toContainElement(getByText('Felipe Rodrigues'));
  expect(container).toContainElement(
    getByText('Última mensagem 10/10/2019 10:10')
  );
});
