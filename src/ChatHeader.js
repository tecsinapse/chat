import React, { useEffect, useState } from 'react';
import { AgentBar, Column, Row, Subtitle, Title } from '@livechat/ui-kit';
import { Badge, makeStyles, Typography } from '@material-ui/core';
import { mdiArrowLeft, mdiClose, mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton as IconButtonMaterial } from '@tecsinapse/ui-kit/build/Buttons/IconButton';
import { isStringNotBlank } from '@tecsinapse/es-utils/build/object';
import { Warning } from './Warning';

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
  showError,
  setShowError,
  errorMessage,
  warningMessage,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  useEffect(() => {
    setShowWarning(
      isBlocked ||
        (showError && isStringNotBlank(errorMessage)) ||
        isStringNotBlank(warningMessage)
    );
  }, [isBlocked, showError, warningMessage, errorMessage]);

  const handleWarning = state => {
    setShowWarning(state);
    setShowError(state);
  };

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

  return (
    <>
      <AgentBar>
        <Row flexFill>
          {onBackward && (
            <Column style={{ justifyContent: 'center' }}>
              <IconButtonMaterial
                key="close"
                onClick={onBackward}
                style={{
                  marginLeft: theme.spacing(-1),
                }}
              >
                <Badge
                  badgeContent={notificationNumber}
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
          <Column style={{ justifyContent: 'center' }}>
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
      {showWarning && (
        <Warning
          setWarning={handleWarning}
          message={{ errorMessage, warningMessage }}
          isBlocked={isBlocked}
          isError={showError}
        />
      )}
    </>
  );
};

export default ChatHeader;
