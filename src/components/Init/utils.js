export const getDistinctConnectionKeys = (connectionKeys) =>
  connectionKeys
    .map((it) => it.value)
    .filter((it, index, self) => self.indexOf(it) === index);
