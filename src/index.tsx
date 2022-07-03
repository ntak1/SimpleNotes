import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown'
import { CLASS, STRINGS } from './constant';
import "./style.css";


const defaultAppState: AppState = {
    logginCompleted: false,
    shouldListNotes: false,
    notes: [],
}

interface AppContextType {
    appState: typeof defaultAppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>
}
const AppContext = React.createContext<Partial<AppContextType>>({});


const LoginWindow: React.FC = () => {
    const { setAppState } = useContext(AppContext);
    const onLogin = () => {
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                logginCompleted: true
            }))
        }
    }
    return <div>
        <h1>{STRINGS.APP_NAME}</h1>
        <button onClick={onLogin}>{STRINGS.LOGIN}</button>
        <button>{STRINGS.SIGN_IN}</button>
    </div>
}


const Title: React.FC = () => {
    return <div className={CLASS.TITLE}>
        <h1>{STRINGS.APP_NAME}</h1>
    </div>
}



interface Note {
    id: number;
    title: string;
    body?: string;
}

const NoteListElement: React.FC<Note> = (props: Note) => {
    const { appState, setAppState } = useContext(AppContext);
    const onDelete = () => {
        if (setAppState !== undefined) {
            let updatedNotesList = appState?.notes || [];
            updatedNotesList = updatedNotesList.filter((note) => note.id !== props.id);
            setAppState((oldState) => (
                { ...oldState, notes: updatedNotesList }
            ));
        }
    }
    return <div>
        <p>{props.title}</p>
        <button>{STRINGS.EDIT}</button>
        <button onClick={onDelete}>{STRINGS.DELETE}</button>
    </div>
}

const NotesWindow = () => {
    const { appState, setAppState } = useContext(AppContext);
    const listNotes = () => {
        let notes: Note[] = [];
        if (appState != undefined) {
            notes = [...(appState?.notes)]
        }
        return notes.map((elem) => { return <NoteListElement title={elem.title} id={elem.id}></NoteListElement> })
    }
    const onToggleListNotes = () => {
        if (setAppState !== undefined) {
            setAppState(
                (oldElem) => ({ ...oldElem, shouldListNotes: !oldElem.shouldListNotes })
            );
        }
    }

    return <div>
        <Title />
        <button onClick={onToggleListNotes}>{STRINGS.BACK}</button>
        <ul>
            <li>{listNotes()}</li>
        </ul>
    </div>
}


const MainWindow: React.FC = () => {
    const [markdownText, setMarkdownText] = React.useState("");
    const { setAppState } = useContext(AppContext);

    const onSave = () => {
        const previewElements = document.querySelector(`div.${CLASS.PREVIEW}`);
        const title = previewElements?.textContent?.split("\n")[0] || STRINGS.UNTITLED;

        const body = document.querySelector(`#main-text-entry`) as HTMLTextAreaElement;
        const bodyContent = body.value;

        console.log(title);
        console.log(bodyContent);
        if (setAppState !== undefined) {
            setAppState((oldState) => ({
                ...oldState,
                notes: [...(oldState.notes), {
                    title: title, body: bodyContent,
                    id: oldState.notes.length + 1
                }]
            }))
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

    return <div>
        <Title />
        <button onClick={onSave}>{STRINGS.SAVE}</button>
        <button onClick={onToggleListNotes}>{STRINGS.LIST_NOTES}</button>
        <textarea id="main-text-entry" onChange={onChangeText}></textarea>
        <ReactMarkdown className={CLASS.PREVIEW}>{markdownText}</ReactMarkdown>
    </div>;
}

interface AppState {
    logginCompleted: boolean;
    shouldListNotes: boolean;
    notes: Note[];
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