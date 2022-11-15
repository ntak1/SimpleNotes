import { defaultAppState } from "./state";

export interface HashTable<T> {
    [key: string]: T;
}


export type LoginState = "completed" | "ongoing" | "notLogged";


export interface AppState {
    logginState: LoginState;
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


export interface Note {
    id: string;
    title: string;
    body?: string;
}
