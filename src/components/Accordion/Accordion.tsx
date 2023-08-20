import React, { useState } from 'react'
import Line from '../Line/Line'
import './Accordion.scss'

interface IAccordion {
    className?: string
    initialState?: boolean
    children?: React.ReactNode
    underline?: boolean
}

const Accordion: React.FC<IAccordion> = React.memo((props) => {
    const { children, className, initialState, underline } = props
    const [isOpen, setIsOpen] = useState<boolean>(initialState || false)

    const handleClick = () => {
        setIsOpen((prev) => !prev)
    }

    return (
        <div
            className={
                `
                accordion
                ${className ? className : ''}
                ${isOpen ? 'accordion--open' : ''}
                ${!underline ? 'accordion--characteristics' : ''}
                `}
        >
            <div
                onClick={handleClick}
                className={underline ? 'bb' : ''}
            >
                {children[0]}
                {underline &&
                    <Line isOpen={isOpen} />
                }
            </div>
            <div
                className={`accordion__body__wrapper ${isOpen ? 'accordion__body__wrapper-open' : ''}`}
            >
                {children[1]}
            </div>
        </div >
    )
},
)

export default Accordion
