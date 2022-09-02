export const getDistinctConnectionKeys = (connectionKeys) => {
  return connectionKeys
    .map((it) => it.value)
    .filter((it, index, self) => self.indexOf(it) === index);
};
