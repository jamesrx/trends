exports.isValidLength = (name, max = 20, min = 3) => {
  name = name.trim();
  const isValid = name.length >= min && name.length <= max;
  return isValid;
}
