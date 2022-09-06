import { Enum } from "enumify";
import EnumUtils from "./utils";

class MessageSource extends Enum {}

MessageSource.initEnum({ PRODUCT: "PRODUCT", CLIENT: "CLIENT" });

MessageSource.isProduct = (source) =>
  EnumUtils.isEquals(MessageSource.PRODUCT, source);
MessageSource.isClient = (source) =>
  EnumUtils.isEquals(MessageSource.CLIENT, source);

export default MessageSource;
