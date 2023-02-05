import { useContext, useState } from "react";
import { CSS_CLASS, MESSAGES, STORAGE_KEY, STRINGS } from "./constant";
import { AppContext, HashTable, LoginState, Note } from "./state";
import { Title } from "./title";
import { Amplify, Auth } from "aws-amplify";
import { CognitoUser } from '@aws-amplify/auth'
import React from "react";

Amplify.configure({
    Auth: {
        userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
        region: process.env.REACT_APP_COGNITO_REGION,
    }
});
Auth.configure();

export const LoginWindow: React.FC = () => {
    const { setAppState } = useContext(AppContext);
    const onLogin = () => {
        console.log("Should sign in");
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                loggingState: "signIn"
            }))
        }

    }

    const onSignUp = () => {
        console.log("Should sign up");
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                loggingState: "signUp"
            }))
        }
    }

    return <div>
        <div>
            <img src={"./icons8-notes-128.png"} />
        </div>
        <Title />
        <button onClick={onLogin}>{STRINGS.LOGIN}</button>
        <button onClick={onSignUp}>{STRINGS.SIGN_UP}</button>
    </div>
}

interface SignUpResult {
    user: CognitoUser,
    userConfirmed: boolean,
    userSub: string,
    errorMessage?: string
}

async function singUp(username: string, password: string, email?: string): Promise<SignUpResult | undefined> {
    const { user, userConfirmed, userSub } = await Auth.signUp({
        username: username,
        password: password,
        attributes: {
            email: email
        },
        autoSignIn: {
            enabled: true,
        }
    })
    console.log(user, userConfirmed, userSub);
    return {
        user: user,
        userConfirmed: userConfirmed,
        userSub: userSub
    }
}

async function signIn(username: string, password: string) {
    return await Auth.signIn(username, password);
}


const LogoutButton: React.FC = () => {
    const { setAppState } = useContext(AppContext);
    const onReturn = () => {
        localStorage.clear();
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                loggingState: "notLogged"
            }));
        }
    }

    return <button onClick={onReturn}>{STRINGS.BACK}</button>
}

interface AuthenticationProps {
    authenticationType: "signIn" | "signUp"
}


const getEmailAndPasswordFromAuthenticationWindow = () => {
    const emailId = "EMAIL_INPUT";
    const passwordId = "PASSWORD_INPUT";
    const email = (document.querySelector(`#${emailId}`) as HTMLTextAreaElement).value || "";
    const password = (document.querySelector(`#${passwordId}`) as HTMLTextAreaElement).value || "";
    return {
        email: email,
        password: password
    }
}

export const AuthenticationWindow: React.FC<AuthenticationProps> = (props: AuthenticationProps) => {
    const emailId = "EMAIL_INPUT";
    const passwordId = "PASSWORD_INPUT";
    const { setAppState } = useContext(AppContext);
    const [signUpStatus, setSignUpStatus] = React.useState("\n")

    const updateLoggingState = (newState: LoginState, userEmail: string) => {
        console.log("Finishing authentication...");
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                loggingState: newState,
                currUserEmail: userEmail
            }));
        }
        localStorage.setItem(STORAGE_KEY.LOGIN_STATE, newState);
        localStorage.setItem(STORAGE_KEY.USER_EMAIL, userEmail);
    };
    
    const restoreStateAfterLogin = () => {
        const previouslySavedNotesStr = localStorage.getItem(STORAGE_KEY.NOTES);
        let previouslySavedNotes: HashTable<Note> = {};
        if (previouslySavedNotesStr !== null) {
            previouslySavedNotes = JSON.parse(previouslySavedNotesStr);
        }
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                notes: previouslySavedNotes,
                loggingState: "completed"
            }))
        }

    }

    const onSubmit = () => {
        const { email, password } = getEmailAndPasswordFromAuthenticationWindow();
        if (props.authenticationType == "signUp") {
            const signUpResult = singUp(email, password, email);
            signUpResult
                .then(() => updateLoggingState("confirmationCode", email))
                .catch(
                    (error) => {
                        if ( "UsernameExistsException")
                        console.log(STRINGS.SIGN_UP_FAILED, error);
                        const code = error.code;
                        switch (code) {
                            case "UsernameExistsException":
                                updateLoggingState("confirmationCode", email);
                            default:
                                setSignUpStatus(`${STRINGS.SIGN_UP_FAILED} ${error}`);
                        }
                    });

        } else if (props.authenticationType === "signIn") {
            console.log("Handling sign in")
            const signInResult = signIn(email, password);
            signInResult
                .then(() => {
                    restoreStateAfterLogin();
                    updateLoggingState("completed", email);
                })
                .catch(
                    (error) => {
                        console.log(STRINGS.SIGN_UP_FAILED, error);
                        setSignUpStatus(`${STRINGS.SIGN_UP_FAILED} ${error}`)
                    }
                );
        }
    }

    return <div>
        <Title />
        <p>{STRINGS.EMAIL}</p>
        <input id={emailId}></input>
        <p>{STRINGS.PASSWORD}</p>
        <input id={passwordId}></input>
        <p className={CSS_CLASS.ERROR}>{signUpStatus}</p>
        <LogoutButton />
        <ForgotPasswordButton />
        <button onClick={onSubmit}>{STRINGS.SUBMIT}</button>
    </div>
}

