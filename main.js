import {
  countDigitsBeforeCaret,
  formatExpirationDate,
  formatNumber,
  formatSecurityCode,
  getCardNetwork,
  getCaretIndex,
  getDigitsOnly,
  numberComplete,
  validateLuhn
} from './modules/utilities.js'

const SELECTORS = {
  FORM: '.js-form',
  FORM_CONTROL: '.js-form-control',
  NUMBER_CONTROL : '.js-number-control',
  NAME_CONTROL: '.js-name-control',
  EXPIRATION_DATE_CONTROL : '.js-expiration-date-control',
  SECURITY_CODE_CONTROL : '.js-security-code-control',
};

const validators = {
  number: (value) => {
    if (!getDigitsOnly(value)) {
      return 'Card number is required';
    }
    if (getCardNetwork(value) === 'unknown') {
      return 'This card is not accepted';
    }
    if (!numberComplete(value)) {
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
  const invalid = !!message;
  errorElement.textContent = message;
  control.setAttribute('aria-invalid', `${invalid}`);

  return invalid;
};

const validateControl = (control) => toggleError(control, validators[control.id](control.value));

const formElement = document.querySelector(SELECTORS.FORM);
const numberControl = formElement.querySelector(SELECTORS.NUMBER_CONTROL);
const nameControl = formElement.querySelector(SELECTORS.NAME_CONTROL);
const expirationDateControl = formElement.querySelector(SELECTORS.EXPIRATION_DATE_CONTROL);
const securityCodeControl = formElement.querySelector(SELECTORS.SECURITY_CODE_CONTROL);

const onNumberInput = () => {
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

    const formattedValue = formatNumber(value);
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
      if (numberComplete(finalValue)) {
        validateControl(target);
      } else {
        toggleError(target);
      }
    }

    lastValue = finalValue;
  };
};

const onExpirationDateInput = () => {
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

    const formattedValue = formatExpirationDate(value);
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

const onSecurityCodeInput = (event) => {
  const target = event.target;
  const { value, selectionStart: caretIndex } = target;
  target.value = formatSecurityCode(value, getCardNetwork(numberControl.value));
  target.setSelectionRange(caretIndex, caretIndex);
};

numberControl.addEventListener('input', onNumberInput());
expirationDateControl.addEventListener('input', onExpirationDateInput());
securityCodeControl.addEventListener('input', onSecurityCodeInput);

formElement.addEventListener('focusout', (event) => {
  const target = event.target;
  if (target.matches(SELECTORS.FORM_CONTROL) && target.value.length) {
    validateControl(target);
  }
});

const formControls = [numberControl, nameControl, expirationDateControl, securityCodeControl];

formElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalidControls = formControls.filter(validateControl);
  if (invalidControls.length) {
    invalidControls[0].focus();
  } else {
    alert('Submitted');
  }
});
