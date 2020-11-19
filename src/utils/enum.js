import { EnumUtils } from "./index";

const isEquals = (enumm, param) => [enumm, enumm.name].includes(param);

const contains = (enumm, arr) =>
  arr.includes(enumm) || arr.includes(enumm.name);

const isEqualsOrContains = (enumm, param) =>
  Array.isArray(param)
    ? EnumUtils.contains(enumm, param)
    : EnumUtils.isEquals(enumm, param);

export default { isEquals, contains, isEqualsOrContains };
