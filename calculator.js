let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

// Función para actualizar la pantalla
function updateDisplay() {
    const display = document.querySelector('.result');
    display.textContent = displayValue;
}

// Función para ingresar dígitos
function inputDigit(digit) {
    if (waitingForSecondOperand) {
        displayValue = digit;
        waitingForSecondOperand = false;
    } else {
        displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
}

// Función para ingresar decimales
function inputDecimal() {
    if (waitingForSecondOperand) {
        displayValue = '0.';
        waitingForSecondOperand = false;
        return;
    }

    if (!displayValue.includes('.')) {
        displayValue += '.';
    }
}

// Función para limpiar la calculadora
function clearCalculator() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
}

// Función para manejar operadores
function handleOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        return;
    }

    if (firstOperand === null && !isNaN(inputValue)) {
        firstOperand = inputValue;
    } else if (operator) {
        const result = calculate(firstOperand, inputValue, operator);
        displayValue = `${parseFloat(result.toFixed(7))}`;
        firstOperand = result;
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
}

// Función para realizar los cálculos
function calculate(firstOperand, secondOperand, operator) {
    switch (operator) {
        case '+':
            return firstOperand + secondOperand;
        case '-':
            return firstOperand - secondOperand;
        case '×':
            return firstOperand * secondOperand;
        case '÷':
            return firstOperand / secondOperand;
        case '%':
            return (firstOperand / 100) * secondOperand;
        default:
            return secondOperand;
    }
}

// Función para cambiar el signo
function changeSign() {
    displayValue = displayValue.charAt(0) === '-' ? displayValue.slice(1) : '-' + displayValue;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const calculator = document.querySelector('.calculator');
    
    calculator.addEventListener('click', (event) => {
        const { target } = event;
        
        if (!target.matches('button')) {
            return;
        }

        if (target.classList.contains('operator')) {
            handleOperator(target.textContent);
            updateDisplay();
            return;
        }

        if (target.classList.contains('special')) {
            if (target.textContent === 'C') {
                clearCalculator();
            } else if (target.textContent === '+/-') {
                changeSign();
            } else if (target.textContent === '%') {
                handleOperator('%');
            }
            updateDisplay();
            return;
        }

        if (target.classList.contains('equals')) {
            handleOperator('=');
            updateDisplay();
            return;
        }

        if (target.classList.contains('number')) {
            if (target.textContent === '.') {
                inputDecimal();
            } else {
                inputDigit(target.textContent);
            }
            updateDisplay();
        }
    });
});