export const countryPhoneNumber = (raw) => {
  if (raw !== null) {
    let phoneNumber = raw.replace(/[^\d]/g, "");

    if (!phoneNumber) {
      return null;
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

const formatTemplate = (str) => {
  if (!str) {
    return str;
  }

  return str.replace(/{{(\w+)}}/g, (match, value) =>
    !value ? `[${match}]` : `[${value}]`
  );
};

const fieldDescriptions = (keys, descriptions) =>
  keys.map((key, index) => ({
    key,
    description: descriptions[index],
  }));

export const generatePreviewText = (selectedTemplate, templateArgs) => {
  const { template, descriptions, keys } = selectedTemplate;
  const templateFields = fieldDescriptions(keys, descriptions);

  return formatTemplate(template).replace(/\[(\w+)]/g, (match, value) => {
    const templateValue = templateFields.find((it) => it.key === value);
    const arg = templateArgs.find((it) => it.key === value);

    if (arg?.value !== "") {
      return arg.value;
    }

    if (templateValue) {
      return `*[${templateValue.description}]*`;
    }

    return match;
  });
};

export const generateButtons = (buttons) =>
  buttons.map((it, index) => ({
    position: index + 1,
    description: it,
  }));
