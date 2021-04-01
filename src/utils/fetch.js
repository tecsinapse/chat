/* eslint-disable prefer-promise-reject-errors */
export const fetchMessages = ({
  chatApiUrl,
  connectionKey,
  destination,
  chatId,
  page = 0,
  updateUnreadWhenOpen = true,
}) => {
  const uri = `${chatApiUrl}/${connectionKey}/${destination}/${chatId}/messages?page=${page}&size=50&updateUnread=${updateUnreadWhenOpen}`;

  return defaultFetch(uri, "GET", {});
};

export function defaultFetch(path, method, data, formData) {
  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization:
      "rks-(j4iWna<[t)Qm?6*f^/=20y:M!YyF?76{cTbM##H/>-6|*]4!WUsD,abVj:",
  });

  const init = {
    method,
    headers,
  };

  if (data && Object.keys(data).length > 0) {
    init.body = JSON.stringify(data);
  } else if (formData) {
    init.body = formData;
    headers.append("enctype", "multipart/form-data");
    headers.delete("Content-Type");
  }

  return customFetch(path, init);
}

export function noAuthJsonFetch(path, method, data, token) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const init = {
    method,
    headers,
  };

  if (data && Object.keys(data).length > 0) {
    init.body = JSON.stringify(data);
  }

  return customFetch(path, init);
}

export async function customFetch(path, init) {
  const res = await fetch(path, init);

  if (!res.ok) {
    if (res.status === 400 || res.status === 500) {
      const errors = await res.json();

      console.log(`Error while fetching data from server: ${errors.join(",")}`); // eslint-disable-line

      return Promise.reject({
        status: res.status,
        errors: errors.join(","),
      });
    }

    if (res.status === 403) {
      // chat is blocked. Perhaps user can't send message because of vendor (Blip) rules of active messages
      // https://tecsinapse.tpondemand.com/entity/125511-bloquear-envio-de-mensagens-apos-24h
      return Promise.reject({
        status: res.status,
        errors: "Chat bloqueado",
      });
    }
    // eslint-disable-next-line
    console.log(
      `Server returning with error ${res.status} while fetching data from path ${path}`
    );

    return Promise.reject({
      status: res.status,
      error: "Erro inesperado",
    });
  }

  return res.text().then((text) => (text ? JSON.parse(text) : {}));
}
/* eslint-enable prefer-promise-reject-errors */
