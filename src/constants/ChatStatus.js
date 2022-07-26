import { Enum } from "enumify";
import { EnumUtils } from "../utils";

class ChatStatus extends Enum {}

ChatStatus.initEnum(["BLOCKED", "OK"]);

ChatStatus.isBlocked = (chat) =>
  EnumUtils.isEquals(ChatStatus.BLOCKED, chat?.status) || chat.archived;

ChatStatus.isOK = (chat) =>
  EnumUtils.isEquals(ChatStatus.OK, chat?.status) && !chat.archived;

export default ChatStatus;
