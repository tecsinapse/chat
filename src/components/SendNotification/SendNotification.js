import React, { useEffect, useState } from "react";
import { Button, IconButton, Input, Select } from "@tecsinapse/ui-kit";
import { Box, ButtonGroup, Grid, Tooltip, Typography } from "@material-ui/core";
import Icon from "@mdi/react";
import { mdiPlusBoxOutline } from "@mdi/js";
import ReactGA from "react-ga4";
import { Loading } from "../../utils/Loading";
import { useStyle } from "./styles";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { getObjectToSetChat } from "../../utils/helpers";
import { getConnectionKeyArgs, getName } from "./functions";
import { MESSAGES_INFO } from "../../constants/MessagesInfo";

export const SendNotification = ({
  chat,
  chatApiUrl,
  connectionKeys,
  destination,
  createPath,
  productService,
  chatService,
  currentChat,
  reloadComponent,
  setChat,
  setView,
  token,
  userkeycloakId,
  userNamesById,
}) => {
  const classes = useStyle();

  const [phoneNumber, setPhoneNumber] = useState(
    currentChat ? currentChat.phone.replace(/[^0-9]/g, "") : ""
  );

  const [selectedConnectionKey, setSelectedConnectionKey] = useState(null);
  const [connectionKeyLabel, setConnectionKeyLabel] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [templateArgs, setTemplateArgs] = useState([]);
  const [previewText, setPreviewText] = useState(null);
  const [previewButtons, setPreviewButtons] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState([]);
  const [customFields, setCustomFields] = useState([]);

  const tooltipTitle = MESSAGES_INFO.MESSAGE_SUGESTION_TOOLTIP;

  const availableConnectionKeys = [
    {
      label: "Selecione...",
      value: null,
    },
  ];

  connectionKeys &&
    connectionKeys.forEach((it) =>
      availableConnectionKeys.push({
        label: it.label,
        value: it.label,
      })
    );

  const availableTemplates = [
    {
      label: "Selecione...",
      value: null,
    },
  ];

  templates &&
    templates.forEach((it) =>
      availableTemplates.push({
        label: it.name,
        value: it.value,
      })
    );

  const handleChangeConnectionKey = (value) => {
    const connectionKey = connectionKeys.find((it) => it.label === value);

    if (connectionKey) {
      setSelectedTemplate(null);
      setSelectedConnectionKey(connectionKey);
      setLoading(true);

      chatService.getAllTampletes(connectionKey.value).then((templates) => {
        setTemplates(templates);
        setLoading(false);
      });
    } else {
      setSelectedTemplate(null);
      setTemplateArgs([]);
      setSelectedConnectionKey(null);
      setTemplates([]);
    }
  };

  useEffect(() => {
    if (!selectedTemplate) {
      setTemplateArgs([]);
      return;
    }

    const templateArgs = [];

    for (let i = 0; i < selectedTemplate.args; i++) {
      if (selectedTemplate.argsKeys[i] === "1") {
        templateArgs.push(currentChat?.name || "");
      } else if (selectedTemplate.argsKeys[i] === "2") {
        templateArgs.push(userNamesById[userkeycloakId] || "");
      } else if (selectedTemplate.argsKeys[i] === "3") {
        templateArgs.push(selectedConnectionKey?.args["DealerName"] || "");
      } else {
        templateArgs.push("");
      }
    }

    setTemplateArgs(templateArgs);
  }, [selectedTemplate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedTemplate) {
      setPreviewText(null);
      setPreviewButtons([]);
      return;
    }

    let {
      template: previewText,
      buttonsDescription: previewButtons,
    } = selectedTemplate;

    for (let i = 0; i < templateArgs.length; i++) {
      if (templateArgs[i]) {
        previewText = previewText.replaceAll(
          `{{${selectedTemplate.argsKeys[i]}}}`,
          templateArgs[i]
        );
      }
    }

    setPreviewButtons(previewButtons);
    setPreviewText(previewText);
  }, [templateArgs]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangePhoneNumber = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleChangeTemplate = (value) => {
    const template = templates.find((it) => it.value === value);
    setSelectedTemplate(template);
  };

  const handleChangeTemplateArg = (index) => (event) => {
    const newTemplateArgs = [...templateArgs];
    newTemplateArgs[index] = event.target.value;
    setTemplateArgs(newTemplateArgs);
  };

  const successSend = async (chatId) => {
    const clientName = getName(chat, templateArgs, templates, selectedTemplate);

    setSuccess("Mensagem enviada");
    setTimeout(() => setSuccess(""), 4000);
    setError("");
    setPhoneNumber("");
    setTemplateArgs([]);
    setSelectedTemplate("");
    setPreviewText("");

    const newComponentInfo = await reloadComponent();

    const objectToSetChat = await getObjectToSetChat(
      chatService,
      newComponentInfo,
      selectedConnectionKey,
      destination,
      chatId,
      clientName
    );

    setChat(objectToSetChat);

    setTimeout(() => setView(COMPONENT_LOCATION.CHAT_MESSAGES), 4000);
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
    //setSending,
    setError,
    setSuccess,
    args: templateArgs,
    connectionKeyArgs,
    customFields,
    userId: userkeycloakId,
  };

  const handleOpenMessageSugestion = () => {
    ReactGA.event({
      category: selectedConnectionKey,
      label: "CLICK_BTN_NOVO_MODELO_MSG",
      action: "Suggest Message Template",
    });
    const messageSugestionUrl = `${process.env.REACT_APP_MESSAGE_SUGESTION_URL}?kcid=${userkeycloakId}&connectionkey=${selectedConnectionKey}&alignCenter=1&transparentBackground=1`;
    window.open(`${messageSugestionUrl}`, "_blank");
  };

  return (
    <div className={classes.container}>
      {loading ? (
        <div className={classes.loadingContainer}>
          <Loading />
        </div>
      ) : (
        <div className={classes.sendContainer}>
          <Grid spacing={1} direction="column" container>
            <Grid className={classes.connectionKeys} item>
              <Select
                value={selectedConnectionKey?.label} // usar label
                options={availableConnectionKeys}
                onChange={handleChangeConnectionKey}
                disabled={submitting}
                label="Origem"
                variant="auto"
                fullWidth
              />
            </Grid>
            <Grid item>
              <Input
                name="phoneNumber"
                label="Número do Telefone"
                value={phoneNumber}
                onChange={handleChangePhoneNumber}
                disabled={submitting}
                fullWidth
              />
            </Grid>
            <Grid xs={12} className={classes.templates} item>
              <Select
                value={selectedTemplate?.value}
                options={availableTemplates}
                onChange={handleChangeTemplate}
                disabled={!selectedConnectionKey || submitting}
                label="Modelo da Mensagem"
                customIndicators={
                  selectedConnectionKey && (
                    <Tooltip
                      title={tooltipTitle}
                      placement="bottom-start"
                      arrow
                    >
                      <IconButton onClick={handleOpenMessageSugestion}>
                        <Icon
                          path={mdiPlusBoxOutline}
                          size={0.8}
                          color="#646464"
                        />
                      </IconButton>
                    </Tooltip>
                  )
                }
                fullWidth
              />
            </Grid>
            {templateArgs.map((arg, index) => (
              <Grid key={`template-arg-${index}`} item>
                <Input
                  name={`args[${index}]`}
                  label={selectedTemplate.argsDescription[index]}
                  value={templateArgs[index]}
                  onChange={handleChangeTemplateArg(index)}
                  disabled={submitting}
                  maxLength={255}
                  fullWidth
                />
              </Grid>
            ))}
            {previewText && (
              <Grid item>
                <Typography variant="caption">Mensagem:</Typography>
                <div className={classes.preview}>
                  <div className={classes.previewText}>{previewText}</div>
                  {previewButtons && (
                    <ButtonGroup className={classes.previewButtons} fullWidth>
                      {previewButtons.map((button, index) => (
                        <Button
                          key={`button-${index}`}
                          disabled={true}
                          size="small"
                        >
                          {button}
                        </Button>
                      ))}
                    </ButtonGroup>
                  )}
                </div>
              </Grid>
            )}
            <Box textAlign="center">
              <Button
                color="primary"
                variant="contained"
                disabled={
                  phoneNumber.length < 10 ||
                  templateArgs.filter((it) => it.length === 0).length > 0
                }
                submitting={submitting}
                onClick={() => {
                  setSubmitting(true);
                  //send(propsToSend);
                }}
              >
                Enviar Mensagem
              </Button>
            </Box>
          </Grid>
        </div>
      )}
    </div>
  );
};
