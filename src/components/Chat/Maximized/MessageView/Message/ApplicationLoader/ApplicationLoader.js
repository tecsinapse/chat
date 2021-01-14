import React from 'react';

import { mdiFile, mdiDownload } from '@mdi/js';
import { Avatar } from '@material-ui/core';

import Icon from '@mdi/react';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/styles';

import { IconButton as IconButtonMaterial } from '@tecsinapse/ui-kit';
import {
  defaultGreyDark,
  defaultWhite,
} from '@tecsinapse/ui-kit/build/utils/colors';

const useStyle = size =>
  makeStyles(theme => ({
    appRoot: {
      padding: 0,
    },
    appItem: {
      paddingTop: size ? 0 : undefined,
      paddingBottom: size ? 0 : undefined,
      paddingLeft: theme.spacing(0.75),
    },
    appMediaName: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
    appIconDownload: {
      right: 0,
    },
  }));

export const ApplicationLoader = ({ message, media }) => {
  const classes = useStyle(media.size)();

  return (
    <List className={classes.appRoot}>
      <ListItem className={classes.appItem}>
        <ListItemAvatar>
          <Avatar>
            <Icon
              path={mdiFile}
              size={1.0}
              color={message.own ? defaultWhite : defaultGreyDark}
            />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={media.name}
          secondary={media.size && `${media.size} Kb`}
          className={classes.appMediaName}
        />
        <ListItemSecondaryAction className={classes.appIconDownload}>
          <a
            href={media.url}
            download={media.name}
            target="_blank"
            rel="noreferrer"
          >
            <IconButtonMaterial aria-label="download">
              <Icon
                path={mdiDownload}
                size={1.2}
                color={message.own ? defaultWhite : defaultGreyDark}
              />
            </IconButtonMaterial>
          </a>
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
};
export default ApplicationLoader;
