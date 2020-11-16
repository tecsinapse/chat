# React Tecsinapse Chat Component

Projeto que controla toda a lógica do componente de front-end de chat e todo
fluxo de comunicação dos produtos com o `tecsinapse-chat`

## Execução localhost

Alguns passos são necessários para executar localhost
1. Descomentar a linha de renderização do componente no `index.js`
2. Ainda no `index.js` verificar os parâmetros de inicialização do componente _defaultChatInitConfig_
3. Verificar objetos iniciais do componente que devem ser "mockados" e estão em `mocks/` (`chatId` = seu telefone)
4. Executar `yarn start` e acessar [http://localhost:3000](http://localhost:3000)

In the project directory, you can run:

## Build

Para fazer a build e poder integrar com os projetos é necessário:
1. Limpar a pasta `build/` e executar `yarn build`
2. Copiar o conteúdo da pasta `build/` e colar no `tecsinapse-chat-api` na pasta específica de `assests`
3. Alterar os arquivos necessários que importam os bundles gerados lá no `tecsinapse-chat-api`
4. Fazer a compilição / release do `tecsinapse-chat-api` e utilizar nos projetos

Para gerar um build como biblioteca:
1. Executar o comando `yarn build-lib`
