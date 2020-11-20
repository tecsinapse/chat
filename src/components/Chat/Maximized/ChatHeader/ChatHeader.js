import React from 'react';
import { AgentBar, Column, Row, Subtitle, Title } from '@livechat/ui-kit';
import { Badge, makeStyles, Typography } from '@material-ui/core';
import { mdiArrowLeft, mdiClose, mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton as IconButtonMaterial } from '@tecsinapse/ui-kit';
import { Warning } from '../Warning/Warning';

const useStyle = makeStyles(({ palette }) => ({
  headerLabelStyle: {
    color: ({ headerText }) => headerText || palette.primary.contrastText,
    fontSize: '11px',
  },
  titleStyle: {
    color: ({ headerText }) => headerText || palette.primary.contrastText,
    fontSize: '19px',
  },
  subtitleStyle: {
    color: ({ headerText }) => headerText || palette.primary.contrastText,
    fontSize: '13px',
    letterSpacing: '-0.2px',
  },
}));

export const ChatHeader = ({
  minimize,
  hasCloseButton = true,
  title,
  subtitle,
  onCloseChat,
  theme,
  onBackward,
  notificationNumber,
  classes,
  chatOptions,
  headerLabel,
  headerText = false,
  isBlocked,
  errorMessage,
  warningMessage,
  backAction,
}) => {
  const {
    show: showChatOptions,
    color: chatOptionsColor,
    handleFunc: chatOptionsFunc,
  } = chatOptions;

  const headerClasses = useStyle({ headerText });
  const onCloseChatClicked = e => {
    if (onCloseChat) {
      onCloseChat(e);
    }
    minimize(e);
  };

  const style = { justifyContent: 'center' };
  const style1 = {
    marginLeft: theme.spacing(-1),
  };
  const style2 = { justifyContent: 'center' };

  return (
    <>
      <AgentBar>
        <Row flexFill>
          {onBackward && (
            <Column style={style}>
              <IconButtonMaterial
                key="close"
                onClick={onBackward}
                style={style1}
              >
                <Badge
                  badgeContent={backAction ? 0 : notificationNumber}
                  color="error"
                  classes={{
                    badge: classes.badgeNotification,
                  }}
                >
                  <Icon
                    path={mdiArrowLeft}
                    size={1.0}
                    color={chatOptionsColor}
                  />
                </Badge>
              </IconButtonMaterial>
            </Column>
          )}
          <Column flexFill>
            <Title>
              {headerLabel && (
                <Typography className={headerClasses.headerLabelStyle}>
                  {headerLabel}
                </Typography>
              )}
              <Typography
                variant="h6"
                className={headerClasses.titleStyle}
                noWrap
              >
                {title}
              </Typography>
            </Title>
            <Subtitle>
              <Typography
                variant="subtitle2"
                className={headerClasses.subtitleStyle}
                noWrap
              >
                {subtitle}
              </Typography>
            </Subtitle>
          </Column>
          <Column style={style2}>
            {showChatOptions && (
              <IconButtonMaterial key="close" onClick={chatOptionsFunc}>
                <Icon
                  path={mdiDotsVertical}
                  size={1.0}
                  color={chatOptionsColor}
                />
              </IconButtonMaterial>
            )}
            {hasCloseButton && (
              <IconButtonMaterial key="close" onClick={onCloseChatClicked}>
                <Icon path={mdiClose} size={1.0} color={chatOptionsColor} />
              </IconButtonMaterial>
            )}
          </Column>
        </Row>
      </AgentBar>
      <Warning
        errorMessage={errorMessage}
        warningMessage={warningMessage}
        isBlocked={isBlocked}
      />
    </>
  );
};

export default ChatHeader;
