export const mockUnreadInitialState = {
  connectionKey: "dynamo-applauso-tatui",
  destination: "nissan",
  allChats: [
    {
      name: "João Paulo Bassinello",
      subName: "Contato 123 - aaaa",
      phone: "(19) 99456-8196",
      // Mobile João Bassinello
      // chatId: '15859732-5c6d-4be2-a5f7-779c43de7784@tunnel.msging.net',
      chatId: '5519994568196',
      contactAt: "2020-05-04T12:58:54Z",
      highlighted: false,
      minutesToBlock: 1430,
      updateUnreadWhenOpen: true,
      enabled: true,
      status: "OK",
      extraInfo: {
        responsavel: "Vendedor 01",
        dealer: "Dealer XPTO",
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
    }
  ],
  extraInfoColumns: {
    responsavel: "Responsável",
    dealer: "Dealer",
    segmento: "Segmento",
  },
};
