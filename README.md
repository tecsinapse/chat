# React Tecsinapse Chat Component

Projeto que controla toda a lógica do componente de front-end de chat e todo
fluxo de comunicação dos produtos com o `tecsinapse-chat`

## Execução localhost

Alguns passos são necessários para executar localhost
1. Verificar as urls no arquivo `.env.development` e o a flag standalone deve estar como `true`
2. Verificar objetos iniciais do componente que devem ser "mockados" e estão em `mocks/` (`chatId` = seu telefone)
3. Executar `yarn start` e acessar [http://localhost:3000](http://localhost:3000)

In the project directory, you can run:

## Build

Para fazer a build e poder integrar com os projetos é necessário:
1. Limpar a pasta `build/` e executar `yarn build`
2. Copiar o conteúdo da pasta `build/` e colar no `tecsinapse-chat-api` na pasta específica de `assests`
3. Alterar os arquivos necessários que importam os bundles gerados lá no `tecsinapse-chat-api`
4. Fazer a compilição / release do `tecsinapse-chat-api` e utilizar nos projetos

Para gerar um build como biblioteca:
1. Executar o comando `yarn build-lib`

Para publicar um build da lib no nexus
1. Executar o comando `npm config set registry https://nexus.portaltecsinapse.com.br/repository/npm-private/`
2. Executar `npm login` informando o login: "developer", senha: "tecsinapse", email: "infra@tecsinapse.com.br"
3. Executar `npm publish`
4. Aguardar a finalização do processo de publicação.
5. Opctional: Para adicionar a lib em um projeto js, executar o seguinte comando: `yarn add @tecsinapse/chat-component --registry=https://nexus.portaltecsinapse.com.br/repository/npm-group/`