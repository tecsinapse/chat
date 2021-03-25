import React, { useEffect, useState } from "react";
import { Button, Input, Select, Snackbar } from "@tecsinapse/ui-kit";
import { Grid, Typography } from "@material-ui/core";
import { Loading } from "../../utils/Loading";
import { useStyle } from "./styles";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { cleanPhoneCharacters, emptyTemplate } from "./utils";
import useSendNotification from "../../hooks/useSendNotification";
import { HeaderSendNotification } from "./HeaderSendNotification";
import {
  send,
  loadTemplates,
  getName,
  getObjectToSetChat,
  getCanSend,
} from "./functions";

export const SendNotification = ({
  chat,
  chatApiUrl,
  connectionKeys,
  destination,
  createPath,
  productService,
  chatService,
  info,
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
  useSendNotification(
    chat,
    phoneNumber,
    extraFields,
    info,
    setCustomFields,
    setAuxInfo
  );

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
      loadTemplates(selectedConnectionKey, propsToLoadTamplates);
    }
    if (phoneNumber === "") {
      setPhoneNumber(auxInfo.phone);
    }
  }, [selectedConnectionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const propsToLoadTamplates = {
    setSelectedConnectionKey,
    chatService,
    setAvailableTemplates,
    setTemplates,
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

  const canSend = getCanSend(phoneNumber, selectedTemplate, args);

  const successSend = () => {
    const name = getName(chat, args, templates, selectedTemplate);
    const phone = cleanPhoneCharacters(phoneNumber);
    const objectToSetChat = getObjectToSetChat(
      selectedConnectionKey,
      destination,
      phone,
      phoneNumber,
      name
    );
    console.log("objectToSetChat ", objectToSetChat);
    setChat(objectToSetChat);

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

  const propsToSend = {
    chatApiUrl,
    selectedConnectionKey,
    destination,
    phoneNumber,
    selectedTemplate,
    templates,
    createPath,
    productService,
    chatService,
    successSend,
    token,
    setSending,
    setError,
    setSuccess,
    args,
    customFields,
  };

  return (
    <>
      <div className={classes.root}>
        <HeaderSendNotification />
        <Grid container spacing={2} direction="column">
          <Grid item style={{ zIndex: 9999999999 }}>
            <Select
              value={selectedConnectionKey}
              options={availableConnectionKeys}
              onChange={(connectionKey) =>
                loadTemplates(connectionKey, propsToLoadTamplates)
              }
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
            <React.Fragment key={`fragment-${index}`}>
              {customField.type === "INPUT" && (
                <Grid item key={`input-${index}`} style={{ zIndex: 1 }}>
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
                <Grid
                  item
                  key={`select-${index}`}
                  style={{ zIndex: 999999999 }}
                >
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
            </React.Fragment>
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
            <Grid item key={`key-${index}`}>
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
            <Grid item>
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
                onClick={() => send(propsToSend)}
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
