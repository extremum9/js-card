import {
  countDigitsBeforeCaret,
  formatCardExpirationDate,
  formatCardNumber,
  formatCardSecurityCode,
  getCardNetwork,
  getCaretIndex
} from './modules/utilities.js'

const SELECTORS = {
  FORM: '.js-form',
  FORM_CONTROL: '.js-form-control',
  CARD_NUMBER_CONTROL : '.js-card-number-control',
  CARD_EXPIRATION_DATE_CONTROL : '.js-card-expiration-date-control',
  CARD_SECURITY_CODE_CONTROL : '.js-card-security-code-control',
};

const formElement = document.querySelector(SELECTORS.FORM);
const cardNumberControl = document.querySelector(SELECTORS.CARD_NUMBER_CONTROL);
const cardExpirationDateControl = document.querySelector(SELECTORS.CARD_EXPIRATION_DATE_CONTROL);
const cardSecurityCodeControl = document.querySelector(SELECTORS.CARD_SECURITY_CODE_CONTROL);

const onCardNumberInput = () => {
  let lastValue = '';

  return (event) => {
    const target = event.target;
    let { value, selectionStart: caretIndex } = target;

    const deleting = value.length < lastValue.length;
    // If the deleted character is a space, remove the preceding character
    // and adjust the caret index.
    if (deleting && lastValue[caretIndex] === ' ') {
      value = value.slice(0, caretIndex - 1) + value.slice(caretIndex);
      caretIndex--;
    }

    const network = getCardNetwork(value);
    let formattedValue = formatCardNumber(value, network);
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
  };
};

const onCardExpirationDateInput = () => {
  let lastValue = '';

  return (event) => {
    const target = event.target;
    let { value, selectionStart: caretIndex } = target;

    const deleting = value.length < lastValue.length;
    if (!deleting && value.length === 1 && /[2-9]/.test(value)) {
      value = `0${value}`;
      caretIndex++;
    }

    // If the deleted character is not a digit, remove the second digit
    // of the month.
    if (deleting && !/\d/.test(lastValue[caretIndex])) {
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
    lastValue = formattedValue;
    target.setSelectionRange(caretIndex, caretIndex);
  };
};

const onCardSecurityCodeInput = (event) => {
  const target = event.target;
  const { value, selectionStart: caretIndex } = target;
  const network = getCardNetwork(cardNumberControl.value);

  target.value = formatCardSecurityCode(value, network);
  target.setSelectionRange(caretIndex, caretIndex);
};

cardNumberControl.addEventListener('input', onCardNumberInput());
cardExpirationDateControl.addEventListener('input', onCardExpirationDateInput());
cardSecurityCodeControl.addEventListener('input', onCardSecurityCodeInput);
