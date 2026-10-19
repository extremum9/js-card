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

const getDigitsOnly = (value) => value.replace(/\D/g, '');

const cardNumberInput = document.getElementById('cardNumber');

cardNumberInput.addEventListener('input', (event) => {
  const target = event.target;
  const sanitizedValue = getDigitsOnly(target.value);
  let formattedValue;

  switch (getCardNetwork(sanitizedValue)) {
    case 'amex':
      formattedValue = sanitizedValue.replace(/^(\d{4})/, '$1 ').replace(/^(\d{4}\s\d{6})/, '$1 ').slice(0, 17);
      break;
    case 'visa':
    case 'mastercard':
    case 'discover':
    default:
      formattedValue = sanitizedValue.replace(/(\d{4})/g, '$1 ').slice(0, 19);
  }

  target.value = formattedValue;
});
