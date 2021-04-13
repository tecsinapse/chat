export const emptyTemplate = {
  label: "Selecione",
  value: "",
  args: 0,
  argsDescription: [],
  argsKeys: [],
};

export const cleanPhoneCharacters = (value) => value.replace(/\D/g, "");

export const formatPhone = (phone) => {
  let value = phone;

  value = cleanPhoneCharacters(value); // Remove tudo o que não é dígito
  value = value.replace(/^(\d\d)(\d)/g, "($1) $2"); // Coloca parênteses em volta dos dois primeiros dígitos

  if (value.length < 14) {
    value = value.replace(/(\d{4})(\d)/, "$1-$2");
  }
  // Número com 8 dígitos. Formato: (99) 9999-9999
  else {
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
  } // Número com 9 dígitos. Formato: (99) 99999-9999

  return value;
};
