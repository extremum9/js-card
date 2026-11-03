const CARD_NETWORK_PATTERNS = {
  /* Matches a number beginning with 4 */
  visa: /^4/,
  /* Matches a number beginning with 51 through 55 or 2221 through 2720 */
  mastercard: /^(5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/,
  /* Matches a number beginning with 34 or 37 */
  amex: /^3[47]/,
  /* Matches a number beginning with 6011, 65, or 644 through 649 */
  discover: /^(6011|65|64[4-9])/
};

/**
 * @param {string} value
 * @returns {string}
 */
export const getDigitsOnly = (value) => value.replace(/\D/g, '');

/**
 * @param {string} value
 * @param {number} caretIndex
 * @returns {number}
 */
export const countDigitsBeforeCaret = (value, caretIndex) => getDigitsOnly(value.slice(0, caretIndex)).length;

/**
 * @param {string} value
 * @returns {'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'}
 */
export const getCardNetwork = (value) => {
  const sanitized = getDigitsOnly(value);
  for (const network in CARD_NETWORK_PATTERNS) {
    if (CARD_NETWORK_PATTERNS[network].test(sanitized)) {
      return network;
    }
  }

  return 'unknown';
};

/**
 * @param {string} formattedValue
 * @param {number} digitsBeforeCaret
 * @returns {number}
 */
export const getCaretIndex = (formattedValue, digitsBeforeCaret) => {
  if (!digitsBeforeCaret) {
    return 0;
  }

  let digitCount = 0;
  for (let index = 0; index < formattedValue.length; index++) {
    if (/\d/.test(formattedValue[index])) {
      digitCount++;
      if (digitCount === digitsBeforeCaret) {
        return index + 1;
      }
    }
  }

  return formattedValue.length;
};

/**
 * @param {string} value
 * @returns {boolean}
 */
export const numberComplete = (value) => {
  const sanitized = getDigitsOnly(value);
  const expectedLength = getCardNetwork(sanitized) === 'amex' ? 15 : 16;

  return sanitized.length === expectedLength;
};

/**
 * @param {string} value
 * @returns {boolean}
 */
export const expirationDateComplete = (value) => getDigitsOnly(value).length === 4;

/**
 * @param {string} value
 * @returns {boolean}
 */
export const validateLuhn = (value) => {
  const sanitized = getDigitsOnly(value);
  let sum = 0;
  let even = false;
  for (let index = sanitized.length - 1; index >= 0; index--) {
    let digit = +sanitized[index];
    if (even && (digit *= 2) > 9) {
      digit -= 9;
    }
    sum += digit;
    even = !even;
  }

  return sum % 10 === 0;
};

/**
 * @param {string} value
 * @returns {string}
 */
export const formatNumber = (value) => {
  const sanitized = getDigitsOnly(value);
  switch (getCardNetwork(sanitized)) {
    case 'amex':
      return sanitized.replace(/^(\d{4})/, '$1 ').replace(/^(\d{4}\s\d{6})/, '$1 ').slice(0, 17);
    case 'visa':
    case 'mastercard':
    case 'discover':
    default:
      return sanitized.replace(/(\d{4})/g, '$1 ').slice(0, 19);
  }
};

/**
 * @param {string} value
 * @returns {string}
 */
export const formatExpirationDate = (value) => getDigitsOnly(value).replace(/^(\d{2})/, '$1 / ').slice(0, 7);

/**
 * @param {string} value
 * @param {'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'} network
 * @returns {string}
 */
export const formatSecurityCode = (value, network) => getDigitsOnly(value).slice(0, network === 'amex' ? 4 : 3);
