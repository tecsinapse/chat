import { Enum } from "enumify";
import { EnumUtils } from "../utils";

class ChatStatus extends Enum {}

ChatStatus.initEnum(["BLOCKED", "OK"]);

ChatStatus.isBlocked = (status) =>
  EnumUtils.isEquals(ChatStatus.BLOCKED, status);

ChatStatus.isOK = (status) => EnumUtils.isEquals(ChatStatus.OK, status);

export default ChatStatus;
