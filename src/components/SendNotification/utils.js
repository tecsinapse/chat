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
