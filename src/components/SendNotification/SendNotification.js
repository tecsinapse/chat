import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {Input, Select, Snackbar} from "@tecsinapse/ui-kit";
import {Button, Grid, InputAdornment, Tooltip, Typography} from "@material-ui/core";
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
    textAlign: 'center',
  },
  previewText: {
    textAlign: 'center',
    display: 'block',
    width: '31vW'
  }
}));

const emptyTemplate = {
  label: 'Selecione',
  value: '',
  args: 0,
  argsDescription: []
};

export const SendNotification = ({chat, chatApiUrl, connectionKeys, destination}) => {
  const classes = useStyle();

  const [phoneNumber, setPhoneNumber] = useState(chat == null ? '' : chat.phone.replace(/[^0-9]/g, ""));
  const [selectedConnectionKey, setSelectedConnectionKey] = useState(chat == null ? '' : chat.connectionKey);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [args, setArgs] = useState([]);
  const [preview, setPreview] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState([]);
  const [availableTemplates, setAvailableTemplates] = useState([]);

  const availableConnectionKeys = [{
    label: 'Selecione',
    value: ''
  }];
  connectionKeys.forEach(c => availableConnectionKeys.push({
    label: c,
    value: c
  }));

  useEffect(() => {
    if (selectedConnectionKey !== '') {
      loadTemplates(selectedConnectionKey);
    }
  }, [selectedConnectionKey])

  const loadTemplates = (connectionKey) => {
    if (connectionKey === '') {
      setSelectedConnectionKey('');
      return;
    }
    defaultFetch(
      `${chatApiUrl}/api/chats/${connectionKey}/templates`,
      "GET",
      {}
    ).then(templates => {
      setTemplates(templates);
      const available = [emptyTemplate];
      templates.forEach(t => available.push({
        label: t.name,
        value: t.value
      }));
      setAvailableTemplates(available);
      setSelectedConnectionKey(connectionKey);
    });
  };

  const onSelectTemplate = (template) => {
    const selected = templates.filter(t => t.value === template)[0] || emptyTemplate;
    const argsArray = [];
    for (let i = 0; i < selected.args; i++) {
      argsArray.push('');
    }
    setArgs(argsArray);
    setSelectedTemplate(template);
    updatePreview(template, argsArray);
  }

  const setArg = (index, arg) => {
    const argsArray = [...args];
    argsArray[index] = arg;
    setArgs(argsArray);
    updatePreview(selectedTemplate, argsArray);
  }

  const getArgDescription = (index) => {
    return (templates.filter(t => t.value === selectedTemplate)[0] || emptyTemplate).argsDescription[index];
  }

  const updatePreview = (template, args) => {
    let prev = (templates.filter(t => t.value === template)[0] || emptyTemplate).template;
    for (let i = 0; i < args.length; i++) {
      if (args[i] !== '') {
        prev = prev.replace(`{{${i + 1}}}`, args[i]);
      }
    }
    setPreview(prev);
  }

  const canSend = phoneNumber !== ''
    && selectedTemplate !== ''
    && (args.length > 0 && args.filter(a => a !== '').length === args.length);

  const send = () => {
    setSending(true);
    defaultFetch(
      `${chatApiUrl}/api/chats/${selectedConnectionKey}/${destination}/notification/send`,
      "POST",
      {
        phoneNumber: phoneNumber,
        template: selectedTemplate,
        args: args
      }
    ).then(() => {
      setSuccess('Mensagem enviada');
      setTimeout(() => setSuccess(''), 4000);
      setError('');
      setPhoneNumber('');
      setArgs([]);
      setSelectedTemplate('');
      setPreview('');
      setSending(false);
    }).catch((err) => {
      console.log(err);
      if (err.status === 400) {
        setError(`Não foi possível enviar a mensagem. Verifique se o número ${phoneNumber} possui WhatsApp`);
      } else {
        setError('Ocorreu um problema ao enviar a mensagem');
      }
      setSuccess('');
      setTimeout(() => setError(''), 4000);
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
          <Grid item style={{zIndex: 9999999999}}>
            <Select
              value={selectedConnectionKey}
              options={availableConnectionKeys}
              onChange={loadTemplates}
              label="Origem"
              variant="web"
              fullWidth
            />
          </Grid>
          <Grid item>
            <Input
              name="phoneNumber"
              label="Número do Telefone"
              fullWidth
              value={phoneNumber}
              disabled={templates.length === 0}
              onBlur={() => {
                if (phoneNumber.length < 10) {
                  setPhoneNumber('');
                }
              }}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </Grid>
          <Grid item style={{zIndex: 999999999}}>
            <Select
              value={selectedTemplate}
              options={availableTemplates}
              onChange={onSelectTemplate}
              disabled={templates.length === 0}
              label="Template da Mensagem"
              variant="web"
              fullWidth
            />
          </Grid>
          {args.map((arg, index) =>
            <Grid item key={index}>
              <Input
                name={`args[${index}]`}
                label={getArgDescription(index)}
                fullWidth
                value={args[index]}
                onChange={e => setArg(index, e.target.value)}
              />
            </Grid>
          )}
          {preview !== '' &&
          <Grid item alignContent='center'>
            <Typography variant="caption">
              Mensagem:
            </Typography>
            <div className={classes.preview}>
              <span className={classes.previewText}>{preview}</span>
            </div>
          </Grid>
          }
          <div style={{textAlign: 'center'}}>
            {sending
              ? <Loading/>
              : <Button
                color="primary"
                variant="contained"
                disabled={!canSend}
                onClick={() => send()}>
                ENVIAR
              </Button>
            }
          </div>

          {success !== '' &&
          <Snackbar show variant="success">
            {success}
          </Snackbar>
          }

          {error !== '' &&
          <Snackbar show variant="error">
            {error}
          </Snackbar>
          }

        </Grid>
      </div>
    </>
  );
};
