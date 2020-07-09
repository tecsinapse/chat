import React, {useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {Input, Select, Snackbar} from "@tecsinapse/ui-kit";
import {Button, Grid, Typography,} from "@material-ui/core";
import {defaultFetch} from "../../utils/fetch";
import {Loading} from "../../utils/Loading";

const useStyle = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
  },
  header: {
    padding: theme.spacing(1, 0, 3 / 4, 0),
  },
  preview: {
    backgroundColor: '#ccc',
    display: 'block',
    fontFamily: 'monospace',
    margin: theme.spacing(1, 0),
    padding: theme.spacing(2),
  }
}));

export const SendNotification = ({templates = [], phone = '', chatApiUrl, connectionKey}) => {
  const classes = useStyle();

  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [args, setArgs] = useState([]);
  const [preview, setPreview] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const availableTemplates = [{
    label: 'Selecione',
    value: ''
  }];
  templates.forEach(t => availableTemplates.push({
    label: t.name,
    value: t.name
  }));

  const onSelectTemplate = (template) => {
    const selected = templates.filter(t => t.name === template)[0];
    const argsArray = [];
    for (let i = 0; i < selected.args; i++) {
      argsArray.push('');
    }
    setArgs(argsArray);
    setSelectedTemplate(template);
    updatePreview(template, args);
  }

  const setArg = (index, arg) => {
    const argsArray = [...args];
    argsArray[index] = arg;
    setArgs(argsArray);
    updatePreview(selectedTemplate, argsArray);
  }

  const updatePreview = (template, args) => {
    let prev = templates.filter(t => t.name === template)[0].template;
    for (let i = 0; i < args.length; i++) {
      prev = prev.replace(`{{${i + 1}}}`, args[i]);
    }
    setPreview(prev);
  }

  const canSend = () => {
    return phoneNumber !== ''
      && selectedTemplate !== ''
      && args.filter(a => a !== '').length === args.length;
  }

  const send = () => {
    setSending(true);
    defaultFetch(
      `${chatApiUrl}/api/chats/${connectionKey}/notification/send`,
      "POST",
      {
        phoneNumber: phoneNumber,
        template: selectedTemplate,
        args: args
      }
    ).then(() => {
      setSuccess('Mensagem enviada');
      setError('');
      setPhoneNumber('');
      setArgs([]);
      setPreview('');
      setSending(false);
    }).catch(() => {
      setSuccess('');
      setError('Ocorreu um problema ao enviar a mensagem');
      setSending(false);
    });
  }

  return (
    <>
      <div className={classes.root}>
        <div className={classes.header}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <Typography
                    color="textSecondary"
                    variant="body1"
                    display="inline"
                    style={{fontWeight: "bold"}}
                  >
                    Insira as informações abaixo para iniciar a conversa
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <Grid container spacing={2} direction="column">
          <Grid item>
            <Input
              name="phoneNumber"
              label="Número do Telefone"
              mask="cellphone"
              fullWidth
              value={phoneNumber}
              onBlur={() => {
                if (phoneNumber.length < 14) {
                  setPhoneNumber('');
                }
              }}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </Grid>
          <Grid item>
            <Select
              value={selectedTemplate}
              options={availableTemplates}
              onChange={onSelectTemplate}
              label="Template da Mensagem"
              variant="web"
              fullWidth
            />
          </Grid>
          {args.map((arg, index) =>
            <Grid item key={index}>
              <Input
                name={`args[${index}]`}
                label={`Parâmetro ${index + 1}`}
                fullWidth
                value={args[index]}
                onChange={e => setArg(index, e.target.value)}
              />
            </Grid>
          )}
          {preview !== '' &&
          <Grid item>
            <Typography variant="caption">
              Mensagem:
            </Typography>
            <div
              className={classes.preview}
              // eslint-disable-next-line
              dangerouslySetInnerHTML={{
                __html: `${preview}`
              }}
            />
          </Grid>
          }
          <div style={{textAlign: 'center'}}>
            {sending
              ? <Loading/>
              : <Button
                color="primary"
                variant="contained"
                disabled={canSend}
                onClick={() => send()}>
                ENVIAR
              </Button>
            }
          </div>

          {success !== '' &&
          <Snackbar show variant="success">
            ${success}
          </Snackbar>
          }

          {error !== '' &&
          <Snackbar show variant="error">
            ${error}
          </Snackbar>
          }

        </Grid>
      </div>
    </>
  );
};
