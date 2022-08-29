import jwt from "jwt-simple";

export function oldEncodeChatData(chat, userkeycloakId) {
  return jwt.encode({ data: JSON.stringify(chat) }, userkeycloakId, "HS256");
}
