import React from "react";
import { useContext } from "react";
import { CLASS, STORAGE_KEY, STRINGS } from "./constant";
import { AppContext } from "./state";
import { Title } from "./title";
import { HashTable, LoginState, Note } from "./types";
import { Amplify, Auth } from "aws-amplify";
import { CognitoUser } from '@aws-amplify/auth'

Amplify.configure({
    Auth: {
        userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
        region: process.env.REACT_APP_COGNITO_REGION,
    }
});
const configuration = Auth.configure();
console.log(configuration);

export const LoginWindow: React.FC = () => {
    const { setAppState } = useContext(AppContext);
    const onLogin = () => {
        const previouslySavedNotesStr = localStorage.getItem(STORAGE_KEY.notes);
        let previouslySavedNotes: HashTable<Note> = {};
        if (previouslySavedNotesStr !== null) {
            previouslySavedNotes = JSON.parse(previouslySavedNotesStr);
        }
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                notes: previouslySavedNotes,
                logginState: "completed"
            }))
        }
    }

    const onSignUp = () => {
        console.log("Should sign up");
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                logginState: "signup"
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
    try {
        const user = await Auth.signIn(username, password);
    } catch (error) {
        console.log('error signing in', error);
    }
}

const LoggoutButton: React.FC = () => {
    const { setAppState } = useContext(AppContext);
    const onReturn = () => {
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                logginState: "notLogged"
            }));
        }
    }

    return <button onClick={onReturn}>{STRINGS.BACK}</button>
}

interface AuthenticationProps {
    authenticationType: "signin" | "signup"
}

export const AuthenticationWindow: React.FC<AuthenticationProps> = (props: AuthenticationProps) => {
    const emailId = "EMAIL_INPUT";
    const passwordId = "PASSWORD_INPUT";

    const { setAppState } = useContext(AppContext);
    const [signUpStatus, setSignUpStatus] = React.useState("\n")

    const getEmailAndPassword = () => {
        const email = (document.querySelector(`#${emailId}`) as HTMLTextAreaElement).value;
        const password = (document.querySelector(`#${passwordId}`) as HTMLTextAreaElement).value;
        return {
            email: email,
            password: password
        }
    }

    const updateLogginState = (newState: LoginState) => {
        console.log("Finishing authentication...");
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                logginState: newState
            }));
        }
    };
    const onSubmit = () => {
        const { email, password } = getEmailAndPassword();
        if (props.authenticationType == "signup") {
            const signUpResult = singUp(email, password, email);
            signUpResult
                .then(() => updateLogginState("confirmationCode"))
                .catch(
                    (error) => {
                        console.log(STRINGS.SIGN_UP_FAILED, error);
                        setSignUpStatus(`${STRINGS.SIGN_UP_FAILED} ${error}`);
                    });
        } else if (props.authenticationType === "signin") {
            console.log("Handling sign in")
            const signInResult = signIn(email, password);
            signInResult
                .then(() => updateLogginState("completed"))
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
        <p className={CLASS.ERROR}>{signUpStatus}</p>
        <LoggoutButton />
        <button onClick={onSubmit}>{STRINGS.SUBMIT}</button>
    </div>
}


export const ConfirmSignUpCodeWindow: React.FC = () => {
    const CONFIRMATION_CODE_ID = "confirmationCode";
    return <div>
        <Title />
        <p>Input the confirmation code from the email</p>
        <input id={CONFIRMATION_CODE_ID}></input>
        <button>Submit</button>
        <LoggoutButton />
    </div>
}