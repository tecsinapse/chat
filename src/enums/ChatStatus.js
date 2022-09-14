import { Enum } from "enumify";
import { isEquals } from "./utils";

class ChatStatus extends Enum {}

ChatStatus.initEnum({ BLOCKED: "BLOCKED", OK: "OK" });

ChatStatus.isBlocked = (chat) =>
  isEquals(ChatStatus.BLOCKED, chat?.status) || chat?.archived;

ChatStatus.isOK = (chat) =>
  isEquals(ChatStatus.OK, chat?.status) && !chat?.archived;

export default ChatStatus;
