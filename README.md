# Iniciando

[![Build Status](https://travis-ci.org/tecsinapse/chat.svg?branch=master)](https://travis-ci.org/tecsinapse/chat)
[![npm version](https://badge.fury.io/js/%40tecsinapse%2Fchat.svg)](https://badge.fury.io/js/%40tecsinapse%2Fchat)

***@tecsinapse/chat*** é uma biblioteca contendo chat react ***

## Get Started


Para add em seu projeto:
```
    yarn add @tecsinapse/chat
```

E adicione o ThemeProvider em seu projeto como abaixo:

```
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App/App";
import * as serviceWorker from "./serviceWorker";
import { ThemeProvider } from "@tecsinapse/ui-kit";
import { Chat } from '@tecsinapse/chat';

ReactDOM.render(
  <ThemeProvider variant="black">
    <Chat />
  </ThemeProvider>,

  document.getElementById("root")
);
```

### Desenvolvimento

Para rodar localmente
```
    yarn install && yarn start
```

Para buildar e publicar a lib:
```
    bumped release $VERSAO
```

As modificações na lib serão refletidas após build da lib.
