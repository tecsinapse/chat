import { Button } from "@material-ui/core";
import React from "react";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { FloatingButton } from "@tecsinapse/ui-kit";
import Icon from "@mdi/react";
import { mdiMessageText } from "@mdi/js";

export const StartNewChatButton = ({
  view,
  classes,
  onStartSendNotification,
  theme,
}) => {
  if (
    view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT ||
    view === COMPONENT_LOCATION.CHAT
  ) {
    return (
      <FloatingButton
        variantFab="warning"
        onClick={() => onStartSendNotification()}
        style={{ position: "fixed", bottom: 20, right: 20 }}
      >
        <Icon
          path={mdiMessageText}
          size={1}
          color="white"
          title="Iniciar nova conversa"
        />
      </FloatingButton>
    );
  }
  return (
    <div
      className={classes.messageManagementNewChat}
      style={{ marginTop: theme.spacing(2), textAlign: "center" }}
    >
      <Button
        color="secondary"
        variant="contained"
        onClick={() => onStartSendNotification()}
      >
        INICIAR NOVA CONVERSA
      </Button>
    </div>
  );
};
