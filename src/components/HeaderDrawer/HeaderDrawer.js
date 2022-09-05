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
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { CDN_RESOURCES } from "../../constants/CDN_RESOURCES";
import { useStyle } from "./styles";
import { disableNotificationSound, enableNotificationSound } from "../utils";

export const HeaderDrawer = ({
  userkeycloakId,
  setOpenDrawer,
  notificationSound,
  setNotificationSound,
  view,
  setView,
}) => {
  const classes = useStyle();

  const handleOpenTips = () => {
    ReactGA.event({
      category: "CLICK_BTN_DICAS",
      label: "CLICK_BTN_DICAS",
      action: "View Chats Tips",
    });
    window.open(CDN_RESOURCES.TIPS, "_blank");
  };

  const handleBackMessageManegement = () => {
    setView(COMPONENT_LOCATION.MESSAGE_MANAGEMENT);
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

  return (
    <div className={classes.headerContainer}>
      <Grid justify="space-between" container>
        <Grid item>
          <Grid container>
            {view !== COMPONENT_LOCATION.MESSAGE_MANAGEMENT && (
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
                {view === COMPONENT_LOCATION.CHAT_MESSAGES &&
                  "Mensagens do Chat"}
                {view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT &&
                  "Gestão de Mensagens"}
                {view === COMPONENT_LOCATION.SEND_NOTIFICATION &&
                  "Iniciar Nova Conversa"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid spacing={1} alignItems="center" container>
            <Grid item>
              <img
                className={classes.wingoLogo}
                src={CDN_RESOURCES.WINGO_CHAT_LOGO}
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
            {view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT && (
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
