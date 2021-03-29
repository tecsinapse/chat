import { Grid, Typography } from "@material-ui/core";
import Icon from "@mdi/react";
import { mdiChevronRight, mdiForum } from "@mdi/js";
import React from "react";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
/* eslint-disable jsx-a11y/click-events-have-key-events */
export const ItemDrawer = ({ classes, theme, setView }) => {
  const iconMargin = { marginTop: "3px" };
  const textWeight = { fontWeight: "bold" };
  const chevronStyles = { cursor: "pointer" };

  return (
    <div
      className={classes.messageManagementLinkContainer}
      onClick={() => setView(COMPONENT_LOCATION.MESSAGE_MANAGEMENT)}
    >
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Icon
                path={mdiForum}
                size={1}
                color={theme.palette.text.secondary}
                style={iconMargin}
              />
            </Grid>
            <Grid item>
              <Typography
                color="textPrimary"
                variant="body1"
                display="inline"
                style={textWeight}
              >
                Gestão de mensagens
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Icon
            color={theme.palette.text.primary}
            size={1}
            style={chevronStyles}
            path={mdiChevronRight}
          />
        </Grid>
      </Grid>
    </div>
  );
};
/* eslint-enable jsx-a11y/click-events-have-key-events */
