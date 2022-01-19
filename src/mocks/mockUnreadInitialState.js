export const mockUnreadInitialState = {
  connectionKeys: [{
    label: "SandBox Dev (Vendas)",
    value: "sandbox-dev",
    args: {
      SetorKey: "VENDAS",
      OutroValorKey: "OutroValor",
    },
  },
    {
      label: "SandBox Dev (Oficina)",
      value: "sandbox-dev",
      args: {
        SetorKey: "OFICINA",
        OutroValorKey: "OutroValor",
      },
    },],
  destination: "daf",
  allChats: [
    {
      connectionKey: "sandbox-dev",
      destination: "daf",
      name: "Catto",
      subName: null,
      phone: "(67) 99284-6268",
      chatId: "5567984115139",
      contactAt: "2020-11-05T17:53:39.869427",
      extraInfo: {
        responsavelId: "20",
        segmento: "Autos",
        dealerId: "1",
        dealer: "APPLAUSO TATUÍ",
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
      // highlighted: true,
      enabled: true,
      updateUnreadWhenOpen: true,
    },
    {
      connectionKey: "sandbox-dev",
      destination: "daf",
      name: "Denner",
      subName: null,
      phone: "(67) 99267-8000",
      chatId: "5567992678000",
      contactAt: "2020-11-05T17:53:39.869427",
      extraInfo: {
        responsavelId: "20",
        segmento: "Autos",
        dealerId: "1",
        dealer: "APPLAUSO TATUÍ",
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
    {
      connectionKey: "sandbox-dev",
      destination: "daf",
      name: "Livio",
      subName: null,
      phone: "(83) 99988-1699",
      chatId: "5583999881699",
      contactAt: "2020-11-05T17:52:39.869427",
      extraInfo: {
        responsavelId: "20",
        segmento: "Autos",
        dealerId: "1",
        dealer: "APPLAUSO TATUÍ",
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
  extraFields: [
    {
      key: "InputTest",
      label: "Descrição",
      type: "INPUT",
      value: "Descrevendo",
    },
  ],
  userNameById: {
    "5a102db0-d019-4580-a173-75a0ae47581f": "Operador 1",
    aaaa: "Operador 2",
  },
};
