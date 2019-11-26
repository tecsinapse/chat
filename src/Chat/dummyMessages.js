import uuidv1 from 'uuid/v1';

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
