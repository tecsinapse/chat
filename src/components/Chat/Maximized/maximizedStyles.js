import { makeStyles } from '@material-ui/styles';
import {
  defaultGrey2,
  defaultGreyLight5,
} from '@tecsinapse/ui-kit/build/utils/colors';

export const useStyle = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  at: {
    color: defaultGreyLight5,
    fontSize: '9px',
    letterSpacing: '-0.1px',
  },
  authorName: {
    color: defaultGrey2,
  },
  bubbleTransparent: {
    border: 'unset',
    borderRadius: 'unset',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    boxShadow: 'unset',
  },
  audio: {
    display: 'flex',
    padding: '5px',
  },
  progress: {
    width: '20px !important',
    height: '20px !important',
    color: 'black',
  },
  imageError: {
    opacity: '0.4',
  },
  emptyBubble: {
    width: '75px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    maxWidth: '300px',
    maxHeight: '200px',
    border: '1px solid black',
  },
  errorDiv: {
    backgroundColor: theme.palette.error.main,
    color: 'white',
    zIndex: 2,
    padding: '4px',
    boxShadow: '0 1px 1px grey',
    border: `1px solid ${theme.palette.error.main}`,
    position: 'absolute',
    display: 'flex',
    left: 0,
    right: 0,
    margin: '6px',
    alignItems: 'center',
    borderRadius: '6px 6px 6px 6px',
  },
  errorDivIcon: {
    padding: '6px',
    display: 'flex',
  },
  errorDivText: {
    flexGrow: '2',
    display: 'flex',
    alignItems: 'center',
  },
  imageMessage: {
    maxHeight: '200px',
  },
  messageRootInfo: {
    display: 'flex',
    justifyContent: 'center',
  },
  messageInfo: {
    border: 'none',
    borderRadius: '10px',
    boxShadow: 'none',
    margin: '10px 0px 10px',
    textAlign: 'center',
  },
  messageRootOwn: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  messageRootError: {
    marginRight: '-8px',
  },
  messageWithoutName: {
    marginTop: '0 !important',
  },
  messageWithoutDate: {
    marginBottom: '0 !important',
  },
  badgeNotification: {
    padding: 0,
  },
  contactListRoot: {
    padding: 0,
  },
  contactListName: {
    paddingBottom: '5px',
  },
  contactListMessage: {
    justifyContent: 'space-between',
  },
  contactListNotification: {
    height: '20px',
    width: '20px',
    borderRadius: '10px',
    backgroundColor: 'red',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    flexShrink: 0,
  },
  channelAvatar: {
    width: '40px',
    height: '40px',
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
    fontSize: '1.25rem',
    alignItems: 'center',
    flexShrink: '0',
    lineHeight: '1',
    userSelect: 'none',
    justifyContent: 'center',
  },
  messageStatusContainer: {
    lineHeight: '20px',
  },
  messageStatusAtContainer: {
    verticalAlign: 'top',
  },
  messageStatusIcon: {
    width: '15px',
    height: '15px',
    marginLeft: '5px',
  },
}));