async function resendConfirmationCode(email: string) {
    return await Auth.resendSignUp(email);
}
type ConfirmationCodeStatus = "notSent" | "sentSuccessfully" | "failed" | "invalidCode";

async function confirmSignUp(email: string, code: string) {
    await Auth.confirmSignUp(email, code);
}

export const ConfirmSignUpCodeWindow: React.FC = () => {
    const { setAppState, appState } = useContext(AppContext);

    const CONFIRMATION_CODE_ID = "confirmationCode";
    const initialConfirmationCodeStatus: ConfirmationCodeStatus = "notSent";
    const [resentConfirmationCodeStatus, setResendConfirmationCodeStatus] = React.useState<ConfirmationCodeStatus>(initialConfirmationCodeStatus);

    const messageMap: Map<ConfirmationCodeStatus, string> = new Map<ConfirmationCodeStatus, string>();
    messageMap.set("failed", MESSAGES.RESENT_CODE_FAILED);
    messageMap.set("notSent", MESSAGES.DEFAULT);
    messageMap.set("sentSuccessfully", MESSAGES.RESEND_CODE_SUCCESS);
    messageMap.set("invalidCode", MESSAGES.INVALID_SIGN_UP_CODE);

    const colorMap = new Map<ConfirmationCodeStatus, string>();
    colorMap.set("failed", CSS_CLASS.ERROR);
    colorMap.set("invalidCode", CSS_CLASS.ERROR);
    colorMap.set("notSent", "");
    colorMap.set("sentSuccessfully", CSS_CLASS.SUCCESS);

    const onResendCode = () => {
        const email = (document.querySelector(`#${CONFIRMATION_CODE_ID}`) as HTMLTextAreaElement).value.trim();
        const response = resendConfirmationCode(email);
        response.then(() => { setResendConfirmationCodeStatus("sentSuccessfully") })
            .catch(() => { setResendConfirmationCodeStatus("failed") });
    }

    const onSubmit = () => {
        let email: string;
        if (appState?.currUserEmail) {
            email = appState.currUserEmail;
        } else {
            const savedEmail = localStorage.getItem(STORAGE_KEY.USER_EMAIL);
            if (savedEmail) {
                email = savedEmail;
            } else {
                if (setAppState !== undefined) {
                    setAppState((oldState) => ({
                        ...oldState,
                        loggingState: "notLogged"
                    }))
                }
                return;
            }
        }
        const code = (document.querySelector(`#${CONFIRMATION_CODE_ID}`) as HTMLTextAreaElement).value.trim();
        const response = confirmSignUp(email, code);
        response.then(() => { updateLoggingState("completed", email) })
            .catch(() => setResendConfirmationCodeStatus("invalidCode"));
    }

    const updateLoggingState = (newState: LoginState, userEmail: string) => {
        console.log("Finishing authentication...");
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                loggingState: newState,
                currUserEmail: userEmail
            }));
        }
    };

    return <div>
        <Title />
        <p>Input the confirmation code from the email</p>
        <input id={CONFIRMATION_CODE_ID}></input>
        <button onClick={onSubmit}>Submit</button>
        <button onClick={onResendCode}>Re-send Code</button>
        <LogoutButton />
        <p className={colorMap.get(resentConfirmationCodeStatus)}>{messageMap.get(resentConfirmationCodeStatus)}</p>
    </div>
}

