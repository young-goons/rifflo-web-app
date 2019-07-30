import { FACEBOOK_APP_ID } from "../credentials";

export const federationConfig = {
    facebook_app_id: FACEBOOK_APP_ID
};

export const signUpConfig = {
    header: "Create a new account",
    hideAllDefaults: true,
    signUpFields: [
        {
            label: "Email",
            key: "username",
            required: true,
            placeholder: "Email",
            type: "email",
            displayOrder: 1
        },
        {
            label: "Rifflo Username",
            key: "preferred_username",
            required: true,
            placeholder: "Username",
            type: "string",
            displayOrder: 2
        },
        {
            label: "Password",
            key: "password",
            required: true,
            placeholder: "Password",
            type: "password",
            displayOrder: 3
        },
    ]
};

export const authPageTheme = {
    oAuthSignInButton: {display: "none"},
    input: {}
};

// References

// https://aws-amplify.github.io/docs/js/react#signup-configuration