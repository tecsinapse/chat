import { Grid, Typography } from "@material-ui/core";
import Icon from "@mdi/react";
import { mdiChevronRight, mdiForum } from "@mdi/js";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import React from "react";

export const ItemDrawer = ({ classes, theme, setView }) => (
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
              style={{ marginTop: "3px" }}
            />
          </Grid>
          <Grid item>
            <Typography
              color="textPrimary"
              variant="body1"
              display="inline"
              style={{ fontWeight: "bold" }}
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
          style={{ cursor: "pointer" }}
          path={mdiChevronRight}
        />
      </Grid>
    </Grid>
  </div>
);
