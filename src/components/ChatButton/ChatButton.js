import { Badge, CircularProgress, Tooltip } from "@material-ui/core";
import { FloatingButton } from "@tecsinapse/ui-kit";
import React from "react";
import { mdiForum } from "@mdi/js";
import Icon from "@mdi/react";
import { useStyle } from "./styles";

export const ChatButton = ({
  unreadTotal,
  firstLoad,
  setIsDrawerOpen,
}) => {
  const classes = useStyle();

  return (
    <div className={classes.fabContainer}>
      <Tooltip title="Mostrar Painel do Chat" arrow placement="left">
        <Badge
          color="error"
          badgeContent={unreadTotal}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          classes={{
            anchorOriginTopLeftRectangle: classes.badgeAlign,
          }}
        >
          <FloatingButton
            onClick={() => {
              if (!firstLoad) {
                setIsDrawerOpen(true);
              }
            }}
            variant="extended"
            className={classes.fab}
          >
            {firstLoad ? (
              <CircularProgress size={20} className={classes.fabProgress} />
            ) : (
              <Icon path={mdiForum} size={1} color="#7b4e00" />
            )}
          </FloatingButton>
        </Badge>
      </Tooltip>
    </div>
  );
};
