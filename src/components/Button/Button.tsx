import React, { ReactNode, useRef } from 'react'
import './Button.scss'

export type ButtonType =
    | 'blue'
    | 'red'
    | 'red-outline'
    | 'blue-outline'
    | 'white'
    | 'secondary'
    | 'link'
    | 'icon'
    | 'transparent'
    | 'red-border'

interface IButton {
    btnType?: 'button' | 'submit' | 'reset'
    className?: string
    disabled?: boolean
    isLoading?: boolean
    onClick?: (event) => void
    type?: ButtonType
    size?: 'small' | 'verySmall' | 'smallLarge'
    children?: ReactNode
}

const Button: React.FC<IButton> = (props) => {
    const {
        btnType = 'button',
        children,
        className,
        disabled,
        isLoading,
        onClick,
        type = 'blue',
        size,
    } = props
    const ref = useRef(null)

    // Функция создает эффект капли при нажатии
    const handleClick = (event) => {
        const circle = document.createElement('span')
        const diameter = Math.max(
            ref.current.clientWidth,
            ref.current.clientHeight,
        )
        const radius = diameter / 2
        circle.style.width = circle.style.height = `${diameter}px`
        circle.style.left = `${
            event.clientX - (ref.current.offsetLeft + radius)
        }px`
        circle.style.top = `${
            event.clientY - (ref.current.offsetTop + radius)
        }px`
        circle.classList.add('ripple')
        const ripple = ref.current.getElementsByClassName('ripple')[0]

        if (ripple) {
            ripple.remove()
        }
        ref.current.appendChild(circle)
        if (onClick && !isLoading) onClick(event)
    }

    return (
        <button
            ref={ref}
            className={`btn
            ${size ? `btn-${size}` : ''}
            ${type ? `btn-${type}` : ''}
            ${className || ''}
            `}
            disabled={isLoading || disabled}
            onClick={(event) => handleClick(event)}
            type={btnType}
        >
            {isLoading ? (
                <img src={require('assets/images/loader.svg')} />
            ) : (
                children
            )}
        </button>
    )
}

export default Button
