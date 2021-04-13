import { useEffect } from "react";
import { filterChatsByFields } from "../components/MessageManagement/functions";

export default function useFiltered(globalSearch, setChatsFiltered, chats) {
  useEffect(() => {
    const filtered = filterChatsByFields(chats, globalSearch);

    setChatsFiltered(filtered);
  }, [globalSearch, chats]); // eslint-disable-line react-hooks/exhaustive-deps
}
