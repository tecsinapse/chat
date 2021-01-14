import { Badge, CircularProgress, Tooltip } from "@material-ui/core";
import { FloatingButton } from "@tecsinapse/ui-kit";
import React from "react";
import { makeStyles } from "@material-ui/styles";
import { defaultOrange } from "@tecsinapse/ui-kit/build/utils/colors";
import { mdiForum } from "@mdi/js";
import Icon from "@mdi/react";

const useStyle = makeStyles((theme) => ({
  fabContainer: {
    zIndex: "9999999999999",
    position: "fixed",
    right: 0,
    bottom: theme.spacing(2),
  },
  badgeAlign: {
    top: "7px",
    left: "7px",
  },
  fab: {
    borderRadius: "24px 0 0 24px",
    padding: 0,
    width: "48px",
    backgroundColor: defaultOrange,
  },
  fabProgress: {
    color: theme.palette.secondary.dark,
  },
}));

export const ChatButton = ({
  unreadTotal,
  isLoadingInitialState,
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
              if (!isLoadingInitialState) {
                setIsDrawerOpen(true);
              }
            }}
            variant="extended"
            className={classes.fab}
          >
            {isLoadingInitialState ? (
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
