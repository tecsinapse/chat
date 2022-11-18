import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Input,
  MessagePreview,
  Select,
} from "@tecsinapse/ui-kit";
import { Box, Grid, Tooltip } from "@material-ui/core";
import Icon from "@mdi/react";
import { mdiPlusBoxOutline } from "@mdi/js";
import ReactGA from "react-ga4";
import { Loading } from "../Loading/Loading";
import { useStyle } from "./styles";
import { COMPONENT_VIEW } from "../../constants/COMPONENT_VIEW";
import { normalize } from "../utils";
import { ARGS_DESCRIPTIONS } from "../../constants/ARGS_DESCRIPTIONS";
import {
  countryPhoneNumber,
  generateButtons,
  generatePreviewText,
} from "./utils";
import { LoadMetric } from "../LoadMetric/LoadMetric";
import { ANALYTICS_EVENTS } from "../../constants/ANALYTICS_EVENTS";

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
  view,
  setView,
  userNamesById,
}) => {
  const classes = useStyle();

  const [phoneNumber, setPhoneNumber] = useState(
    currentChat ? countryPhoneNumber(currentChat.phone) : ""
  );

  const [submitting, setSubmitting] = useState(false);
  const [selectedConnectionKey, setSelectedConnectionKey] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
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

  const handleChangeConnectionKey = (value) => {
    const connectionKey = connectionKeys.find((it) => it.label === value);

    if (connectionKey) {
      setSelectedTemplate(null);
      setSelectedConnectionKey(connectionKey);
      setLoading(true);

      chatService
        .getAllTemplatesByUser(connectionKey.value, userkeycloakId)
        .then((allTemplates) => {
          const noTemplateGroup = {
            label: "Selecione...",
            options: [],
          };

          const mostUsedTemplatesGroup = {
            label: "Mais usadas nos últimos 45 dias",
            options: allTemplates
              .filter((it) => it.mostUsed)
              .map((it) => ({
                label: it.name,
                event: ANALYTICS_EVENTS.TEMPLATE_MOST_USED,
                value: { label: it.name, ...it },
              })),
          };

          const templatesGroup = {
            label: "Lista de modelos",
            options: allTemplates.map((it) => ({
              label: it.name,
              event: ANALYTICS_EVENTS.TEMPLATE_LIST,
              value: { label: it.name, ...it },
            })),
          };

          setTemplates([
            noTemplateGroup,
            mostUsedTemplatesGroup,
            templatesGroup,
          ]);

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
    if (availableConnectionKeys.length === 2 && !selectedConnectionKey) {
      handleChangeConnectionKey(availableConnectionKeys[1]?.label);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableConnectionKeys, selectedConnectionKey]);

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

    const newTemplateArgs = [];

    for (let i = 0; i < templateArgsKeys.length; i++) {
      const description = normalize(templateArgsDescriptions[i]);
      const key = templateArgsKeys[i];
      let value = "";

      if (ARGS_DESCRIPTIONS.NAME.includes(description)) {
        value = currentChat?.name || "";
        newTemplateArgs.push({ key, value });
      } else if (ARGS_DESCRIPTIONS.DEALER.includes(description)) {
        value = connectionKeyArgs.DealerName || "";
        newTemplateArgs.push({ key, value });
      } else if (ARGS_DESCRIPTIONS.OWNER.includes(description)) {
        value = userNamesById[userkeycloakId] || "";
        newTemplateArgs.push({ key, value });
      } else {
        newTemplateArgs.push({ key, value });
      }
    }

    setTemplateArgs(newTemplateArgs);
  }, [selectedTemplate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedTemplate) {
      setPreviewText(null);
      setPreviewButtons([]);

      return;
    }

    const newPreviewButtons = generateButtons(selectedTemplate.buttons);
    const newPreviewText = generatePreviewText(selectedTemplate, templateArgs);

    setPreviewButtons(newPreviewButtons);
    setPreviewText(newPreviewText);
  }, [templateArgs]); // eslint-disable-line react-hooks/exhaustive-deps

  const argsValues = templateArgs.map((it) => it.value);

  const handleChangePhoneNumber = (event) => {
    setPhoneNumber(event.target.value.replace(/[^\d]/g, ""));
  };

  const handleChangeTemplate = (value) => {
    for (const group of templates) {
      for (const option of group.options) {
        if (option.value === value) {
          setSelectedTemplate(value);

          ReactGA.event({
            category: selectedConnectionKey,
            label: option.event,
            action: "Template Select",
          });

          break;
        }
      }
    }
  };

  const handleChangeTemplateArg = (index) => (event) => {
    const newTemplateArgs = [...templateArgs];

    newTemplateArgs[index].value = event.target.value;
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
      templateId,
      keys: templateArgsKeys,
      descriptions: templateArgsDescriptions,
    } = selectedTemplate;

    let name = null;

    for (let i = 0; i < templateArgsKeys.length; i++) {
      const description = normalize(templateArgsDescriptions[i]);

      if (ARGS_DESCRIPTIONS.NAME.includes(description)) {
        name = argsValues[i];
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
            argsValues
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
    const connectionKeyParam = `connectionkey=${connectionKey}`;
    const customParam = `alignCenter=1&transparentBackground=1`;
    const params = `${kcidParam}&${connectionKeyParam}&${customParam}`;
    const url = `${process.env.REACT_APP_MESSAGE_SUGESTION_URL}?${params}`;

    window.open(`${url}`, "_blank");
  };

  const style = {
    indicatorsContainer: (base) => ({
      ...base,
      flexDirection: "row-reverse",
    }),
  };

  return (
    <div className={classes.container}>
      {loading ? (
        <div className={classes.loadingContainer}>
          <LoadMetric
            metricId={view}
            userkeyloakId={userkeycloakId}
            chatService={chatService}
          >
            <Loading />
          </LoadMetric>
        </div>
      ) : (
        <div className={classes.sendContainer}>
          <Grid spacing={1} direction="column" container>
            <Grid className={classes.connectionKeys} item>
              <Select
                value={selectedConnectionKey?.label}
                options={availableConnectionKeys}
                onChange={handleChangeConnectionKey}
                disabled={submitting || availableConnectionKeys.length === 2}
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
                id="message-template"
                styles={style}
                value={selectedTemplate?.templateId}
                options={templates}
                onChange={handleChangeTemplate}
                disabled={!selectedConnectionKey || submitting}
                selectPromptMessage={selectedTemplate?.label}
                label="Selecione modelo da mensagem"
                customIndicators={
                  <Tooltip
                    title="Sugerir Modelo de Mensagem"
                    placement="bottom-start"
                    arrow
                  >
                    <IconButton
                      onClick={handleOpenMessageSugestion}
                      className={
                        selectedConnectionKey
                          ? classes.newTemplateButtonEnable
                          : classes.newTemplateButtonDisable
                      }
                    >
                      <Icon
                        path={mdiPlusBoxOutline}
                        size={0.8}
                        color="#ffffff"
                      />
                    </IconButton>
                  </Tooltip>
                }
                fullWidth
              />
            </Grid>
            {argsValues.map((arg, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`template-arg-${index}`} item>
                <Input
                  name={`args[${index}]`}
                  label={selectedTemplate?.descriptions[index]}
                  value={argsValues[index]}
                  onChange={handleChangeTemplateArg(index)}
                  disabled={submitting}
                  maxLength={255}
                  fullWidth
                />
              </Grid>
            ))}
            {previewText && (
              <Grid item>
                <div className={classes.preview}>
                  <Grid item>
                    <MessagePreview
                      unformattedText={previewText}
                      buttons={previewButtons}
                    />
                  </Grid>
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
                  argsValues.filter((it) => it.length === 0).length > 0
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
