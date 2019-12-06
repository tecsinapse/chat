import { addDecorator, addParameters, configure } from '@storybook/react';
import React from 'react';
import { setOptions } from '@storybook/addon-options';
import { DocsContainer, DocsPage } from '@storybook/addon-docs/blocks';

import { ThemeProvider } from '@tecsinapse/ui-kit/build/ThemeProvider';

setOptions({
  hierarchySeparator: /\//,
  hierarchyRootSeparator: /\|/,
  name: 'TecSinapse Chat',
  url: 'https://github.com/tecsinapse/chat',
});

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
});

const withThemeProvider = storyFn => (
  <ThemeProvider variant="orange">{storyFn()}</ThemeProvider>
);
const req = require.context('../src', true, /\.story\.(js|mdx)$/);

function loadStories() {
  addDecorator(withThemeProvider);
  return req
    .keys()
    .map(fname => req(fname))
    .filter(exp => !!exp.default);
}

configure(loadStories, module);
