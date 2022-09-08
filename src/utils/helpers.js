import { COMPONENT_VIEW } from "../constants/COMPONENT_VIEW";
import { countryPhoneNumber } from "../components/SendNotification/utils";

const onStartSendNotification = (view, setChatToSendNotification, setView) => {
  if (COMPONENT_VIEW.CHAT_MESSAGES !== view) {
    setChatToSendNotification(null);
  }
  setView(COMPONENT_VIEW.SEND_NOTIFICATION);
};

export const messageEventListener = async (
  event,
  propsToLoadComponent,
  setChatToSendNotification,
  setView,
  setIsDrawerOpen
) => {
  try {
    const json = JSON.parse(event.data);

    if (json && json.tipo === "TEC-INIT-WINGO-CHAT") {
      const prop = { ...propsToLoadComponent };

      const phone = countryPhoneNumber(json.userPhoneNumber);

      prop.chatInitConfig.params.clienteId = json.clienteId;
      prop.chatInitConfig.userPhoneNumber = phone;

      prop.startChat = () =>
        onStartSendNotification(
          COMPONENT_VIEW.MESSAGE_MANAGEMENT,
          setChatToSendNotification,
          setView
        );

      //await loadComponent(prop);

      setIsDrawerOpen(true);
    }
  } catch (e) {
    // nothing
  }
};
