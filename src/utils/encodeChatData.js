import jwt from "jwt-simple";

export function encodeChatData(chat, userkeycloakId) {
  return jwt.encode(
    {data: JSON.stringify(chat)},
    userkeycloakId,
    "HS256"
  );
}
