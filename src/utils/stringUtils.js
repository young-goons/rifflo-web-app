export const containsNum = (inputStr) => {
    return /\d/.test(inputStr);
};

export const containsLowercase = (inputStr) => {
    return /[a-z]/.test(inputStr);
};

export const containsSpecialChar = (inputStr) => {
    return /[~`!@#$%\^&*\(\)\[\]{}\?\.\\/":;',<>|-]/g.test(inputStr);
};