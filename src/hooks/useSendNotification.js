import { useEffect } from "react";
import { isEmpty } from "../utils/helpers";

export default function useSendNotification(
  chat,
  phoneNumber,
  extraFields,
  info,
  setCustomFields,
  setAuxInfo
) {
  useEffect(() => {
    if (!isEmpty(info)) {
      setAuxInfo(info);
    } else {
      const { extraInfo } = chat || {};
      setAuxInfo({
        user: extraInfo?.responsavel || "",
        company: extraInfo?.dealer || "",
        name: chat?.name || "",
        phone: phoneNumber,
      });
    }
    if (extraFields) {
      setCustomFields(extraFields);
    }
  }, [chat, info, extraFields, phoneNumber]); // eslint-disable-line react-hooks/exhaustive-deps
}
