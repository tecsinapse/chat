import { Enum } from "enumify";
import { isEquals } from "./utils";

class NotificationType extends Enum {}

NotificationType.initEnum({
  NEW_CHAT: "NEW_CHAT",
  NEW_MESSAGE: "NEW_MESSAGE",
  ARCHIVED_CHAT: "ARCHIVED_CHAT",
});

NotificationType.isNewChat = (notificationType) =>
  isEquals(NotificationType.NEW_CHAT, notificationType);

NotificationType.isNewMessage = (notificationType) =>
  isEquals(NotificationType.NEW_MESSAGE, notificationType);

NotificationType.isArchivedChat = (notificationType) =>
  isEquals(NotificationType.ARCHIVED_CHAT, notificationType);

export default NotificationType;
