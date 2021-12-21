import ReactGA from "react-ga4";
import { emptyTemplate } from "./utils";

export const send = ({
  chatApiUrl,
  selectedConnectionKey,
  destination,
  phoneNumber,
  selectedTemplate,
  templates,
  chatService,
  productService,
  successSend,
  token,
  setSending,
  setError,
  setSuccess,
  args,
  customFields,
}) => {
  setSending(true);
  chatService
    .sendNotification(
      chatApiUrl,
      selectedConnectionKey,
      destination,
      phoneNumber,
      selectedTemplate,
      args
    )
    .then(() => {
      if (process.env.NODE_ENV !== "development") {
        // call the product to create relationship between chat and client
        const fetchArgs = {};
        const { argsKeys } =
          templates.filter((t) => t.value === selectedTemplate)[0] ||
          emptyTemplate;

        for (let i = 0; i < argsKeys.length; i++) {
          fetchArgs[argsKeys[i]] = args[i];
        }

        for (const custom of customFields) {
          fetchArgs[custom.key] = custom.value;
        }

        productService
          .createChat(selectedConnectionKey, phoneNumber, fetchArgs, token)
          .then(() => {
            ReactGA.event({
              category: selectedConnectionKey,
              label: selectedTemplate,
              action: "Send Notification",
            });
            successSend();
          })
          .catch((error) => {
            setError(error.errors);
            setTimeout(() => setError(""), 4000);
            setSending(false);
          });
      } else {
        ReactGA.event({
          category: selectedConnectionKey,
          label: selectedTemplate,
          action: "Send Notification",
        });
        successSend();
      }
    })
    .catch((err) => {
      console.log(err); // eslint-disable-line

      if (err.status === 400) {
        setError(
          `Não foi possível enviar a mensagem. Verifique se o número ${phoneNumber} possui WhatsApp`
        );
      } else {
        setError("Ocorreu um problema ao enviar a mensagem");
      }

      ReactGA.event({
        category: selectedTemplate,
        action: "Send Notification Error",
        nonInteraction: true,
      });
      setSuccess("");
      setTimeout(() => setError(""), 4000);
      setSending(false);
    });
};

export const loadTemplates = (
  connectionKey,
  { setSelectedConnectionKey, chatService, setAvailableTemplates, setTemplates }
) => {
  if (connectionKey === "") {
    setSelectedConnectionKey("");

    return;
  }
  chatService.getAllTampletes(connectionKey).then((templates) => {
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

export const getName = (chat, args, templates, selectedTemplate) =>
  chat?.name ||
  args[
    templates
      .find((e) => e.value === selectedTemplate)
      ?.argsKeys?.findIndex((i) => i === "name")
  ];

export const getCanSend = (phoneNumber, selectedTemplate, args) =>
  phoneNumber !== "" &&
  selectedTemplate !== "" &&
  args.length > 0 &&
  args.filter((a) => a !== "").length === args.length;
