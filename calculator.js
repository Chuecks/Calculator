let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let fullOperation = '';
let parenthesesOpen = false;
let insideParentheses = false;
let parenthesesExpression = '';

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
    // Caso especial para el igual cuando hay paréntesis
    if (nextOperator === '=') {
        if (parenthesesOpen) {
            return;
        }

        if (isLastCharOperator()) {
            return;
        }

        // Si la operación es simple (sin paréntesis)
        if (!fullOperation.includes('(')) {
            const inputValue = parseFloat(displayValue);
            if (operator) {
                const result = calculate(firstOperand, inputValue, operator);
                if (result === 'No definido' || result === 'Error') {
                    displayValue = result;
                    fullOperation = result;
                } else {
                    displayValue = `${parseFloat(result.toFixed(7))}`;
                    fullOperation = displayValue;
                }
                firstOperand = null;
                operator = null;
                waitingForSecondOperand = false;
                updateDisplay();
                return;
            }
        } else {
            // Manejar expresiones con paréntesis
            try {
                const result = evaluateCompleteExpression(fullOperation);
                if (typeof result === 'string') {
                    displayValue = result;
                    fullOperation = result;
                } else {
                    displayValue = `${parseFloat(result.toFixed(7))}`;
                    fullOperation = displayValue;
                }
                firstOperand = null;
                operator = null;
                waitingForSecondOperand = false;
                updateDisplay();
            } catch (error) {
                displayValue = 'Error';
                fullOperation = 'Error';
                updateDisplay();
            }
            return;
        }
    }

    const inputValue = parseFloat(displayValue);

    // Si estamos dentro de paréntesis, manejarlo diferente
    if (insideParentheses) {
        if (isLastCharOperator() && nextOperator !== '-') {
            fullOperation = fullOperation.slice(0, -2) + ' ' + nextOperator + ' ';
        } else if (nextOperator !== '=') {
            fullOperation += ' ' + nextOperator + ' ';
        }
        updateDisplay();
        return;
    }

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
            if (nextOperator === '=' && fullOperation.includes('(')) {
                const completeResult = evaluateCompleteExpression(fullOperation);
                displayValue = typeof completeResult === 'number' ? 
                    `${parseFloat(completeResult.toFixed(7))}` : completeResult;
                fullOperation = displayValue;
                firstOperand = parseFloat(completeResult);
                operator = null;
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
    // Verificar si los operandos son números válidos
    if (isNaN(firstOperand) || isNaN(secondOperand)) {
        return 'Error';
    }

    switch (operator) {
        case '+': return firstOperand + secondOperand;
        case '-': return firstOperand - secondOperand;
        case '×': return firstOperand * secondOperand;
        case '÷':
            if (secondOperand === 0) return 'No definido';
            return firstOperand / secondOperand;
        case '%': return (firstOperand / 100) * secondOperand;
        default: return secondOperand;
    }
}

// Nueva función para evaluar expresiones completas
function evaluateCompleteExpression(expression) {
    try {
        // Verificar que todos los paréntesis estén cerrados
        const openCount = (expression.match(/\(/g) || []).length;
        const closeCount = (expression.match(/\)/g) || []).length;
        if (openCount !== closeCount) {
            return 'Error';
        }

        // Evaluar la expresión
        while (expression.includes('(')) {
            expression = expression.replace(/\(([^()]+)\)/g, (match, group) => {
                const result = evaluateExpression(group);
                return result;
            });
        }
        
        return evaluateExpression(expression);
    } catch (error) {
        return 'Error';
    }
}

// Modificar la función evaluateExpression
function evaluateExpression(expression) {
    expression = expression.trim();
    
    // Manejar el caso de un solo número
    if (!expression.match(/[\+\-\×\÷]/)) {
        const value = parseFloat(expression);
        return isNaN(value) ? 'Error' : value;
    }
    
    const parts = expression.split(/\s*([\+\-\×\÷])\s*/).filter(part => part !== '');
    
    // Manejar multiplicación implícita
    for (let i = 0; i < parts.length - 1; i++) {
        if (!isNaN(parts[i]) && parts[i+1].startsWith('(')) {
            parts.splice(i + 1, 0, '×');
        }
    }

    // Primero hacer multiplicación y división
    for (let i = 1; i < parts.length - 1; i += 2) {
        if (parts[i] === '×' || parts[i] === '÷') {
            const left = parseFloat(parts[i - 1]);
            const right = parseFloat(parts[i + 1]);
            
            // Verificar si los operandos son números válidos
            if (isNaN(left) || isNaN(right)) {
                return 'Error';
            }

            let result;
            if (parts[i] === '×') {
                result = left * right;
            } else {
                if (right === 0) return 'No definido';
                result = left / right;
            }

            if (isNaN(result) || !isFinite(result)) {
                return 'Error';
            }

            parts.splice(i - 1, 3, result.toString());
            i -= 2;
        }
    }

    // Luego hacer suma y resta
    let result = parseFloat(parts[0]);
    if (isNaN(result)) return 'Error';

    for (let i = 1; i < parts.length; i += 2) {
        const operator = parts[i];
        const operand = parseFloat(parts[i + 1]);
        
        // Verificar si el operando es un número válido
        if (isNaN(operand)) {
            return 'Error';
        }

        if (operator === '+') result += operand;
        else if (operator === '-') result -= operand;
    }

    // Verificación final del resultado
    if (isNaN(result) || !isFinite(result)) {
        return 'Error';
    }

    return result;
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
        // Abrir paréntesis
        if (fullOperation !== '' && !isLastCharOperator() && !fullOperation.endsWith('(')) {
            fullOperation += ' × ('; // Multiplicación implícita
        } else {
            fullOperation += '(';
        }
        parenthesesOpen = true;
        insideParentheses = true;
    } else {
        // Cerrar paréntesis
        if (fullOperation.endsWith('(')) {
            return; // No cerrar si está vacío
        }
        // No cerrar si el último carácter es un operador
        if (isLastCharOperator()) {
            return;
        }
        fullOperation += ')';
        parenthesesOpen = false;
        insideParentheses = false;
    }
    updateDisplay();
}

// Receptor de eventos
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