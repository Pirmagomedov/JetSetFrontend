import React from 'react'
import './ErrorMsg.scss'

interface iErrorMsgProps {
    text: string
    className?: string
}

const ErrorMsg: React.FC<iErrorMsgProps> = React.memo(({ text, className }) => {
    return text ? (
        <div className={`text-error ${className ? className : ''}`}>{text}</div>
    ) : null
})

export default ErrorMsg
