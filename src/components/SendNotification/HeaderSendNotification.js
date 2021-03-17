import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { useStyle } from "./styles";
const classes = useStyle;
export const HeaderSendNotification = () => (
  <div className={classes.header}>
    <Grid container justify="space-between" alignItems="center">
      <Grid item>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Typography
              color="textSecondary"
              variant="body1"
              display="inline"
              style={{ fontWeight: "bold" }}
            >
              Insira as informações abaixo para iniciar a conversa
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </div>
);
