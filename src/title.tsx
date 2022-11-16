import React from "react"
import { CSS_CLASS, STRINGS } from "./constant"

export const Title: React.FC = () => {
    return <div className={CSS_CLASS.TITLE}>
        <h1>{STRINGS.APP_NAME}</h1>
    </div>
}

export const TitleWithIcon: React.FC = () => {
    return <div className={CSS_CLASS.TITLE}>
        <img src={"./icons8-notes-32.png"} />
        <h1>{STRINGS.APP_NAME}</h1>
    </div>
}
