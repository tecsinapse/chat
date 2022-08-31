import React from "react";
import { FloatingButton, Button } from "@tecsinapse/ui-kit";
import Icon from "@mdi/react";
import { mdiMessageText } from "@mdi/js";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";

export const StartNewChatButton = ({
  view,
  classes,
  onStartSendNotification,
  theme,
  mobile,
}) => {
  const isChatView = view === COMPONENT_LOCATION.CHAT_MESSAGES;

  if (view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT || isChatView) {
    const style = {
      position: "fixed",
      bottom: isChatView || mobile ? 20 : 50,
      right: isChatView || mobile ? 20 : 60,
    };

    return (
      <FloatingButton
        variantFab="warning"
        onClick={() => onStartSendNotification()}
        style={style}
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

  const style1 = {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: "center",
  };

  return (
    <div className={classes.messageManagementNewChat} style={style1}>
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
