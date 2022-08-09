import React from "react";

export function MessageSugestion({ keycloakId, connectionKey }) {
  const url = `${process.env.REACT_APP_MESSAGE_SUGESTION_URL}?kcid=${keycloakId}&connectionkey=${connectionKey}`;
  const styleProps = "&alignCenter=1&hideTitle=1&transparentBackground=1";

  return (
    <iframe
      src={`${url}${styleProps}`}
      width="100%"
      height="640px"
      frameBorder="0"
      marginHeight="0"
      title="Novo Modelo de Mensagem"
      scrolling="no"
    />
  );
}
