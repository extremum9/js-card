import {
  cardNumberComplete,
  countDigitsBeforeCaret,
  formatCardExpirationDate,
  formatCardNumber,
  formatCardSecurityCode,
  getCardNetwork,
  getCaretIndex,
  getDigitsOnly,
  validateLuhn
} from './modules/utilities.js'

const SELECTORS = {
  FORM: '.js-form',
  CARD_NUMBER_CONTROL : '.js-card-number-control',
  CARD_NAME_CONTROL: '.js-card-name-control',
  CARD_EXPIRATION_DATE_CONTROL : '.js-card-expiration-date-control',
  CARD_SECURITY_CODE_CONTROL : '.js-card-security-code-control',
};

const validators = {
  number: (value) => {
    if (!getDigitsOnly(value)) {
      return 'Card number is required';
    }
    if (getCardNetwork(value) === 'unknown') {
      return 'This card is not accepted';
    }
    if (!cardNumberComplete(value)) {
      return 'Your card number is incomplete';
    }
    if (!validateLuhn(value)) {
      return 'Your card number is invalid';
    }

    return '';
  }
};

const toggleError = (control, message = '') => {
  const errorElement = document.getElementById(control.getAttribute('aria-describedby'));
  const hasError = !!message;
  errorElement.textContent = message;
  control.setAttribute('aria-invalid', `${hasError}`);

  return hasError;
};

const validateControl = (control) => toggleError(control, validators[control.name](control.value));

const formElement = document.querySelector(SELECTORS.FORM);
const cardNumberControl = formElement.querySelector(SELECTORS.CARD_NUMBER_CONTROL);
const cardNameControl = formElement.querySelector(SELECTORS.CARD_NAME_CONTROL);
const cardExpirationDateControl = formElement.querySelector(SELECTORS.CARD_EXPIRATION_DATE_CONTROL);
const cardSecurityCodeControl = formElement.querySelector(SELECTORS.CARD_SECURITY_CODE_CONTROL);

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

    const formattedValue = formatCardNumber(value);
    const finalValue = deleting ? formattedValue.trimEnd() : formattedValue;

    const digitsBeforeCaret = countDigitsBeforeCaret(value, caretIndex);
    caretIndex = getCaretIndex(finalValue, digitsBeforeCaret);
    // Move the caret past the newly added space.
    if (!deleting && finalValue[caretIndex] === ' ') {
      caretIndex++;
    }

    target.value = finalValue;
    target.setSelectionRange(caretIndex, caretIndex);

    if (lastValue !== finalValue) {
      if (cardNumberComplete(finalValue)) {
        validateControl(target);
      } else {
        toggleError(target);
      }
    }

    lastValue = finalValue;
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

const formControls = [cardNumberControl, cardNameControl, cardExpirationDateControl, cardSecurityCodeControl];
formControls.forEach((control) => control.addEventListener('blur', () => {
  if (control.value.length) {
    validateControl(control);
  }
}));

formElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalidControls = formControls.filter(validateControl);
  if (invalidControls.length) {
    invalidControls[0].focus();
  } else {
    alert('Submitted');
  }
});
