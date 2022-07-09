import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown'
import { CLASS, STORAGE_KEY, STRINGS } from './constant';
import "./style.css";
import { v4 as uuidv4 } from 'uuid';


const defaultAppState: AppState = {
    logginCompleted: false,
    shouldListNotes: false,
    shouldEditNote: false,
    notes: {},
    shouldUpdateNode: false,
}

interface AppContextType {
    appState: typeof defaultAppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>
}
const AppContext = React.createContext<Partial<AppContextType>>({});


const LoginWindow: React.FC = () => {
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
                logginCompleted: true
            }))
        }
    }
    return <div>
        <div>
            <img src={"./icons8-notes-128.png"} />
        </div>
        <Title />
        <button onClick={onLogin}>{STRINGS.LOGIN}</button>
        <button>{STRINGS.SIGN_IN}</button>
    </div>
}

const Title: React.FC = () => {
    return <div className={CLASS.TITLE}>
        <h1>{STRINGS.APP_NAME}</h1>
    </div>
}

const TitleWithIcon: React.FC = () => {
    return <div className={CLASS.TITLE}>
        <img src={"./icons8-notes-32.png"} />
        <h1>{STRINGS.APP_NAME}</h1>
    </div>
}

interface Note {
    id: string;
    title: string;
    body?: string;
}

const NoteListElement: React.FC<Note> = (props: Note) => {
    const { appState, setAppState } = useContext(AppContext);
    const onDelete = () => {
        if (setAppState !== undefined) {
            setAppState((oldState) => {
                const updatedNotes = oldState.notes;
                delete updatedNotes[props.id as string];
                localStorage.setItem(STORAGE_KEY.notes, JSON.stringify(updatedNotes));
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
                (oldState) => ({
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
            Object.entries(appState?.notes).forEach(([key, value]) => notes.push(value));
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
        <div className={CLASS.NOTES_LIST}>
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
        const previewElements = document.querySelector(`div.${CLASS.PREVIEW}`);
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

            setAppState((oldState) => {
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
            localStorage.setItem(STORAGE_KEY.notes, JSON.stringify(appState?.notes));
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
                (oldElem) => ({ ...oldElem, logginCompleted: false })
            )
        }
    }

    const inputTextEntry = () => {
        console.log("shouldEditNote", appState?.shouldEditNote);
        if (appState?.shouldEditNote === true) {
            const selectedNote = appState.notes[appState.noteToBeEdited as string];
            console.log(selectedNote);
            if (setAppState !== undefined) {
                setAppState((oldState) => ({ ...oldState, shouldEditNote: false, shouldUpdateNode: true }))
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
        <ReactMarkdown className={CLASS.PREVIEW}>{markdownText}</ReactMarkdown>
    </div>
}

interface HashTable<T> {
    [key: string]: T;
}

interface AppState {
    logginCompleted: boolean;
    shouldListNotes: boolean;
    notes: HashTable<Note>;
    shouldEditNote: boolean;
    shouldUpdateNode: boolean;
    noteToBeEdited?: string;
};


const App = () => {
    const [appState, setAppState] = React.useState<AppState>(defaultAppState);
    let component;
    if (appState.logginCompleted && appState.shouldListNotes) {
        component = <NotesWindow />
    }
    else if (appState.logginCompleted) {
        component = <MainWindow />
    }
    else {
        component = <LoginWindow />
    }
    return <AppContext.Provider value={{ appState, setAppState }}>{component}</AppContext.Provider>;
}


ReactDOM.render(
    <React.StrictMode><App /></React.StrictMode>, document.getElementById("root")
);
