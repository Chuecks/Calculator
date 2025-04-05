let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let fullOperation = '';
let parenthesesOpen = false;

// Función para actualizar la pantalla
function updateDisplay() {
    const display = document.querySelector('.result');
    display.textContent = fullOperation || displayValue;
}

// Función para ingresar dígitos
function inputDigit(digit) {
    if (waitingForSecondOperand) {
        displayValue = digit;
        fullOperation += digit;
        waitingForSecondOperand = false;
    } else {
        displayValue = displayValue === '0' ? digit : displayValue + digit;
        fullOperation = fullOperation === '0' ? digit : fullOperation + digit;
    }
}

// Función para ingresar decimales
function inputDecimal() {
    if (waitingForSecondOperand) {
        displayValue = '0.';
        fullOperation += '0.';
        waitingForSecondOperand = false;
        return;
    }

    if (!displayValue.includes('.')) {
        displayValue += '.';
        fullOperation += '.';
    }
}

// Función para limpiar la calculadora
function clearCalculator() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    fullOperation = '';
}

// Función para verificar si el último carácter es un operador
function isLastCharOperator() {
    const operators = ['+', '-', '×', '÷'];
    // Eliminamos espacios y obtenemos el último carácter
    const lastChar = fullOperation.trim().slice(-1);
    return operators.includes(lastChar);
}

// Función para manejar operadores
function handleOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);

    // Si no hay números ingresados y se intenta poner un operador (excepto el menos para números negativos)
    if (fullOperation === '' && nextOperator !== '-') {
        return;
    }

    // Prevenir dos operadores seguidos
    if (isLastCharOperator()) {
        if (nextOperator === '=') {
            return; // No permitir igual después de un operador
        }
        // Reemplazar el operador anterior solo si no es un igual
        if (nextOperator !== '=') {
            fullOperation = fullOperation.slice(0, -2) + ' ' + nextOperator + ' ';
            operator = nextOperator;
            updateDisplay();
        }
        return;
    }

    // Si es el primer número negativo
    if (fullOperation === '' && nextOperator === '-') {
        fullOperation = '-';
        updateDisplay();
        return;
    }

    if (operator && waitingForSecondOperand) {
        operator = nextOperator;
        fullOperation = fullOperation.slice(0, -2) + ' ' + nextOperator + ' ';
        return;
    }

    if (firstOperand === null && !isNaN(inputValue)) {
        firstOperand = inputValue;
    } else if (operator) {
        const result = calculate(firstOperand, inputValue, operator);
        if (typeof result === 'string') {
            displayValue = result;
            fullOperation = result;
            firstOperand = null;
        } else {
            displayValue = `${parseFloat(result.toFixed(7))}`;
            firstOperand = result;
            if (nextOperator === '=') {
                fullOperation = displayValue;
            }
        }
    }

    if (nextOperator !== '=' && typeof firstOperand === 'number') {
        fullOperation = firstOperand + ' ' + nextOperator + ' ';
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
            if (secondOperand === 0) {
                return secondOperand === 0 ? 'No definido' : Infinity;
            }
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
    fullOperation = displayValue;
}

// Añadir nueva función para borrar último carácter
function deleteLastCharacter() {
    if (waitingForSecondOperand) {
        return;
    }
    
    if (fullOperation.length > 1) {
        fullOperation = fullOperation.slice(0, -1);
        displayValue = fullOperation;
    } else {
        fullOperation = '0';
        displayValue = '0';
    }
}

// Función para manejar paréntesis
function handleParentheses() {
    if (!parenthesesOpen) {
        fullOperation += '(';
        parenthesesOpen = true;
    } else {
        fullOperation += ')';
        parenthesesOpen = false;
    }
    updateDisplay();
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
            } else if (target.textContent === '()') {
                handleParentheses();
            } else if (target.textContent === '⌫') {
                deleteLastCharacter();
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

    // Mapeo de teclas del teclado
    const keyboardMap = {
        // Números
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        // Números del teclado numérico
        'Numpad0': '0', 'Numpad1': '1', 'Numpad2': '2', 'Numpad3': '3',
        'Numpad4': '4', 'Numpad5': '5', 'Numpad6': '6', 'Numpad7': '7',
        'Numpad8': '8', 'Numpad9': '9',
        // Operadores
        '+': '+', 'NumpadAdd': '+',
        '-': '-', 'NumpadSubtract': '-',
        '*': '×', 'NumpadMultiply': '×',
        '/': '÷', 'NumpadDivide': '÷',
        // Otros
        '.': '.', 'NumpadDecimal': '.',
        'Enter': '=', 'NumpadEnter': '=',
        '=': '=',
        'Backspace': '⌫',
        'Delete': 'C',
        'Escape': 'C',
        '(': '()',
        ')': '()'
    };

    // Añadir event listener para el teclado
    document.addEventListener('keydown', (event) => {
        event.preventDefault(); // Prevenir comportamiento por defecto

        const key = keyboardMap[event.key] || keyboardMap[event.code];
        
        if (key) {
            // Simular el clic en el botón correspondiente
            const buttons = document.querySelectorAll('button');
            const targetButton = Array.from(buttons).find(button => button.textContent === key);
            
            if (targetButton) {
                targetButton.click();
                // Añadir efecto visual de presionado
                targetButton.classList.add('active');
                setTimeout(() => targetButton.classList.remove('active'), 100);
            }
        }
    });
});