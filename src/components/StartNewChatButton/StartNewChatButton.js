import React from "react";
import { FloatingButton } from "@tecsinapse/ui-kit";
import Icon from "@mdi/react";
import { mdiMessageText } from "@mdi/js";
import { Tooltip } from "@material-ui/core";
import { useStyle } from "./styles";

export const StartNewChatButton = ({ handleStartSendNotification }) => {
  const classes = useStyle();

  return (
    <FloatingButton
      variantFab="warning"
      onClick={handleStartSendNotification}
      className={classes.floatingButton}
    >
      <Tooltip title="Iniciar nova conversa" placement="right-start" arrow>
        <Icon path={mdiMessageText} size={1} color="white" />
      </Tooltip>
    </FloatingButton>
  );
};