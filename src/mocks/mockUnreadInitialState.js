export const mockUnreadInitialState = {
  connectionKeys: ["dynamo-vendas-homolog-zenvia"],
  destination: ["nissan"],
  allChats: [
    {
      connectionKey: "dynamo-vendas-homolog-zenvia",
      destination: "nissan",
      name: "João Paulo Bassinello",
      subName: "Operador",
      phone: "(19) 99456-8196",
      chatId: '5519994568196',
      contactAt: "2020-08-28T12:58:54Z",
      highlighted: false,
      minutesToBlock: 1430,
      updateUnreadWhenOpen: true,
      enabled: true,
      status: "OK",
      extraInfo: {
        responsavel: "Vendedor 01",
        dealer: "Applauso Tatuí",
        segmento: "Caminhão",
      },
      actions: [
        {
          label: "Link 1",
          path: "/link1",
        },
        {
          label: "Link 2",
          path: "/link2",
        },
      ],
    },
  ],
  extraInfoColumns: {
    responsavel: "Responsável",
    dealer: "Dealer",
    segmento: "Segmento",
  },
  userNameById: {
    '5a102db0-d019-4580-a173-75a0ae47581f': 'Operador 1',
    'aaaa': 'Operador 2'
  }
};
