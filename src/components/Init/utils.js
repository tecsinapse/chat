export const loadComponentInfo = async ({
  chatService,
  productService,
  globalSearch,
  onlyNotClients,
  setLoading,
  setConnectionKeys,
  setDestination,
  setComponentInfo,
  setFirstLoad,
  page,
  pageSize,
}) => {
  setLoading(true);

  productService
    .loadComponentInfo(globalSearch, onlyNotClients, page, pageSize)
    .then((componentInfo) => {
      chatService
        .completeComponentInfo(componentInfo)
        .then((completeComponentInfo) => {
          const { connectionKeys, destination } = completeComponentInfo;
          setLoading(false);
          setDestination(destination);
          setConnectionKeys(getDistinctConnectionKeys(connectionKeys));
          setComponentInfo(completeComponentInfo);
          setFirstLoad(false);
        });
    });
};

export const getDistinctConnectionKeys = (connectionKeys) => {
  return connectionKeys
    .map((it) => it.value)
    .filter((it, index, self) => self.indexOf(it) === index);
};
