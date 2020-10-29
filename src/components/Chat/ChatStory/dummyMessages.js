import uuidv1 from 'uuid/v1';
import { DELIVERY_STATUS } from '../constants';

export const dummyMessagesTextError = [
  {
    at: '02/03/2019 10:12',
    own: false,
    id: `${Date.now().toString()}0`,
    authorName: 'Felipe Rodrigues',
    text: 'Olá, tudo bem?!',
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:15',
    own: true,
    id: `${Date.now().toString()}1`,
    authorName: 'Você',
    text: 'Tudo sim!',
    status: 'read',
    statusDetails: [
      { status: 'sent', at: '2019-03-02 10:12:00' },
      { status: DELIVERY_STATUS.READ, at: '2019-03-02 10:22:02' },
    ],
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
    id: `${Date.now().toString()}3`,
    authorName: 'Você',
    text: 'Aloww?',
    status: DELIVERY_STATUS.REJECTED,
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}4`,
    authorName: 'Você',
    text: 'oiiiii!',
    status: 'not_delivered',
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}4`,
    authorName: 'Você',
    text: 'Que bom!',
    status: 'delivered',
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}4`,
    authorName: 'Você',
    text: 'Entendi!',
    status: 'sent',
    localId: uuidv1(),
  },
  {
    at: '02/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}4`,
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
    type: 'WHATSAPP',
    name: 'Telefone principal',
    phone: '(11) 33240-5566',
    lastMessage: 'Olá, me responde, a peça está disponível e qual a data?',
    unread: 10,
    lastMessageAt: '02/03/2019 10:14',
    chatId: 'dummy1@chatid',
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
    type: 'SKYPE',
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

export const dummyGroupedMessages = [
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
    at: '03/03/2019 10:14',
    own: true,
    id: `${Date.now().toString()}2`,
    authorName: 'Você',
    text: 'O que desaja solicitar ?',
    status: 'delivered',
    localId: uuidv1(),
  },
  {
    at: '03/03/2019 10:15',
    own: true,
    id: `${Date.now().toString()}2`,
    authorName: 'Você',
    text: 'Abraço!',
    status: 'delivered',
    localId: uuidv1(),
  },
];
