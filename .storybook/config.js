import { addDecorator, configure } from '@storybook/react';
import React from 'react';
import { setDefaults } from '@storybook/addon-info';
import { setOptions } from '@storybook/addon-options';

import { ThemeProvider } from '@tecsinapse/ui-kit/build/ThemeProvider';

setOptions({
  hierarchySeparator: /\//,
  hierarchyRootSeparator: /\|/,
  name: 'TecSinapse Chat',
  url: 'https://github.com/tecsinapse/chat',
});

const withThemeProvider = storyFn => (
  <ThemeProvider variant="orange">{storyFn()}</ThemeProvider>
);
const req = require.context('../src', true, /\.story\.js$/);
// Sets the info addon's options.
setDefaults({
  header: false,
});

function loadStories() {
  addDecorator(withThemeProvider);
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
