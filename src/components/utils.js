import { CDN_RESOURCES } from "../constants/CDN_RESOURCES";
import { toMoment } from "../utils/dates";
import moment from "moment-timezone";

export const notifyNewChat = (userkeycloakId) => {
  if (!userkeycloakId) {
    return;
  }

  const title = "Nova conversa";
  const body = `Você tem uma nova conversa no Chat.`;
  const icon = CDN_RESOURCES.NOTIFICATION_ICON;

  if (Notification.permission === "granted") {
    new Notification(title, { icon: icon, body: body });
  }

  playNotificationSound(userkeycloakId);
};

export const notifyNewMessage = (userkeycloakId, name) => {
  if (!userkeycloakId || !name) {
    return;
  }

  const title = "Nova mensagem";
  const body = `Você tem uma nova mensagem de ${name} no Chat.`;
  const icon = CDN_RESOURCES.NOTIFICATION_ICON;

  if (Notification.permission === "granted") {
    new Notification(title, { icon: icon, body: body });
  }

  playNotificationSound(userkeycloakId);
};

export const handleLocalStorage = (userkeycloakId, setNotificationSound) => (
  storage
) => {
  if (storage.key === getNotificationSoundStorageKey(userkeycloakId)) {
    setNotificationSound(isNotificationSoundEnabled(userkeycloakId));
  }
};

export const playNotificationSound = (userkeycloakId) => {
  if (isNotificationSoundEnabled(userkeycloakId)) {
    const audio = new Audio(CDN_RESOURCES.NOTIFICATION_SOUND);
    audio.addEventListener("canplaythrough", () => {
      audio.play();
    });
  }
};

export const getNotificationSoundStorageKey = (userkeycloakId) => {
  return `tecsinapseChat.${userkeycloakId}.notificationSound`;
};

export const enableNotificationSound = (userkeycloakId) => {
  const storageKey = getNotificationSoundStorageKey(userkeycloakId);
  localStorage.setItem(storageKey, "enabled");
  playNotificationSound(userkeycloakId);
};

export const disableNotificationSound = (userkeycloakId) => {
  const storageKey = getNotificationSoundStorageKey(userkeycloakId);
  localStorage.setItem(storageKey, "disabled");
};

export const isNotificationSoundEnabled = (userkeycloakId) => {
  if (!userkeycloakId) {
    return false;
  }

  const storageKey = getNotificationSoundStorageKey(userkeycloakId);
  const storageItem = localStorage.getItem(storageKey);

  if (storageItem) {
    return storageItem === "enabled";
  }

  localStorage.setItem(storageKey, "enabled");

  return true;
};

export const getChatId = (chat) => {
  return `${chat.chatId}.${chat.connectionKey}.${chat.destination}`;
};

export function formatDateTime(dateTime) {
  const m = toMoment(dateTime);
  return m.isValid() ? m.format("DD/MM/YYYY HH:mm") : dateTime;
}

export const getMomentNow = () => {
  return moment().tz("America/Sao_Paulo");
}
