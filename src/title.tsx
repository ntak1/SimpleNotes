import React from "react"
import { CLASS, STRINGS } from "./constant"

export const Title: React.FC = () => {
    return <div className={CLASS.TITLE}>
        <h1>{STRINGS.APP_NAME}</h1>
    </div>
}

export const TitleWithIcon: React.FC = () => {
    return <div className={CLASS.TITLE}>
        <img src={"./icons8-notes-32.png"} />
        <h1>{STRINGS.APP_NAME}</h1>
    </div>
}