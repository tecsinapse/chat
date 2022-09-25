import React from "react";
import { Grid, Typography } from "@material-ui/core";
import Icon from "@mdi/react";
import {
  mdiArrowLeft,
  mdiClose,
  mdiVolumeHigh,
  mdiVolumeOff,
  mdiWhatsapp,
} from "@mdi/js";
import { Button } from "@tecsinapse/ui-kit";
import ReactGA from "react-ga4";
import { COMPONENT_VIEW } from "../../constants/COMPONENT_VIEW";
import { RESOURCES } from "../../constants/RESOURCES";
import { useStyle } from "./styles";
import { disableNotificationSound, enableNotificationSound } from "../utils";

export const HeaderDrawer = ({
  userkeycloakId,
  setOpenDrawer,
  setCurrentChatSend,
  notificationSound,
  setNotificationSound,
  view,
  setView,
  showBackButton,
}) => {
  const classes = useStyle();

  const handleOpenTips = () => {
    ReactGA.event({
      category: "CLICK_BTN_DICAS",
      label: "CLICK_BTN_DICAS",
      action: "View Chats Tips",
    });
    window.open(RESOURCES.TIPS, "_blank");
  };

  const handleBackMessageManegement = () => {
    setView(COMPONENT_VIEW.MESSAGE_MANAGEMENT);
    setCurrentChatSend(null);
  };

  const handleChangeNotificationSound = () => {
    if (notificationSound === true) {
      disableNotificationSound(userkeycloakId);
      setNotificationSound(false);
    } else {
      enableNotificationSound(userkeycloakId);
      setNotificationSound(true);
    }
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

  const checkShowBackButton = () => {
    // não tem para onde voltar
    if (view === COMPONENT_VIEW.MESSAGE_MANAGEMENT) {
      return false;
    }

    // não deixar voltar enquanto tem problema de conexão
    if (view === COMPONENT_VIEW.CONNECTION_ERROR) {
      return false;
    }

    return showBackButton;
  };

  return (
    <div className={classes.headerContainer}>
      <Grid justify="space-between" container>
        <Grid item>
          <Grid container>
            {checkShowBackButton() && (
              <Grid item className={classes.backIconContainer}>
                <Icon
                  onClick={handleBackMessageManegement}
                  size={1.25}
                  className={classes.backIcon}
                  path={mdiArrowLeft}
                />
              </Grid>
            )}
            <Grid item>
              <Typography variant="h5" color="textPrimary">
                {view === COMPONENT_VIEW.CHAT_MESSAGES && "Gestão de Mensagens"}
                {view === COMPONENT_VIEW.MESSAGE_MANAGEMENT &&
                  "Gestão de Mensagens"}
                {view === COMPONENT_VIEW.SEND_NOTIFICATION &&
                  "Iniciar Nova Conversa"}
                {view === COMPONENT_VIEW.CONNECTION_ERROR && "Conexão Perdida"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid spacing={1} alignItems="center" container>
            <Grid item>
              <img
                className={classes.wingoLogo}
                src={RESOURCES.WINGO_CHAT_LOGO}
                alt="Wingo Chat"
              />
            </Grid>
            <Grid item>
              <Icon
                onClick={handleChangeNotificationSound}
                path={notificationSound ? mdiVolumeHigh : mdiVolumeOff}
                className={classes.soundIcon}
                size={0.8}
              />
            </Grid>
            {view === COMPONENT_VIEW.MESSAGE_MANAGEMENT && (
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={handleOpenTips}
                >
                  <Icon path={mdiWhatsapp} color="white" size={0.8} />
                  <Typography>DICAS</Typography>
                </Button>
              </Grid>
            )}
            <Grid item>
              <Icon
                onClick={handleCloseDrawer}
                path={mdiClose}
                className={classes.closeIcon}
                size={1.25}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};
