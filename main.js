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
 * @param {number} caretIndex
 * @returns {number}
 */
const countDigitsBeforeCaret = (value, caretIndex) => getDigitsOnly(value.slice(0, caretIndex)).length;

/**
 * @param {string} value
 * @returns {string}
 */
const getDigitsOnly = (value) => value.replace(/\D/g, '');

/**
 * @param {string} cardNumber
 * @returns {"visa" | "mastercard" | "amex" | "discover" | "unknown"}
 */
const getCardNetwork = (cardNumber) => {
  for (const network in CARD_NETWORK_PATTERNS) {
    if (CARD_NETWORK_PATTERNS[network].test(cardNumber)) {
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
const getCaretIndex = (formattedValue, digitsBeforeCaret) => {
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
 * @returns {string}
 */
const formatCardNumber = (value) => {
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
const formatCardExpirationDate = (value) => getDigitsOnly(value).replace(/^(\d{2})/, '$1 / ').slice(0, 7);

const cardNumberInput = document.getElementById('cardNumber');
let lastValue = '';

cardNumberInput.addEventListener('input', (event) => {
  const target = event.target;
  let { value, selectionStart: caretIndex } = target;

  const deleting = value.length < lastValue.length;
  // If the deleted character is a space, remove the preceding character
  // and adjust the caret index.
  if (deleting && lastValue[caretIndex] === ' ') {
    value = value.slice(0, caretIndex - 1) + value.slice(caretIndex);
    caretIndex--;
  }

  let formattedValue = formatCardNumber(value);
  if (deleting) {
    formattedValue = formattedValue.trimEnd();
  }

  const digitsBeforeCaret = countDigitsBeforeCaret(value, caretIndex);
  caretIndex = getCaretIndex(formattedValue, digitsBeforeCaret);

  // Move the caret past the newly added space.
  if (!deleting && formattedValue[caretIndex] === ' ') {
    caretIndex++;
  }

  target.value = formattedValue;
  lastValue = formattedValue;
  target.setSelectionRange(caretIndex, caretIndex);
});

const cardExpiration = document.getElementById('cardExpiration');
let lastDateValue = '';

cardExpiration.addEventListener('input', (event) => {
  const target = event.target;
  let { value, selectionStart: caretIndex } = target;

  const deleting = value.length < lastDateValue.length;
  if (!deleting && value.length === 1 && /[2-9]/.test(value)) {
    value = `0${value}`;
    caretIndex++;
  }

  // If the deleted character is not a digit, remove the second digit
  // of the month.
  if (deleting && !/\d/.test(lastDateValue[caretIndex])) {
    value = value.slice(0, 1) + value.slice(caretIndex);
    caretIndex = 1;
  }

  const formattedValue = formatCardExpirationDate(value);
  const digitsBeforeCaret = countDigitsBeforeCaret(value, caretIndex);
  caretIndex = getCaretIndex(formattedValue, digitsBeforeCaret);

  if (!deleting && formattedValue.slice(caretIndex, caretIndex + 3) === ' / ') {
    caretIndex += 3;
  }

  target.value = formattedValue;
  lastDateValue = formattedValue;
  target.setSelectionRange(caretIndex, caretIndex);
});
