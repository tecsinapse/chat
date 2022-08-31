import React from "react";
import { Grid, Typography } from "@material-ui/core";
import Icon from "@mdi/react";
import { mdiChevronRight, mdiForum } from "@mdi/js";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { useStyle } from "./styles";

export const MessageManagementLink = ({ setView }) => {
  const classes = useStyle();

  const handleLinkClick = () => {
    setView(COMPONENT_LOCATION.MESSAGE_MANAGEMENT);
  };

  return (
    <div className={classes.container}>
      <Grid
        justify="space-between"
        alignItems="center"
        onClick={handleLinkClick}
        container
      >
        <Grid item>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Icon path={mdiForum} size={1} className={classes.chatIcon} />
            </Grid>
            <Grid item>
              <Typography color="textPrimary" variant="body1" display="inline">
                <b>Gestão de mensagens</b>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Icon
            size={1}
            className={classes.chevronIcon}
            path={mdiChevronRight}
          />
        </Grid>
      </Grid>
    </div>
  );
};
