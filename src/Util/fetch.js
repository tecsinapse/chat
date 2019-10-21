export async function defaultFetch(path, method, data, formData) {

  let headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': 'rks-(j4iWna<[t)Qm?6*f^/=20y:M!YyF?76{cTbM##H/>-6|*]4!WUsD,abVj:',
  });

  let init = {
    method,
    headers,
  };

  if (data && Object.keys(data).length > 0) {
    init.body = JSON.stringify(data);
  } else {
    if (formData) {
      init.body = formData;
      headers.append('enctype', 'multipart/form-data')
      headers.delete('Content-Type');
    }
  }

  const res = await fetch(path, init);

  if (!res.ok) {
    if (res.status === 400 || res.status === 500) {
      const errors = await res.json();
      console.log('Error while fetching data from server: ' + errors.join(','));
      return Promise.reject(errors);
    }
    console.log(`Server returning with error ${res.status} while fetching data from path ${path}`);
    return Promise.reject();
  }
  return res.text().then(text => (text ? JSON.parse(text) : {}));
}
