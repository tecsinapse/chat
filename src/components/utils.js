import jwt from "jwt-simple";
import { CDN_RESOURCES } from "../constants/CDN_RESOURCES";
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

export const normalize = (value) => {
  if (value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  } else {
    return "";
  }
};

export const encodeChatData = (chat, userkeycloakId) => {
  return jwt.encode({ data: JSON.stringify(chat) }, userkeycloakId, "HS256");
};

export const getChatId = (chat) => {
  return `${chat.chatId}.${chat.connectionKey}`;
};

export const normalizeMoment = (value) => {
  return value.tz("America/Sao_Paulo", true);
};

export const momentNow = () => {
  return normalizeMoment(moment());
};

export const formatDateTime = (dateTime) => {
  const normalizedMoment = normalizeMoment(moment(dateTime));
  return normalizedMoment.isValid()
    ? normalizedMoment.format("DD/MM/YYYY HH:mm")
    : dateTime;
};
