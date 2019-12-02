import uuidv1 from 'uuid/v1';

export const dummyMessagesTextError = [
  {
    at: '02/03/2019 10:12',
    own: false,
    id: `${Date.now().toString()}0`,
    authorName: 'Felipe Rodrigues',
    text: 'Olá, tudo bem?!',
    status: 'delivered',
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:15',
    own: true,
    id: `${Date.now().toString()}2`,
    authorName: 'Você',
    text: 'Tudo sim!',
    status: 'delivered',
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}2`,
    authorName: 'Você',
    text: 'O que desaja solicitar ?',
    status: 'error',
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}2`,
    authorName: 'Você',
    text: 'Abraço!',
    status: 'sending',
    localId: uuidv1(),
  },
];

export const dummyMessagesMedia = [
  {
    at: '02/03/2019 10:12',
    own: false,
    id: `${Date.now().toString()}0`,
    authorName: 'Felipe Rodrigues',
    status: 'delivered',
    localId: uuidv1(),
    medias: [
      {
        mediaType: 'image/png',
        url: 'http://www.invalidUrl123.com.br',
      },
    ],
  },
  {
    at: '02/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}2`,
    authorName: 'Você',
    localId: uuidv1(),
    medias: [
      {
        mediaType: 'image/png',
        url: 'http://www.invalidUrl123.com.br',
      },
    ],
    status: 'error',
  },
  {
    at: '02/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}2`,
    authorName: 'Você',
    localId: uuidv1(),
    medias: [
      {
        mediaType: 'image/png',
        url: 'http://www.invalidUrl123.com.br',
      },
    ],
    status: 'sending',
  },
];

export const dummyChatList = [
  {
    type: 'WHASTAPP',
    name: 'Telefone principal',
    phone: '(11) 33240-5566',
    lastMessage: 'Olá, me responde, a peça está disponível e qual a data?',
    unread: 10,
    lastMessageAt: '02/03/2019 10:14',
    chatId: 'bb7f1fe6-6a8e-4975-9b5f-20635673e542@tunnel.msging.net',
  },
  {
    type: 'TELEGRAM',
    name: 'Carlos Henrique - Decisor',
    phone: '(11) 99876-22332',
    lastMessage: 'Pode faturar a peça!',
    unread: 3,
    lastMessageAt: '02/03/2019 10:14',
    chatId: 'abc@tunnel.msging.net',
  },
  {
    type: 'WHASTAPP',
    name: 'Marcela Abrão - Gerente',
    phone: '(11) 99876-22222',
    lastMessage: 'Fechado!',
    unread: 0,
    lastMessageAt: '02/03/2019 10:14',
    chatId: '123@tunnel.msging.net',
  },
];

export const dummyMessagesText = [
  {
    at: '02/03/2019 10:12',
    own: false,
    id: `${Date.now().toString()}0`,
    authorName: 'Felipe Rodrigues',
    text: 'Olá, tudo bem?!',
    status: 'delivered',
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:15',
    own: true,
    id: `${Date.now().toString()}2`,
    authorName: 'Você',
    text: 'Tudo sim!',
    status: 'delivered',
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}2`,
    authorName: 'Você',
    text: 'O que desaja solicitar ?',
    status: 'delivered',
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}2`,
    authorName: 'Você',
    text: 'Abraço!',
    status: 'delivered',
    localId: uuidv1(),
  },
];