const ForgotPasswordButton: React.FC = () => {
    const { setAppState } = useContext(AppContext);
    const [emailIsPresent, setEmailIsPresent] = useState("");

    const updateLoggingState = (newState: LoginState, userEmail: string) => {
        console.log("Finishing authentication...");
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                loggingState: newState,
                currUserEmail: userEmail
            }));
        }
        localStorage.setItem(STORAGE_KEY.LOGIN_STATE, newState);
        localStorage.setItem(STORAGE_KEY.USER_EMAIL, userEmail);
    };

    const onForgotPassword = () => {
        const { email } = getEmailAndPasswordFromAuthenticationWindow();
        if (email !== "") {
            Auth.forgotPassword(email)
                .then(() => updateLoggingState("forgotPassword", email))
                .catch((err) => console.log(err));
        } else {
            setEmailIsPresent(MESSAGES.EMAIL_IS_EMPTY)
            return;
        }

        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                loggingState: "forgotPassword"
            }));
        }
    }

    return <div>
        <button onClick={onForgotPassword}>{STRINGS.FORGOT_PASSWORD}</button>
        <p>{emailIsPresent}</p>
        </div>
}


export const ForgotPasswordWindow: React.FC = () => {
    const { setAppState, appState } = useContext(AppContext);
    const CODE_ID = "CODE_ID"
    const NEW_PASSWORD_ID = "NEW_PASSWORD_ID"
    const CONFIRM_NEW_PASSWORD_ID = "NEW_PASSWORD_ID"
    const EMAIL_ID = "EMAIL_ID"

    const [forgotPasswordStatus, setForgotPasswordStatus] = React.useState("");

    const handleSuccess = () => {
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                loggingState: "completed"
            }));
        }
        setForgotPasswordStatus(MESSAGES.SUCESS_FORGOT_PASSWORD)
    }

    const handleFailure = (message?: string) => {
        if (message === undefined) {
            setForgotPasswordStatus(MESSAGES.FAILURE_FORGOT_PASSWORD)
        } else {
            setForgotPasswordStatus(message);
        }
    }   

    const onSubmitForgotPassword = () => {
        const code = (document.querySelector(`#${CODE_ID}`) as HTMLTextAreaElement).value
        const newPassword = (document.querySelector(`#${NEW_PASSWORD_ID}`) as HTMLTextAreaElement).value
        const confirmNewPassword = (document.querySelector(`#${CONFIRM_NEW_PASSWORD_ID}`) as HTMLTextAreaElement).value

        if (newPassword !== confirmNewPassword) {
            handleFailure(MESSAGES.PASSWORD_DOES_NOT_MATCH)
        }

        if (appState?.currUserEmail) {
            Auth.forgotPasswordSubmit(appState.currUserEmail, code, newPassword)
            .then(() => handleSuccess())
            .catch((err) => console.log(err));
        } else {
            handleFailure();
            console.log("Invalid email.")
        }
    }

    return <div>
        <p>{STRINGS.EMAIL}</p>
        <input id={EMAIL_ID}></input>
        <p>{}</p>
        <p>{STRINGS.CONFIRMATION_CODE}</p>
        <input id={CODE_ID}></input>
        <p>{STRINGS.PASSWORD}</p>
        <input id={NEW_PASSWORD_ID}></input>
        <p>{STRINGS.CONFIRM_PASSWORD}</p>
        <input id={CONFIRM_NEW_PASSWORD_ID}></input>
        <button onClick={onSubmitForgotPassword}>{STRINGS.SUBMIT}</button>
        <p>{forgotPasswordStatus}</p>
    </div>
}

