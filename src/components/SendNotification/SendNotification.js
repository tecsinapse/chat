import React, { useEffect, useState } from "react";
import { Button, IconButton, Input, Select } from "@tecsinapse/ui-kit";
import { Box, ButtonGroup, Grid, Tooltip, Typography } from "@material-ui/core";
import Icon from "@mdi/react";
import { mdiPlusBoxOutline } from "@mdi/js";
import ReactGA from "react-ga4";
import { Loading } from "../Loading/Loading";
import { useStyle } from "./styles";
import { COMPONENT_VIEW } from "../../constants/COMPONENT_VIEW";
import { normalize } from "../utils";
import { ARGS_DESCRIPTIONS } from "../../constants/ARGS_DESCRIPTIONS";
import { countryPhoneNumber } from "./utils";

export const SendNotification = ({
  chatService,
  productService,
  userkeycloakId,
  connectionKeys,
  currentChat,
  setCurrentChat,
  loading,
  setLoading,
  setConnectionError,
  setView,
  userNamesById,
}) => {
  const classes = useStyle();

  const [phoneNumber, setPhoneNumber] = useState(
    currentChat ? countryPhoneNumber(currentChat.phone) : ""
  );

  const [submitting, setSubmitting] = useState(false);

  const [selectedConnectionKey, setSelectedConnectionKey] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [templateArgs, setTemplateArgs] = useState([]);
  const [previewText, setPreviewText] = useState(null);
  const [previewButtons, setPreviewButtons] = useState([]);

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

    const {
      keys: templateArgsKeys,
      descriptions: templateArgsDescriptions,
    } = selectedTemplate;

    const { args: connectionKeyArgs } = selectedConnectionKey;

    const templateArgs = [];

    for (let i = 0; i < templateArgsKeys.length; i++) {
      const description = normalize(templateArgsDescriptions[i]);

      if (ARGS_DESCRIPTIONS.NAME.includes(description)) {
        templateArgs.push(currentChat?.name || "");
      } else if (ARGS_DESCRIPTIONS.DEALER.includes(description)) {
        templateArgs.push(connectionKeyArgs["DealerName"] || "");
      } else if (ARGS_DESCRIPTIONS.OWNER.includes(description)) {
        templateArgs.push(userNamesById[userkeycloakId] || "");
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
      buttons: previewButtons,
      keys: templateArgsKeys,
    } = selectedTemplate;

    for (let i = 0; i < templateArgs.length; i++) {
      if (templateArgs[i]) {
        previewText = previewText.replaceAll(
          `{{${templateArgsKeys[i]}}}`,
          `<b>${templateArgs[i]}</b>`
        );
      }
    }

    setPreviewButtons(previewButtons);
    setPreviewText(previewText);
  }, [templateArgs]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangePhoneNumber = (event) => {
    setPhoneNumber(event.target.value.replace(/[^\d]/g, ""));
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

  const handleSendNotification = () => {
    setLoading(true);
    setSubmitting(true);

    const {
      value: connectionKey,
      args: connectionKeyArgs,
    } = selectedConnectionKey;

    const {
      value: templateId,
      keys: templateArgsKeys,
      descriptions: templateArgsDescriptions,
    } = selectedTemplate;

    let name = null;

    for (let i = 0; i < templateArgsKeys.length; i++) {
      const description = normalize(templateArgsDescriptions[i]);
      if (ARGS_DESCRIPTIONS.NAME.includes(description)) {
        name = templateArgs[i];
      }
    }

    const createChatArgs = {
      ...connectionKeyArgs,
      ClienteName: name,
    };

    productService
      .createChat(connectionKey, phoneNumber, createChatArgs)
      .then((incompleteChat) => {
        chatService
          .sendNotification(
            userkeycloakId,
            incompleteChat,
            templateId,
            templateArgs
          )
          .then((completeChat) => {
            ReactGA.event({
              category: connectionKey,
              label: templateId,
              action: "Send Notification",
            });

            setCurrentChat(completeChat);
            setView(COMPONENT_VIEW.CHAT_MESSAGES);
            setSubmitting(false);
            setLoading(false);
          })
          .catch(() => {
            setSubmitting(false);
            setLoading(false);
            setConnectionError(true);
          });
      })
      .catch(() => {
        setSubmitting(false);
        setLoading(false);
        setConnectionError(true);
      });
  };

  const handleOpenMessageSugestion = () => {
    const { value: connectionKey } = selectedConnectionKey;

    ReactGA.event({
      category: selectedConnectionKey,
      label: "CLICK_BTN_NOVO_MODELO_MSG",
      action: "Suggest Message Template",
    });

    const kcidParam = `kcid=${userkeycloakId}`;
    const connectionKeyParam = `connectionKey=${connectionKey}`;
    const customParam = `alignCenter=1&transparentBackground=1`;
    const params = `${kcidParam}&${connectionKeyParam}&${customParam}`;
    const url = `${process.env.REACT_APP_MESSAGE_SUGESTION_URL}?${params}`;

    window.open(`${url}`, "_blank");
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
                value={selectedConnectionKey?.label}
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
                      title="Sugerir Modelo de Mensagem"
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
                  label={selectedTemplate.descriptions[index]}
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
                  <Typography
                    className={classes.previewText}
                    dangerouslySetInnerHTML={{
                      __html: previewText,
                    }}
                  />
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
                  !selectedConnectionKey ||
                  !selectedTemplate ||
                  phoneNumber.length < 10 ||
                  phoneNumber.length > 13 ||
                  templateArgs.filter((it) => it.length === 0).length > 0
                }
                submitting={submitting}
                onClick={handleSendNotification}
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
