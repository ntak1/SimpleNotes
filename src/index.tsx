import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown'
import { CSS_CLASS, STORAGE_KEY, STRINGS } from './constant';
import "./style.css";
import { v4 as uuidv4 } from 'uuid';
import { TitleWithIcon } from './title';
import { LoginWindow, AuthenticationWindow, ConfirmSignUpCodeWindow, ForgotPasswordWindow } from './login';
import { AppContext, AppState, defaultAppState, LoginState, Note } from './state';
import { isNullOrUndefined } from '@aws-amplify/datastore/lib-esm/util';

const NoteListElement: React.FC<Note> = (props: Note) => {
    const { appState, setAppState } = useContext(AppContext);
    const onDelete = () => {
        if (setAppState !== undefined) {
            setAppState((oldState) => {
                const updatedNotes = oldState.notes;
                delete updatedNotes[props.id as string];
                localStorage.setItem(STORAGE_KEY.NOTES, JSON.stringify(updatedNotes));
                return {
                    ...oldState,
                    notes: updatedNotes
                }
            })
        }
    }
    const onEdit = () => {
        let notes = appState?.notes || {};
        notes[props.id] = {
            title: props.title,
            id: props.id,
            body: props.body
        }
        console.log("props.body:", props.body)
        if (setAppState !== undefined) {
            setAppState(
                (oldState: any) => ({
                    ...oldState,
                    shouldListNotes: false,
                    notes: notes,
                    shouldEditNote: true,
                    noteToBeEdited: props.id
                })
            )
        }
    }
    return <li>
        <p>{props.title}</p>
        <button onClick={onEdit}>{STRINGS.EDIT}</button>
        <button onClick={onDelete}>{STRINGS.DELETE}</button>
    </li>
}

const NotesWindow = () => {
    const { appState, setAppState } = useContext(AppContext);
    const listNotes = () => {
        const notes: Note[] = [];
        if (appState?.notes !== undefined)
            Object.entries(appState?.notes).forEach(([key, value]) => notes.push(value as any));
        return notes.map((elem) => { return <NoteListElement title={elem.title} id={elem.id} body={elem.body}></NoteListElement> })
    }
    const onToggleListNotes = () => {
        if (setAppState !== undefined) {
            setAppState(
                (oldElem) => ({ ...oldElem, shouldListNotes: !oldElem.shouldListNotes })
            );
        }
    }

    return <div style={{ top: "30px", position: "absolute", left: "20px" }}>
        <button onClick={onToggleListNotes}>{STRINGS.BACK}</button>
        <br></br>
        <div className={CSS_CLASS.NOTES_LIST}>
            <ul>
                {listNotes()}
            </ul>
        </div>
    </div>
}


const MainWindow: React.FC = () => {
    const [markdownText, setMarkdownText] = React.useState("");
    const { appState, setAppState } = useContext(AppContext);

    const onSave = () => {
        const previewElements = document.querySelector(`div.${CSS_CLASS.PREVIEW}`);
        const title = previewElements?.textContent?.split("\n")[0] || STRINGS.UNTITLED;

        const body = document.querySelector(`#main-text-entry`) as HTMLTextAreaElement;
        const bodyContent = body.value;
        console.log("body value:", bodyContent);

        if (setAppState !== undefined) {
            let id: string;
            if (appState?.shouldUpdateNode === true) {
                id = appState.noteToBeEdited as string;
                console.log("saving existing id");
            } else {
                id = uuidv4();
            }

            setAppState((oldState: any) => {
                const updatedState = oldState;
                updatedState.notes[id] = {
                    id: id,
                    title: title,
                    body: bodyContent
                }
                return {
                    ...updatedState,
                    shouldEditNote: false,
                    shouldUpdateNode: false
                }
            })
            localStorage.setItem(STORAGE_KEY.NOTES, JSON.stringify(appState?.notes));
        }
    };

    const onToggleListNotes = () => {
        if (setAppState !== undefined) {
            setAppState(
                (oldElem) => ({ ...oldElem, shouldListNotes: !oldElem.shouldListNotes })
            );
        }
    }

    const onChangeText = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setMarkdownText(event.target.value);
    };

    const onLogout = () => {
        localStorage.clear();
        if (setAppState !== undefined) {
            setAppState(
                (oldElem: any) => ({ ...oldElem, loggingState: false })
            )
        }
    }

    const inputTextEntry = () => {
        console.log("shouldEditNote", appState?.shouldEditNote);
        if (appState?.shouldEditNote === true) {
            const selectedNote = appState.notes[appState.noteToBeEdited as string];
            console.log(selectedNote);
            if (setAppState !== undefined) {
                setAppState((oldState: any) => ({ ...oldState, shouldEditNote: false, shouldUpdateNode: true }))
            }
            if (selectedNote !== undefined) {
                return <textarea id="main-text-entry" onChange={onChangeText} value={selectedNote.body || ""}></textarea>
            }
        }
        return <textarea id="main-text-entry" onChange={onChangeText}></textarea>
    }

    return <div>
        <TitleWithIcon />
        <button onClick={onSave}>{STRINGS.SAVE}</button>
        <button onClick={onToggleListNotes}>{STRINGS.LIST_NOTES}</button>
        <button onClick={onLogout}>{STRINGS.LOGOUT}</button>
        {inputTextEntry()}
        <ReactMarkdown className={CSS_CLASS.PREVIEW}>{markdownText}</ReactMarkdown>
    </div>
}


const App = () => {
    const defaultInitialLoginState: LoginState = "notLogged";
    const previouslySavedState = localStorage.getItem(STORAGE_KEY.LOGIN_STATE);
    let loginState: LoginState = defaultInitialLoginState;
    if (isNullOrUndefined(previouslySavedState)) {
        loginState = defaultInitialLoginState;
    } else {
        loginState = previouslySavedState as LoginState;
        console.log("restored loggin state from storage", loginState)
    }

    const [appState, setAppState] = React.useState<AppState>({ ...defaultAppState, loggingState: loginState });
    
    let component;
    if (appState.loggingState === "completed" && appState.shouldListNotes) {
        component = <NotesWindow />
    }
    else if (appState.loggingState === "completed") {
        component = <MainWindow />
    }
    else if (appState.loggingState === "signUp") {
        component = <AuthenticationWindow authenticationType={"signUp"} />
    } else if (appState.loggingState === "signIn") {
        component = <AuthenticationWindow authenticationType={"signIn"} />
    } else if (appState.loggingState === "confirmationCode") {
        component = <ConfirmSignUpCodeWindow />
        console.log("Confirm sign up window", appState)
    }
    else if (appState.loggingState === "forgotPassword") {
        component = <ForgotPasswordWindow />
    }
    else {
        component = <LoginWindow />
    }
    return <AppContext.Provider value={{ appState, setAppState }}>{component}</AppContext.Provider>;

}


ReactDOM.render(
    <React.StrictMode><App /></React.StrictMode>, document.getElementById("root")
);
