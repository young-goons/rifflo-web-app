const BANNED_USERNAME_ARR = [
    "help", "people", "contact", "post", "user"
];

const BANNED_CHAR_ARR = [
    "\\", "/", ":", "*", "?", "\"", "<", ">", "|", " "
];

const USERNAME_MAX_LENGTH = 50;
const NAME_MAX_LENGTH = 50;
const LOCATION_MAX_LENGTH = 100;

export const validateUsername = (usernameStr) => {
    if (BANNED_USERNAME_ARR.includes(usernameStr)) {
        return {
            valid: false,
            msg: "Input username is a reserved keyword."
        };
    } else if (usernameStr.length > USERNAME_MAX_LENGTH) {
        return {
            valid: false,
            msg: "Username cannot be longer than " + USERNAME_MAX_LENGTH + " characters"
        };
    } else {
        let includeIllegalChar = false;
        for (let i = 0; i < usernameStr.length; i++) {
            if (BANNED_CHAR_ARR.includes(usernameStr.charAt(i))) {
                includeIllegalChar = true;
                break;
            }
        }
        if (includeIllegalChar) {
            return {
                valid: false,
                msg: "\\, /, :, *, ?, \", <, >, |, ' ' illegal in username"
            };
        } else {
            return {
                valid: true,
                msg: null
            };
        }
    }
};

export const validateName = (nameStr) => {
    if (nameStr.length > NAME_MAX_LENGTH) {
        return {
            valid: false,
            msg: 'Name cannot be longer than ' + NAME_MAX_LENGTH + ' characters'
        };
    } else {
        return {
            valid: true,
            msg: null
        };
    }
};

export const validateLocation = (locationStr) => {
    if (locationStr.length > LOCATION_MAX_LENGTH) {
        return {
            valid: false,
            msg: 'Location cannot be longer than ' + LOCATION_MAX_LENGTH + ' characters'
        };
    } else {
        return {
            valid: true,
            msg: null
        };
    }
};