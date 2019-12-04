import React from 'react';
import { AgentBar, Title, Subtitle, Row, Column } from '@livechat/ui-kit';
import { Typography, Badge } from '@material-ui/core';
import { mdiClose, mdiArrowLeft } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton as IconButtonMaterial } from '@tecsinapse/ui-kit/build/Buttons/IconButton';

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
}) => {
  const onCloseChatClicked = e => {
    if (onCloseChat) {
      onCloseChat(e);
    }
    minimize(e);
  };

  return (
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
                  color={theme.palette.primary.contrastText}
                />
              </Badge>
            </IconButtonMaterial>
          </Column>
        )}
        <Column flexFill>
          <Title>
            <Typography
              variant="h6"
              style={{ color: theme.palette.primary.contrastText }}
              noWrap
            >
              {title}
            </Typography>
          </Title>
          <Subtitle>
            <Typography
              variant="subtitle2"
              style={{ color: theme.palette.primary.contrastText }}
              noWrap
            >
              {subtitle}
            </Typography>
          </Subtitle>
        </Column>
        {hasCloseButton && (
          <Column style={{ justifyContent: 'center' }}>
            <IconButtonMaterial key="close" onClick={onCloseChatClicked}>
              <Icon
                path={mdiClose}
                size={1.0}
                color={theme.palette.primary.contrastText}
              />
            </IconButtonMaterial>
          </Column>
        )}
      </Row>
    </AgentBar>
  );
};

export default ChatHeader;
