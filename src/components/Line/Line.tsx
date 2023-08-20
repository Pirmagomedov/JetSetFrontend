import React from 'react'
import './Line.scss'

interface ILine {
    isOpen: boolean
}

const Line: React.FC<ILine> = (props) => {
    const { isOpen } = props

    return (
        <div className={`line line__${isOpen ? 'flatten' : 'default'}`}></div>
    )
}

export default Line