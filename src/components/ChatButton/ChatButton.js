import { Badge, CircularProgress, Tooltip } from "@material-ui/core";
import { FloatingButton } from "@tecsinapse/ui-kit";
import React from "react";
import { mdiSquareEditOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useStyle } from "./styles";
import { COMPONENT_VIEW } from "../../constants/COMPONENT_VIEW";
import { LoadMetric } from "../LoadMetric/LoadMetric";

export const ChatButton = ({
  userkeycloakId,
  firstLoad,
  setOpenDrawer,
  view,
  setView,
  unreads,
  chatService,
}) => {
  const classes = useStyle();

  const handleOpenDrawer = () => {
    if (!firstLoad) {
      if (view === COMPONENT_VIEW.COMPONENT_INIT) {
        setView(COMPONENT_VIEW.MESSAGE_MANAGEMENT);
      }
      setOpenDrawer(true);
    }
  };

  return (
    <div className={classes.fabContainer}>
      <Tooltip title="Mostrar Painel do Chat" placement="left" arrow>
        <Badge
          color="error"
          badgeContent={unreads}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          classes={{
            anchorOriginTopLeftRectangle: classes.badgeAlign,
          }}
        >
          <FloatingButton
            onClick={handleOpenDrawer}
            variant="extended"
            className={classes.fab}
          >
            {firstLoad ? (
              <LoadMetric
                metricId={view}
                userkeyloakId={userkeycloakId}
                chatService={chatService}
              >
                <CircularProgress size={20} className={classes.fabProgress} />
              </LoadMetric>
            ) : (
              <Icon path={mdiSquareEditOutline} size={1} color="#7b4e00" />
            )}
          </FloatingButton>
        </Badge>
      </Tooltip>
    </div>
  );
};
