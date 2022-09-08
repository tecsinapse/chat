import React from "react";
import { CircularProgress } from "@material-ui/core";
import { useStyle } from "./styles";

export const WebSocketError = () => {
  const classes = useStyle();

  return (
    <div className={classes.container}>
      <CircularProgress size={60} />
    </div>
  );
};
