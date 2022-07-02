import React from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown'
import { CLASS, STRINGS } from './constant';
import "./style.css";

interface LoginProps {
    onLogin: () => void
}

const LoginWindow: React.FC<LoginProps> = (props: LoginProps) => {
    const onLogin = () => {
        props.onLogin();
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
    title: string;
    body?: string;
}

const NoteListElement: React.FC<Note> = (props: Note) => {
    return <div>
        <p>{props.title}</p>
        <button>{STRINGS.EDIT}</button>
    </div>
}


interface NotesProps {
    notes: Array<Note>;
    onAddNotes: Function;
    onToggleListNotes: () => void;
}

const NotesWindow = (props: NotesProps) => {
    const listNotes = (props: NotesProps) => {
        return props.notes.map((elem) => { return <NoteListElement title={elem.title}></NoteListElement> })
    }
    return <div>
        <Title />
        <button onClick={props.onToggleListNotes}>{STRINGS.BACK}</button>
        <ul>
            <li>{listNotes(props)}</li>
        </ul>
    </div>
}

interface MainWindowProps {
    onLogin: Function;
    onSaveNotes: (note: Note) => void;
    onToggleListNotes: () => void;
}

const MainWindow: React.FC<MainWindowProps> = (props: MainWindowProps) => {
    const [markdownText, setMarkdownText] = React.useState("");

    const onSave = () => {
        const previewElements = document.querySelector(`div.${CLASS.PREVIEW}`);
        const title = previewElements?.textContent?.split("\n")[0] || STRINGS.UNTITLED;

        const body = document.querySelector(`#main-text-entry`) as HTMLTextAreaElement;
        const bodyContent = body.value;

        console.log(title);
        console.log(bodyContent);
        props.onSaveNotes({
            title: title,
            body: bodyContent
        });
    };

    const onList = () => {
        props.onToggleListNotes();
    };

    const onChangeText = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setMarkdownText(event.target.value);
    };

    return <div>
        <Title />
        <button onClick={onSave}>{STRINGS.SAVE}</button>
        <button onClick={onList}>{STRINGS.LIST_NOTES}</button>
        <textarea id="main-text-entry" onChange={onChangeText}></textarea>
        <ReactMarkdown className={CLASS.PREVIEW}>{markdownText}</ReactMarkdown>
    </div>;
}

interface AppProps {
    logginCompleted: boolean;
    shouldListNotes: boolean;
};

const App = () => {
    const [stateProps, setStateProps] = React.useState<AppProps>({
        logginCompleted: false,
        shouldListNotes: false
    });
    const [notes, setNotes] = React.useState<Note[]>([]);

    const onLogin = () => {
        setStateProps((oldProps) => ({ ...oldProps, logginCompleted: true }));
    }
    console.log(stateProps.logginCompleted);

    const onAddNotes = (note: Note) => {
        setNotes((oldNotes) => [...oldNotes, note]);
    }

    const onToggleListNotes = () => {
        setStateProps(
            (oldElem) => ({...oldElem, shouldListNotes: !oldElem.shouldListNotes})
        );
    }

    if (stateProps.logginCompleted && stateProps.shouldListNotes) {
        return <NotesWindow notes={notes} onAddNotes={onAddNotes} onToggleListNotes={onToggleListNotes}/>
    }
    if (stateProps.logginCompleted) {
        return <MainWindow onLogin={onLogin} onSaveNotes={onAddNotes} onToggleListNotes={onToggleListNotes}/>;
    }
    return <LoginWindow onLogin={onLogin} />;
}

ReactDOM.render(
    <React.StrictMode><App /></React.StrictMode>, document.getElementById("root")
);