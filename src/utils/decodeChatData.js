import jwt from "jwt-simple";

export function decodeChatData(data, userkeycloakId) {
  return jwt.decode(data, userkeycloakId, "HS256");
}
