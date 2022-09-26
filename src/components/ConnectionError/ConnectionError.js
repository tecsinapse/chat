import React from "react";
import { mdiConnection } from "@mdi/js";
import Icon from "@mdi/react";
import { Typography } from "@material-ui/core";
import { useStyle } from "./styles";

export const ConnectionError = () => {
  const classes = useStyle();

  return (
    <div className={classes.container}>
      <Icon className={classes.messageIcon} path={mdiConnection} size={2} />
      <Typography variant="body1">
        A conexão com o Wingo Chat foi perdida.
        <br />
        Atualize a página ou aguarde alguns minutos.
      </Typography>
      <Typography variant="caption">
        Caso a mensagem persista, entre em contato através da nossa
        <br />
        Central de Relacionamento HELPTEC.
      </Typography>
    </div>
  );
};