import React from 'react';
import { storiesOf } from '@storybook/react';
import { muiTheme } from 'storybook-addon-material-ui';
import { createMuiTheme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import { mdiOneUp, mdiShieldHalfFull, mdiTurtle } from '@mdi/js';
import Icon from '@mdi/react';
import { makeStyles, styled, useTheme } from '@material-ui/styles';
import { GROUPS } from '../../../.storybook/hierarchySeparators';
import { AppBar } from './AppBar';

const StyledAppBar = styled(AppBar)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
});
const useStyles = makeStyles(({ spacing }) => ({
  div: {
    backgroundColor: 'white',
    alignSelf: 'stretch',
    display: 'flex',
  },
  flex: {
    alignItems: 'center',
    display: 'flex',
    padding: spacing(1),
  },
  image: {
    maxWidth: spacing(6),
  },
}));
const ExampleAppBar = () => {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <AppBar
      leftIcons={
        <div className={classes.div}>
          <div className={classes.flex}>
            <img
              src="https://www.tecsinapse.com.br/wp-content/themes/TecSinapse/assets/images/tecsinapse.svg"
              className={classes.image}
              alt="logo"
            />
          </div>
        </div>
      }
      title="Portal "
      subtitle="Tecsinapse"
      breadcrumbs={[
        {
          title: 'Portal',
          component: 'a',
        },
        {
          title: 'Usuários',
          component: 'a',
        },
        {
          title: 'Usuário',
          component: 'a',
        },
        {
          title: '#1234',
          component: 'a',
        },
      ]}
      rightIcons={
        <div>
          <IconButton color="inherit" aria-label="Abrir menu">
            <Icon
              path={mdiOneUp}
              color={theme.palette.primary.contrastText}
              size={1}
            />
          </IconButton>
          <IconButton color="inherit" aria-label="Abrir menu">
            <Icon
              path={mdiTurtle}
              color={theme.palette.primary.contrastText}
              size={1}
            />
          </IconButton>
        </div>
      }
    />
  );
};
storiesOf(`${GROUPS.MENU}|AppBar`, module)
  .addDecorator(muiTheme(createMuiTheme({ spacing: 12 })))
  .add('AppBar', () => <ExampleAppBar />)
  .add('Styled AppBar', () => (
    <StyledAppBar
      leftIcons={
        <div>
          <IconButton color="inherit" aria-label="Abrir menu">
            <Icon path={mdiShieldHalfFull} color="white" size={1} />
          </IconButton>
        </div>
      }
      title="Portal "
      subtitle="Tecsinapse"
      breadcrumbs={[
        {
          title: 'Portal',
          component: 'a',
        },
        {
          title: 'Usuários',
          component: 'a',
        },
        {
          title: 'Usuário',
          component: 'a',
        },
        {
          title: '#1234',
          component: 'a',
        },
      ]}
      rightIcons={
        <div>
          <IconButton color="inherit" aria-label="Abrir menu">
            <Icon path={mdiOneUp} color="white" size={1} />
          </IconButton>
          <IconButton color="inherit" aria-label="Abrir menu">
            <Icon path={mdiTurtle} color="white" size={1} />
          </IconButton>
        </div>
      }
    />
  ));
