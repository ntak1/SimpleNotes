import React from "react";
import { useContext } from "react";
import { CLASS, STORAGE_KEY, STRINGS } from "./constant";
import { AppContext } from "./state";
import { Title } from "./title";
import { HashTable, Note } from "./types";
import { Auth } from "aws-amplify";
import { Amplify } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth'

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
                logginState: "ongoing"
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

export const SignUpWindow: React.FC = () => {
    const usernameId = "USER_NAME_INPUT";
    const emailId = "EMAIL_INPUT";
    const passwordId = "PASSWORD_INPUT";

    const { setAppState } = useContext(AppContext);
    const [ signUpStatus, setSignUpStatus ] = React.useState("\n")

    const onSubmit = () => {
        const username = (document.querySelector(`#${usernameId}`) as HTMLTextAreaElement).value;
        const email = (document.querySelector(`#${emailId}`) as HTMLTextAreaElement).value;
        const password = (document.querySelector(`#${passwordId}`) as HTMLTextAreaElement).value;
        const signUpResult = singUp(username, password, email);
        signUpResult.then(
            () => {
                console.log("Finishing sign up...")
                if (setAppState !== undefined) {
                    setAppState((oldState) => ({
                        ...oldState,
                        logginState: "completed"
                    }));
                }
            }
        ).catch((error) => {
            console.log(STRINGS.SIGN_UP_FAILED, error);
            setSignUpStatus(STRINGS.SIGN_UP_FAILED);
        });
    }
    return <div>
        <Title/>
        <p>Username</p>
        <input id={usernameId}></input>
        <p>Email</p>
        <input id={emailId}></input>
        <p>Password</p>
        <input id={passwordId}></input>
        <p className={CLASS.ERROR}>{signUpStatus}</p>
        <button onClick={onSubmit}>Submit</button>
    </div>
}