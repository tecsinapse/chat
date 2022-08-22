import React, { useEffect, useState } from "react";
import { Button, Input, Select, Snackbar } from "@tecsinapse/ui-kit";
import { Grid, Tooltip, Typography } from "@material-ui/core";
import Icon from "@mdi/react";
import { mdiPlusBoxOutline } from "@mdi/js";
import ReactGA from "react-ga4";
import { Loading } from "../../utils/Loading";
import { useStyle } from "./styles";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { emptyTemplate } from "./utils";
import { getObjectToSetChat } from "../../utils/helpers";
import useSendNotification from "../../hooks/useSendNotification";
import { HeaderSendNotification } from "./HeaderSendNotification";
import {
  getCanSend,
  getConnectionKeyArgs,
  getName,
  loadTemplates,
  send,
} from "./functions";
import { MESSAGES_INFO } from "../../constants/MessagesInfo";

/* eslint-disable react/no-array-index-key */

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
  componentInfo,
  userId,
  userPhoneNumber,
}) => {
  const classes = useStyle();

  const [phoneNumber, setPhoneNumber] = useState(
    chat == null
      ? userPhoneNumber.replace(/[^0-9]/g, "")
      : chat.phone.replace(/[^0-9]/g, "")
  );
  const [selectedConnectionKey, setSelectedConnectionKey] = useState("");
  const [connectionKeyLabel, setConnectionKeyLabel] = useState("");
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
  const tooltipTitle = MESSAGES_INFO.MESSAGE_SUGESTION_TOOLTIP;

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

  connectionKeys.forEach((connectionKey) =>
    availableConnectionKeys.push({
      label: connectionKey.label,
      value: connectionKey.label,
    })
  );

  const handleSelectConnectionKey = (value) => {
    const connectionKey = connectionKeys.find((it) => it.label === value);

    if (connectionKey) {
      setConnectionKeyLabel(connectionKey.label);
      setSelectedConnectionKey(connectionKey.value);
    } else {
      setConnectionKeyLabel("Selecione");
      setSelectedConnectionKey("");
      onSelectTemplate("");
    }
  };

  const propsToLoadTamplates = {
    setSelectedConnectionKey,
    chatService,
    setAvailableTemplates,
    setTemplates,
  };

  useEffect(() => {
    if (selectedConnectionKey !== "") {
      loadTemplates(selectedConnectionKey, propsToLoadTamplates);
    }

    if (phoneNumber === "") {
      setPhoneNumber(auxInfo.phone);
    }
  }, [selectedConnectionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const updatePreview = (template, options) => {
    const tpt =
      templates.filter((t) => t.value === template)[0] || emptyTemplate;
    let prev = tpt.template;

    for (let i = 0; i < options.length; i++) {
      if (options[i] !== "") {
        prev = prev.replace(`{{${tpt.argsKeys[i]}}}`, options[i]);
      }
    }
    setPreview(prev);
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

  const getArgDescription = (index) =>
    (templates.filter((t) => t.value === selectedTemplate)[0] || emptyTemplate)
      .argsDescription[index];

  const canSend = getCanSend(phoneNumber, selectedTemplate, args);

  const successSend = async (chatId) => {
    const clientName = getName(chat, args, templates, selectedTemplate);

    setSuccess("Mensagem enviada");
    setTimeout(() => setSuccess(""), 4000);
    setError("");
    setPhoneNumber("");
    setArgs([]);
    setSelectedTemplate("");
    setPreview("");

    await reloadComponent();

    const objectToSetChat = await getObjectToSetChat(
      chatService,
      componentInfo,
      selectedConnectionKey,
      destination,
      chatId,
      clientName
    );

    setChat(objectToSetChat);
    setSending(false);

    setTimeout(() => setView(COMPONENT_LOCATION.CHAT), 4000);
  };

  const connectionKeyArgs = getConnectionKeyArgs(
    connectionKeys,
    connectionKeyLabel
  );

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
    connectionKeyArgs,
    customFields,
    userId,
  };

  const selectGridZIndex = { zIndex: 9999999999 };
  const inputGridZIndex = { zIndex: 1 };
  const selectFieldZIndex = { zIndex: 999999999 };
  const selectTemplateZIndex = { zIndex: 999999998, padding: "12px" };
  const sendButtonDivAlign = { textAlign: "center" };
  const url = `${process.env.REACT_APP_MESSAGE_SUGESTION_URL}?kcid=${userId}&connectionkey=${selectedConnectionKey}`;
  const styleProps = "&alignCenter=1&transparentBackground=1";

  const handleOpenMessageSugestion = () => {
    ReactGA.event({
      category: selectedConnectionKey,
      label: "CLICK_BTN_NOVO_MODELO_MSG",
      action: "Suggest Message Template",
    });
    window.open(`${url}${styleProps}`, "_blank");
  };

  return (
    <>
      <div className={classes.root}>
        <HeaderSendNotification />
        <Grid container spacing={2} direction="column">
          <Grid item style={selectGridZIndex}>
            <Select
              value={connectionKeyLabel}
              options={availableConnectionKeys}
              onChange={handleSelectConnectionKey}
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
                <Grid item key={`input-${index}`} style={inputGridZIndex}>
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
                <Grid item key={`select-${index}`} style={selectFieldZIndex}>
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
          <Grid
            container
            direction="row"
            style={selectTemplateZIndex}
            alignItems="center"
            justifyContent="space-between"
            spacing={3}
          >
            <Grid item xs={11}>
              <Select
                value={selectedTemplate}
                options={availableTemplates}
                onChange={onSelectTemplate}
                disabled={templates.length === 0 || !selectedConnectionKey}
                label="Modelo da Mensagem"
                variant="auto"
                fullWidth
              />
            </Grid>
            {selectedConnectionKey && (
              <Tooltip
                title={<Typography>{tooltipTitle}</Typography>}
                placement="bottom-start"
                arrow
              >
                <Icon
                  path={mdiPlusBoxOutline}
                  size={1.5}
                  color="#646464"
                  onClick={handleOpenMessageSugestion}
                />
              </Tooltip>
            )}
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
                maxLength={255}
              />
            </Grid>
          ))}
          {preview && (
            <Grid item>
              <Typography variant="caption">Mensagem:</Typography>
              <div className={classes.preview}>
                <span className={classes.previewText}>{preview}</span>
              </div>
            </Grid>
          )}
          <div style={sendButtonDivAlign}>
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
            <Snackbar show variant="success" onClose={() => setSuccess("")}>
              {success}
            </Snackbar>
          )}

          {error !== "" && (
            <Snackbar show variant="error" onClose={() => setError("")}>
              {error}
            </Snackbar>
          )}
        </Grid>
      </div>
    </>
  );
};
/* eslint-enable react/no-array-index-key */
