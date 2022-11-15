import React from "react";
import { useContext } from "react";
import { STORAGE_KEY, STRINGS } from "./constant";
import { AppContext } from "./state";
import { Title } from "./title";
import { HashTable, Note } from "./types";

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