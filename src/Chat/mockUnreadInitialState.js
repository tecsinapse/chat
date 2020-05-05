export const mockUnreadInitialState = {
  connectionKey: 'dyn-bot',
  allChats: [
    {
      name: "João Paulo Bassinello",
      phone: "ASSISTENTE - (19) 99456-8196",
      // Mobile João Bassinello
      chatId: "ee4011bc-1fab-439e-a35a-18eb92ec3afc@tunnel.msging.net",
      contactAt: '2020-05-04T12:58:54Z',
      highlighted: true,
      hoursToBlock: 5,
      extraInfo: {
        responsavel: 'Vendedor 01',
        dealer: 'Dealer XPTO',
        segmento: 'Caminhão',
      }
    },
    {
      name: "João Paulo Bassinello",
      phone: "ASSISTENTE - (19) 99456-8196",
      // Mobile João Bassinello
      chatId: "ee4011bc-1fab-439e-a35a-18eb92ec3afc@tunnel.msging.net",
      contactAt: '2020-05-04T12:58:54Z',
      highlighted: false,
      hoursToBlock: 5,
      extraInfo: {
        responsavel: 'Vendedor 01',
        dealer: 'Dealer XPTO',
        segmento: 'Caminhão',
      }
    },
  ],
  extraInfoColumns: {
    responsavel: 'Responsável',
    dealer: 'Dealer',
    segmento: 'Segmento',
  },
  actionLinks: [
    {
      label: 'Link 1',
      path: '/link1'
    },
    {
      label: 'Link 2',
      path: '/link2'
    },
  ]
};
