import React from "react";

export interface HashTable<T> {
    [key: string]: T;
}

export interface Note {
    id: string;
    title: string;
    body?: string;
}

export const defaultAppState: AppState = {
    loggingState: "notLogged",
    shouldListNotes: false,
    shouldEditNote: false,
    notes: {},
    shouldUpdateNode: false,
}

export type LoginState = "completed" | "signUp" | "confirmationCode" | "signIn" | "notLogged" | "forgotPassword";

export interface AppState {
    currUserEmail?: string;
    loggingState: LoginState;
    shouldListNotes: boolean;
    notes: HashTable<Note>;
    shouldEditNote: boolean;
    shouldUpdateNode: boolean;
    noteToBeEdited?: string;
};


export interface AppContextType {
    appState: typeof defaultAppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>
}


export const AppContext = React.createContext<Partial<AppContextType>>({});
