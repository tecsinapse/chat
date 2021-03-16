import { useEffect } from "react";
import { matcher } from "../components/MessageManagement/globalSearch";
import { format } from "../utils/dates";

export default function useFiltered(globalSearch, setChatsFiltered, chats) {
  useEffect(() => {
    const filtered = chats.filter(
      (el) =>
        matcher(globalSearch, format(el.contactAt)).length > 0 ||
        matcher(globalSearch, el.phone).length > 0 ||
        matcher(globalSearch, el.lastMessage).length > 0 ||
        matcher(globalSearch, el.name).length > 0 ||
        matcher(globalSearch, el.subName || "").length > 0 ||
        matcher(globalSearch, el.extraInfo?.segmento || "").length > 0 ||
        matcher(globalSearch, el.extraInfo?.responsavel || "").length > 0 ||
        matcher(globalSearch, el.extraInfo?.dealer || "").length > 0
    );
    setChatsFiltered(filtered);
  }, [globalSearch, chats]); // eslint-disable-line react-hooks/exhaustive-deps
}
