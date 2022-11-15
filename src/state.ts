import React from "react";
import { AppContextType, AppState } from "./types";

export const defaultAppState: AppState = {
    logginState: "notLogged",
    shouldListNotes: false,
    shouldEditNote: false,
    notes: {},
    shouldUpdateNode: false,
}

export const AppContext = React.createContext<Partial<AppContextType>>({});
