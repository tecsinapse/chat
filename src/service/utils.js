/* eslint-disable prefer-promise-reject-errors */

export function defaultFetch(path, method, data, formData) {
  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: process.env.REACT_APP_FETCH_TOKEN,
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

      console.error(
        `Error while fetching data from server: ${errors.join(",")}`
      );

      return Promise.reject({
        status: res.status,
        errors: errors.join(","),
      });
    }

    if (res.status === 403) {
      return Promise.reject({
        status: res.status,
        errors: "Chat bloqueado",
      });
    }

    console.error(
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
