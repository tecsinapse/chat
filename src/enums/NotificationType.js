import { Enum } from "enumify";
import { isEquals } from "./utils";

class NotificationType extends Enum {}

NotificationType.initEnum({ REFRESH_UI: "REFRESH_UI" });

NotificationType.isRefreshUI = (test) =>
  isEquals(NotificationType.REFRESH_UI, test);

export default NotificationType;
