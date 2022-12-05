import jwt from "jwt-simple";
import moment from "moment-timezone";
import { RESOURCES } from "../constants/RESOURCES";

export const sendNotification = (userkeycloakId, title, message) => {
  if (Notification.permission === "granted") {
    // eslint-disable-next-line no-new
    new Notification(title, {
      icon: RESOURCES.NOTIFICATION_ICON,
      body: message,
    });
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
    const audio = new Audio(RESOURCES.NOTIFICATION_SOUND);

    audio.addEventListener("canplaythrough", () => {
      audio.play();
    });
  }
};

export const getNotificationSoundStorageKey = (userkeycloakId) =>
  `tecsinapseChat.${userkeycloakId}.notificationSound`;

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
      .replace(/[-[\]{}()*+?.,\\^$|#]/g, " ")
      .toLowerCase();
  }

  return "";
};

export const encodeChatData = (chat, userkeycloakId) =>
  jwt.encode({ data: JSON.stringify(chat) }, userkeycloakId, "HS256");

export const getChatId = (chat) => `${chat.chatId}.${chat.connectionKey}`;

export const normalizeMoment = (value) => value.tz("America/Sao_Paulo", true);

export const momentNow = () => normalizeMoment(moment());

export const formatDateTime = (dateTime) => {
  const normalizedMoment = normalizeMoment(moment(dateTime));

  return normalizedMoment.isValid()
    ? normalizedMoment.format("DD/MM/YYYY HH:mm")
    : dateTime;
};

export const downloadByLink = (link) => {
  const a = document.createElement("a");

  a.href = link;
  a.target = "_blank";
  a.click();
};
