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

export const countryPhoneNumber = (raw) => {
  if (raw !== null) {
    let phoneNumber = raw.replace(/\W/g, "");

    if (!phoneNumber) {
      return null;
    }

    if (/\D/.test(phoneNumber)) {
      phoneNumber = removePhoneCharacters(raw, phoneNumber);
    }

    if (!isPhoneNumberStartWithCountryCode(phoneNumber)) {
      phoneNumber = `55${phoneNumber}`;
    }

    if (phoneNumber.length === 12) {
      const phoneWithNoDD = phoneNumber.substring(4);

      if (phoneWithNoDD.substring(0, 1) > 5) {
        const countryDDD = phoneNumber.substring(0, 4);

        phoneNumber = `${countryDDD}9${phoneWithNoDD}`;
      }
    }

    return phoneNumber;
  }

  return null;
};

const isPhoneNumberStartWithCountryCode = (phoneNumber) =>
  phoneNumber.startsWith("55") && phoneNumber.length >= 12;

const removePhoneCharacters = (raw, phoneNumber) => {
  const index = raw.indexOf(/\D/.exec(phoneNumber));

  return raw.substring(0, index).replace(/\W/g, "");
};
