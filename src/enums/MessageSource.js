import { Enum } from "enumify";
import { isEquals } from "./utils";

class MessageSource extends Enum {}

MessageSource.initEnum({ PRODUCT: "PRODUCT", CLIENT: "CLIENT" });

MessageSource.isProduct = (messageSource) =>
  isEquals(MessageSource.PRODUCT, messageSource);

MessageSource.isClient = (messageSource) =>
  isEquals(MessageSource.CLIENT, messageSource);

export default MessageSource;
