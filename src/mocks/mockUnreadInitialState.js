export const mockUnreadInitialState = {
  connectionKeys: ["novo-mundo-jaboatao"],
  destination: "vwco",
  allChats: [
    {
      connectionKey: "novo-mundo-jaboatao",
      destination: "vwco",
      name: "Gabriel",
      subName: null,
      phone: "(48) 99164-9441",
      chatId: "5548991649441",
      contactAt: "2020-11-05T17:53:39.869427",
      extraInfo: {
        responsavelId: "518",
        segmento: "Caminhão",
        dealerId: "19",
        dealer: "NOVO MUNDO - JABOATAO",
        segmentoId: "1",
        responsavel: "ALEXANDRE SAVIO GUEDES SOARES",
      },
      actions: [
        { label: "Cadastrar Cliente", path: "/p/crm/clientes/" },
        {
          label: "Associar Telefone a um Cliente",
          path: "/p/crm/clientes/telefone/associar",
        },
      ],
      // highlighted: true,
      enabled: true,
      updateUnreadWhenOpen: true,
    },
    {
      connectionKey: "novo-mundo-jaboatao",
      destination: "vwco",
      name: "Teste",
      subName: null,
      phone: "(48) 99999-99999",
      chatId: "5548999999999",
      contactAt: "2020-11-05T17:53:39.869427",
      extraInfo: {
        responsavelId: "518",
        segmento: "Caminhão",
        dealerId: "19",
        dealer: "NOVO MUNDO - JABOATAO",
        segmentoId: "1",
        responsavel: "ALEXANDRE SAVIO GUEDES SOARES",
      },
      actions: [
        { label: "Cadastrar Cliente", path: "/p/crm/clientes/" },
        {
          label: "Associar Telefone a um Cliente",
          path: "/p/crm/clientes/telefone/associar",
        },
      ],
      // highlighted: true,
      enabled: true,
      updateUnreadWhenOpen: true,
    },
  ],
  extraInfoColumns: {
    responsavel: "Responsável",
    dealer: "Dealer",
    segmento: "Segmento",
  },
  extraFields: [
    {
      key: "SelectTest",
      label: "Setor",
      type: "SELECT",
      availableValues: ["VENDAS", "POS VENDAS"],
      value: "POS VENDAS",
    },
    {
      key: "InputTest",
      label: "Descrição",
      type: "INPUT",
      value: "Descrevendo",
    },
  ],
  userNameById: {
    "56e2707f-d33b-4b10-a347-4ece57fc30c8": "Operador 1",
    aaaa: "Operador 2",
  },
};
