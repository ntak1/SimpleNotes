import React from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown'
import { CLASS, STRINGS } from './constant';
import "./style.css";

interface LoginState {
    logginCompleted: true | false
};

interface LoginProps {
    onChange: () => void
}

const LoginWindow: React.FC<LoginProps> = (props: LoginProps) => {
    const onLogin = () => {
        props.onChange();
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

const MainWindow: React.FC = () => {
    console.log("Hello from main window");
    const onSave = () => {
        console.log("Clicked Save Button");
        const previewElements = document.querySelector(`div.${CLASS.PREVIEW}`);
        const title = previewElements?.textContent?.split("\n")[0] || STRINGS.UNTITLED;
        console.log(title);
    };
    const onList = () => {console.log("Clicked on List Button")};
    const [markdownText, setMarkdownText] = React.useState("");

    const onChangeText = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setMarkdownText(event.target.value);
    };

    return <div>
        <Title/>
        <button onClick={onSave}>{STRINGS.SAVE}</button>
        <button onClick={onList}>{STRINGS.LIST_NOTES}</button>
        <textarea id="main-text-entry" onChange={onChangeText}></textarea>
        <ReactMarkdown className={CLASS.PREVIEW}>{markdownText}</ReactMarkdown>
    </div>;
}

interface NoteListProp {
    title: string;
}

const NoteListElement: React.FC<NoteListProp> = (props: NoteListProp) => {
    return <div>
        <p>{props.title}</p>
        <button>{STRINGS.EDIT}</button>
        </div>
}

const App = () => {
    const [stateProps, setStateProps] = React.useState<LoginState>({
        logginCompleted: false
    });
    
    const onLogin = () => {
        setStateProps({
            logginCompleted: true
        })
        console.log("Logging in, ", stateProps.logginCompleted);
    } 
    console.log(stateProps.logginCompleted);
    return stateProps.logginCompleted === true ? <MainWindow/> : <LoginWindow onChange={onLogin}/>; 
}

ReactDOM.render(
    <React.StrictMode><App/></React.StrictMode>, document.getElementById("root")
);