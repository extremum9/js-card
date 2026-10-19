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

const getCardNetwork = (cardNumber) => {
  for (const network in CARD_NETWORK_PATTERNS) {
    if (CARD_NETWORK_PATTERNS[network].test(cardNumber)) {
      return network;
    }
  }
  return 'unknown';
};

const formatCardNumber = (cardNumber) => {
  switch (getCardNetwork(cardNumber)) {
    case 'amex':
      return cardNumber.replace(/^(\d{4})/, '$1 ').replace(/^(\d{4}\s\d{6})/, '$1 ').slice(0, 17);
    case 'visa':
    case 'mastercard':
    case 'discover':
    default:
      return cardNumber.replace(/(\d{4})/g, '$1 ').slice(0, 19);
  }
};

const getDigitsOnly = (value) => value.replace(/\D/g, '');

const cardNumberInput = document.getElementById('cardNumber');

let lastValue = '';

cardNumberInput.addEventListener('input', (event) => {
  const target = event.target;
  let { value, selectionStart: caretPosition } = target;

  const deleting = value.length < lastValue.length;
  // If the deleted character is a space, remove the preceding character
  // and adjust the caret position.
  if (deleting && lastValue[caretPosition] === ' ') {
    value = value.slice(0, caretPosition - 1) + value.slice(caretPosition);
    caretPosition--;
  }

  const sanitizedValue = getDigitsOnly(value);
  let formattedValue = formatCardNumber(sanitizedValue);
  if (deleting) {
    formattedValue = formattedValue.trimEnd();
  }

  const numberOfDigitsBeforeCaret = getDigitsOnly(value.slice(0, caretPosition)).length;

  let digitCount = 0;
  for (let index = 0; index < formattedValue.length; index++) {
    if (digitCount === numberOfDigitsBeforeCaret) {
      caretPosition = index;
      break;
    }
    if (/\d/.test(formattedValue[index])) {
      digitCount++;
    }
  }

  // Move the caret past the newly added space.
  if (!deleting && formattedValue[caretPosition] === ' ') {
    caretPosition++;
  }

  target.value = formattedValue;
  lastValue = formattedValue;
  target.setSelectionRange(caretPosition, caretPosition);
});
