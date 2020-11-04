export const mockUnreadInitialState = {
  connectionKeys: ["dynamo-vendas-homolog-zenvia"],
  destination: ["nissan"],
  allChats: [
    {
      connectionKey: "dynamo-vendas-homolog-zenvia",
      destination: "nissan",
      name: "Denner",
      subName: "Operador",
      phone: "(67) 99267-8000",
      chatId: "5567992678000",
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
    "5a102db0-d019-4580-a173-75a0ae47581f": "Operador 1",
    aaaa: "Operador 2",
  },
};
