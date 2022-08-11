import { Badge, Grid, makeStyles, Typography } from "@material-ui/core";
import Icon from "@mdi/react";
import { mdiArrowLeft, mdiClose, mdiVolumeHigh, mdiVolumeOff } from "@mdi/js";
import React from "react";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { CDN_RESOURCES } from "../../constants/CDN_RESOURCES";
import { Button } from "@tecsinapse/ui-kit";

const useStyles = makeStyles(({ spacing }) => ({
  backIconStyles: { cursor: "pointer", marginLeft: "-8px" },
  closeIconStyles: { cursor: "pointer" },
  gridItemStyles: { marginRight: spacing(1) },
}));

export const HeaderDrawer = ({
  theme,
  classes,
  showBackButton,
  unreadTotal,
  setView,
  homeLocation,
  chatInitConfig,
  setIsDrawerOpen,
  view,
  onNotificationSoundChange,
  notificationSound,
}) => {
  const innerClasses = useStyles();

  const handleOpenTips = () => {
    window.open(CDN_RESOURCES.TIPS, "_blank");
  };

  return (
    <div className={classes.drawerHeader}>
      <Grid container justify="space-between">
        <Grid item>
          <Grid container>
            {showBackButton && (
              <Grid item className={innerClasses.gridItemStyles}>
                <Badge
                  color="error"
                  overlap="circle"
                  variant="dot"
                  badgeContent={unreadTotal}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                >
                  <Icon
                    onClick={() => setView(homeLocation)}
                    color={theme.palette.primary.main}
                    size={1.25}
                    className={innerClasses.backIconStyles}
                    path={mdiArrowLeft}
                  />
                </Badge>
              </Grid>
            )}
            <Grid item className={classes.titleContainer}>
              <Typography
                variant="h5"
                color="textPrimary"
                className={classes.title}
              >
                {view === COMPONENT_LOCATION.CHAT && chatInitConfig.onChatTitle}
                {view === COMPONENT_LOCATION.UNREAD && "Painel do Chat"}
                {view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT &&
                  "Gestão de Mensagens"}
                {view === COMPONENT_LOCATION.SEND_NOTIFICATION &&
                  "Iniciar Nova Conversa"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.drawerHeaderClose}>
          <Grid spacing={1} alignItems="center" container>
            <Grid item>
              <img
                id="logo-wingo"
                src={CDN_RESOURCES.WINGO_CHAT_LOGO}
                alt="wingo-logo"
              />
            </Grid>
            <Grid item>
              <Button onClick={handleOpenTips}>
                <Icon
                  color={theme.palette.primary.main}
                  size={0.8}
                  className={innerClasses.closeIconStyles}
                />
              </Button>
            </Grid>
            <Grid item>
              <Icon
                onClick={() => onNotificationSoundChange()}
                color={theme.palette.primary.main}
                size={0.8}
                className={innerClasses.closeIconStyles}
                path={notificationSound ? mdiVolumeHigh : mdiVolumeOff}
              />
            </Grid>
            <Grid item>
              <Icon
                onClick={() => setIsDrawerOpen(false)}
                color={theme.palette.primary.main}
                size={1.25}
                className={innerClasses.closeIconStyles}
                path={mdiClose}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};
//
// <HeaderDrawer
//   classes
//   showBackButton
//   theme
//   unreadTotal
//   setView
//   homeLocation
//   chatInitConfig
//   setIsDrawerOpen
//   view
// />;
