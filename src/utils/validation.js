/**
 * Validación de campos requeridos
 */
export function validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return {
            isValid: false,
            error: `${fieldName} es requerido`
        };
    }
    return { isValid: true, error: null };
}

/**
 * Validación de título de tarea
 */
export function validateTaskTitle(title) {
    const result = validateRequired(title, 'Título de tarea');
    if (!result.isValid) return result;

    if (title.length > 200) {
        return {
            isValid: false,
            error: 'El título no puede exceder 200 caracteres'
        };
    }

    return { isValid: true, error: null };
}

/**
 * Validación de email
 */
export function validateEmail(email) {
    if (!email) {
        return { isValid: true, error: null }; // Email es opcional en algunos casos
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            error: 'Formato de email inválido'
        };
    }

    return { isValid: true, error: null };
}

/**
 * Validación de nombre de proyecto/cliente
 */
export function validateName(name, fieldName = 'Nombre') {
    const result = validateRequired(name, fieldName);
    if (!result.isValid) return result;

    if (name.length < 2) {
        return {
            isValid: false,
            error: `${fieldName} debe tener al menos 2 caracteres`
        };
    }

    if (name.length > 100) {
        return {
            isValid: false,
            error: `${fieldName} no puede exceder 100 caracteres`
        };
    }

    return { isValid: true, error: null };
}
