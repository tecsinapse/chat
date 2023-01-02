import { makeStyles } from '@material-ui/styles';

export const useStyle = makeStyles(() => ({
  blockedMessage: {
    background: '#f2f2f2',
    padding: '5px',
    borderRadius: '10px',
  },
  blockedMessageTitle: {
    display: 'flex',
    justifyContent: 'center',
    background: '#f2f2f2',
  },
  title: {
    padding: '0 5px',
    background: '#fff5c4',
    fontSize: '13px',
    borderRadius: '10px',
    color: '#303030',
  },
}));
