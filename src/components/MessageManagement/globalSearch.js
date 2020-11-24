import React from "react";

const normalize = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-[\]{}()*+?.,\\^$|#]/g, " ")
    .toLowerCase();
};

const split = (str, indexes, size) => {
  const result = [];
  let currentIndex = 0;

  indexes.forEach((index) => {
    result.push(str.substring(currentIndex, index));
    result.push(str.substring(index, index + size));
    currentIndex = index + size;
  });

  result.push(str.substring(currentIndex, str.length));

  return result.filter((e) => e);
};

export const matcher = (search, textToReplace) => {
  const s = normalize(search);
  const tx = normalize(textToReplace);

  const r = new RegExp(`(${s})`, "g");
  return Array.from(tx.matchAll(r));
};

const replacer = (search, textToReplace) => {
  const s = normalize(search);
  const matchs = matcher(search, textToReplace);

  if (matchs.length <= 0) {
    return textToReplace;
  }

  const indexes = matchs.map((match) => match.index);
  const splited = split(textToReplace, indexes, search.length);

  return splited.map((m, idx) =>
    normalize(m) === s ? (
      <span
        key={`highlight-${m}${idx}`}
        id={`highlight-${m}`}
        style={{ backgroundColor: "#ffb74d" }}
      >
        {m}
      </span>
    ) : (
      <>{m}</>
    )
  );
};

export const highlight = (searchQuery, text) => {
  if (text && searchQuery) {
    return replacer(searchQuery, text);
  }

  return text;
};
