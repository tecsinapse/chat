import React from 'react';
import { ThemeProvider } from '@livechat/ui-kit';
import {
  defaultBlack,
  defaultGreyDark,
  defaultGreyLight4,
  defaultWhite,
} from '@tecsinapse/ui-kit';

const getTheme = (
  materialTheme,
  roundedCorners = true,
  containerHeight = '500px',
  headerBackground = false
) => ({
  AgentBar: {
    Avatar: {},
    css: {
      backgroundColor: headerBackground || materialTheme.palette.secondary.main,
      borderRadius: roundedCorners ? materialTheme.spacing(0.5, 0.5, 0, 0) : 0,
    },
  },
  FixedWrapperMaximized: {
    animationDuration: 100,
    height: containerHeight,
    css: {
      boxShadow: '0 0 1em rgba(0, 0, 0, 0.1)',
      borderRadius: roundedCorners ? materialTheme.spacing(1) : 0,
      position: 'inherit',
      right: 0,
      left: 0,
      width: '100%',
      padding: 0,
      margin: 0,
    },
  },
  FixedWrapperMinimized: {
    animationDuration: 100,
  },
  FixedWrapperRoot: {
    css: {
      position: 'inherit',
      right: 0,
      left: 0,
      top: 0,
      bottom: 0,
      padding: 0,
      margin: 0,
    },
  },

  Message: {
    own: {
      horizontalAlign: 'right',
      Bubble: {
        css: {
          backgroundColor: defaultGreyDark, // it is not materialized!
          boxShadow: `${materialTheme.spacing(
            0,
            1 / 6,
            1 / 3
          )} rgba(0,0,0,0.1)`,
          borderRadius: materialTheme.spacing(1, 0, 1, 1),
        },
      },
      Content: {
        css: {
          alignItems: 'flex-end',
        },
      },
      MessageMeta: {
        css: {
          textAlign: 'right',
        },
      },
    },
    // Not own message properties
    Bubble: {
      css: {
        backgroundColor: defaultWhite, // it is not materialized!
        borderRadius: materialTheme.spacing(0, 1, 1, 1),
      },
    },
    horizontalAlign: 'left',
  },
  MessageList: {
    css: {
      backgroundColor: defaultGreyLight4, // it is not materialized
      height: '100%',
    },
  },
  TextComposer: {
    inputColor: defaultBlack, // this is a color for text, but sounds like a color for background
    Icon: {
      css: {
        height: '26px',
        width: '24px',
      },
    },
    css: {
      borderRadius: roundedCorners ? materialTheme.spacing(0, 0, 0.5, 0.5) : 0,
    },
  },

  // Let unset the components that our chat is not using
  Avatar: {},
  Bubble: {},
  Button: {},
  ChatListItem: {
    Avatar: {},
  },
  QuickReply: {},
  TitleBar: {},
  MessageButtons: {},
  MessageGroup: {},
  MessageMedia: {},
  MessageText: {
    css: {
      padding: materialTheme.spacing(0.75, 0.75, 0.75, 0.75),
    },
  },
  MessageTitle: {},
});

const ChatTheme = ({
  children,
  materialTheme,
  roundedCorners,
  containerHeight,
  headerBackground,
}) => (
  <ThemeProvider
    theme={getTheme(
      materialTheme,
      roundedCorners,
      containerHeight,
      headerBackground
    )}
  >
    {children}
  </ThemeProvider>
);

export default ChatTheme;
