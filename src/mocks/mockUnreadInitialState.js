export const mockUnreadInitialState = {
  connectionKeys: ["sandbox-homolog"],
  destination: ["mercedes"],
  allChats: [
    {
      connectionKey: "sandbox-homolog",
      destination: "mercedes",
      name: "Denner",
      subName: null,
      phone: "(67) 99267-8000",
      chatId: "5567992678000",
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