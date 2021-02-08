import React, { useEffect, useState } from "react";
import { Button, Input, Select, Snackbar } from "@tecsinapse/ui-kit";
import { Grid, Typography } from "@material-ui/core";
import { defaultFetch, noAuthJsonFetch } from "../../utils/fetch";
import { Loading } from "../../utils/Loading";
import { useStyle } from "./styles";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { cleanPhoneCharacters, emptyTemplate, formatPhone } from "./utils";

export const SendNotification = ({
  chat,
  chatApiUrl,
  connectionKeys,
  destination,
  createPath,
  extraFields,
  reloadComponent,
  setChat,
  setView,
  token,
}) => {
  const classes = useStyle();

  const [phoneNumber, setPhoneNumber] = useState(
    chat == null ? "" : chat.phone.replace(/[^0-9]/g, "")
  );
  const [selectedConnectionKey, setSelectedConnectionKey] = useState(
    chat == null ? "" : chat.connectionKey
  );
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [args, setArgs] = useState([]);
  const [preview, setPreview] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState([]);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [auxInfo, setAuxInfo] = useState({
    user: "",
    company: "",
    name: "",
    phone: phoneNumber,
  });

  useEffect(() => {
    const { extraInfo } = chat || {};
    setAuxInfo({
      user: extraInfo?.responsavel || "",
      company: extraInfo?.dealer || "",
      name: chat?.name || "",
      phone: phoneNumber,
    });

    if (extraFields) {
      setCustomFields(extraFields);
    }
  }, [chat, extraFields, phoneNumber]);

  const availableConnectionKeys = [
    {
      label: "Selecione",
      value: "",
    },
  ];
  connectionKeys.forEach((c) =>
    availableConnectionKeys.push({
      label: c,
      value: c,
    })
  );

  useEffect(() => {
    if (selectedConnectionKey !== "") {
      loadTemplates(selectedConnectionKey);
    }
    if (phoneNumber === "") {
      setPhoneNumber(auxInfo.phone);
    }
  }, [selectedConnectionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTemplates = (connectionKey) => {
    if (connectionKey === "") {
      setSelectedConnectionKey("");
      return;
    }
    defaultFetch(
      `${chatApiUrl}/api/chats/${connectionKey}/templates`,
      "GET",
      {}
    ).then((templates) => {
      setTemplates(templates);
      const available = [emptyTemplate];
      templates.forEach((t) =>
        available.push({
          label: t.name,
          value: t.value,
        })
      );
      setAvailableTemplates(available);
      setSelectedConnectionKey(connectionKey);
    });
  };

  const onSelectTemplate = (template) => {
    const selected =
      templates.filter((t) => t.value === template)[0] || emptyTemplate;
    const argsArray = [];
    for (let i = 0; i < selected.args; i++) {
      argsArray.push(auxInfo[selected.argsKeys[i]] || "");
    }
    setArgs(argsArray);
    setSelectedTemplate(template);
    updatePreview(template, argsArray);
  };

  const setArg = (index, arg) => {
    const argsArray = [...args];
    argsArray[index] = arg;
    setArgs(argsArray);
    updatePreview(selectedTemplate, argsArray);
  };

  const setCustomField = (index, value) => {
    const customFieldsArray = [...customFields];
    const customField = customFieldsArray[index];
    customField.value = value;
    customFieldsArray[index] = customField;
    setCustomFields(customFieldsArray);
  };

  const getArgDescription = (index) => {
    return (
      templates.filter((t) => t.value === selectedTemplate)[0] || emptyTemplate
    ).argsDescription[index];
  };

  const updatePreview = (template, args) => {
    let tpt = templates.filter((t) => t.value === template)[0] || emptyTemplate;
    let prev = tpt.template;
    for (let i = 0; i < args.length; i++) {
      if (args[i] !== "") {
        prev = prev.replace(`{{${tpt.argsKeys[i]}}}`, args[i]);
      }
    }
    setPreview(prev);
  };

  const canSend =
    phoneNumber !== "" &&
    selectedTemplate !== "" &&
    args.length > 0 &&
    args.filter((a) => a !== "").length === args.length;

  const successSend = () => {
    const name =
      chat?.name ||
      args[
        templates
          .find((e) => e.value === selectedTemplate)
          ?.argsKeys?.findIndex((i) => i === "name")
      ];
    const phone = cleanPhoneCharacters(phoneNumber);
    setChat({
      connectionKey: selectedConnectionKey,
      destination,
      chats: [
        {
          enabled: false,
          name,
          chatId: phone.startsWith("55") ? phone : `55${phone}`,
          updateUnreadWhenOpen: true,
          phone: formatPhone(phoneNumber),
        },
      ],
    });

    setSuccess("Mensagem enviada");
    setTimeout(() => setSuccess(""), 4000);
    setError("");
    setPhoneNumber("");
    setArgs([]);
    setSelectedTemplate("");
    setPreview("");
    reloadComponent();
    setSending(false);

    setTimeout(() => setView(COMPONENT_LOCATION.CHAT), 4000);
  };

  const send = () => {
    setSending(true);
    defaultFetch(
      `${chatApiUrl}/api/chats/${selectedConnectionKey}/${destination}/notification/send`,
      "POST",
      {
        phoneNumber: phoneNumber,
        template: selectedTemplate,
        args: args,
      }
    )
      .then(() => {
        if (process.env.NODE_ENV !== "development") {
          // call the product to create relationship between chat and client
          const fetchArgs = {};
          const argsKeys = (
            templates.filter((t) => t.value === selectedTemplate)[0] ||
            emptyTemplate
          ).argsKeys;
          for (let i = 0; i < argsKeys.length; i++) {
            fetchArgs[argsKeys[i]] = args[i];
          }
          for (let custom of customFields) {
            fetchArgs[custom.key] = custom.value;
          }

          noAuthJsonFetch(
            `${createPath}/${selectedConnectionKey}/${phoneNumber.replace(
              /[^0-9]/g,
              ""
            )}/create`,
            "POST",
            fetchArgs,
            token
          ).then(() => {
            successSend();
          });
        } else {
          successSend();
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.status === 400) {
          setError(
            `Não foi possível enviar a mensagem. Verifique se o número ${phoneNumber} possui WhatsApp`
          );
        } else {
          setError("Ocorreu um problema ao enviar a mensagem");
        }
        setSuccess("");
        setTimeout(() => setError(""), 4000);
        setSending(false);
      });
  };

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
                    style={{ fontWeight: "bold" }}
                  >
                    Insira as informações abaixo para iniciar a conversa
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <Grid container spacing={2} direction="column">
          <Grid item style={{ zIndex: 9999999999 }}>
            <Select
              value={selectedConnectionKey}
              options={availableConnectionKeys}
              onChange={loadTemplates}
              label="Origem"
              variant="auto"
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
                  setPhoneNumber("");
                }
              }}
              onChange={(e) => setPhoneNumber(e.target.value)}
              variantDevice="auto"
            />
          </Grid>
          {customFields.map((customField, index) => (
            <>
              {customField.type === "INPUT" && (
                <Grid item key={index} style={{ zIndex: 1 }}>
                  <Input
                    name={customField.key}
                    label={customField.label}
                    fullWidth
                    value={customField.value}
                    onChange={(e) => setCustomField(index, e.target.value)}
                    variantDevice="auto"
                  />
                </Grid>
              )}
              {customField.type === "SELECT" && (
                <Grid item key={index} style={{ zIndex: 999999999 }}>
                  <Select
                    value={customField.value}
                    options={customField.availableValues.map((v) => ({
                      label: v,
                      value: v,
                    }))}
                    onChange={(value) => setCustomField(index, value)}
                    label={customField.label}
                    variant="auto"
                    fullWidth
                  />
                </Grid>
              )}
            </>
          ))}
          <Grid item style={{ zIndex: 999999998 }}>
            <Select
              value={selectedTemplate}
              options={availableTemplates}
              onChange={onSelectTemplate}
              disabled={templates.length === 0}
              label="Template da Mensagem"
              variant="auto"
              fullWidth
            />
          </Grid>
          {args.map((arg, index) => (
            <Grid item key={index}>
              <Input
                name={`args[${index}]`}
                label={getArgDescription(index)}
                fullWidth
                value={args[index]}
                onChange={(e) => setArg(index, e.target.value)}
                variantDevice="auto"
              />
            </Grid>
          ))}
          {preview !== "" && (
            <Grid item alignContent="center">
              <Typography variant="caption">Mensagem:</Typography>
              <div className={classes.preview}>
                <span className={classes.previewText}>{preview}</span>
              </div>
            </Grid>
          )}
          <div style={{ textAlign: "center" }}>
            {sending ? (
              <Loading />
            ) : (
              <Button
                color="primary"
                variant="contained"
                disabled={!canSend}
                onClick={() => send()}
              >
                ENVIAR
              </Button>
            )}
          </div>

          {success !== "" && (
            <Snackbar show variant="success">
              {success}
            </Snackbar>
          )}

          {error !== "" && (
            <Snackbar show variant="error">
              {error}
            </Snackbar>
          )}
        </Grid>
      </div>
    </>
  );
};
