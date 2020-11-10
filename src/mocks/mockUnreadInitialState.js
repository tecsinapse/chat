export const mockUnreadInitialState = {
  connectionKeys: ["ts-chat-dev"],
  destination: ["nissan"],
  allChats: [
    {
      connectionKey: "ts-chat-dev",
      destination: "nissan",
      name: "Mauricio",
      subName: null,
      phone: "(48)99901-2888",
      chatId: "5548999012888",
      contactAt: "2020-11-05T17:53:39.869427",
      extraInfo: {
        responsavelId: "20",
        segmento: "Autos",
        dealerId: "1",
        dealer: "APPLAUSO TATUÍ FIAT",
        segmentoId: "1",
        responsavel: "Gleici Franco Coelho Fidelis",
      },
      actions: [
        { label: "Cadastrar Cliente", path: "/p/crm/clientes/" },
        {
          label: "Associar Telefone a um Cliente",
          path: "/p/crm/clientes/telefone/associar",
        },
      ],
      highlighted: true,
      enabled: true,
      updateUnreadWhenOpen: true,
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
