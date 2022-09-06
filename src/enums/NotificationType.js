import { Enum } from "enumify";
import { EnumUtils } from "../utils";

class NotificationType extends Enum {}

NotificationType.initEnum(["REFRESH_UI"]);

NotificationType.isRefreshUI = (test) =>
  EnumUtils.isEquals(NotificationType.REFRESH_UI, test);

export default NotificationType;
