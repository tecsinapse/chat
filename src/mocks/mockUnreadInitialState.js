export const mockUnreadInitialState = {
  connectionKey: "mb-br",
  allChats: [
    {
      name: "João Paulo Bassinello",
      phone: "(19) 99456-8196",
      // Mobile João Bassinello
      chatId: '15859732-5c6d-4be2-a5f7-779c43de7784@tunnel.msging.net',
      // chatId: "15859732-5c6d-4be2-a5f7-779c43de7784@tunnel.msging.net",
      contactAt: "2020-05-04T12:58:54Z",
      highlighted: true,
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
