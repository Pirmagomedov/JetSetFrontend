import React, { ReactSVGElement } from 'react'
import Icons from 'images/icons-sprite.svg'
import './Icon.scss'

interface IIcon {
    name: string
    onClick?: (event) => void
    className?: string
    width?: number
    height?: number
    title?: string
}

const Icon: React.FC<IIcon> = (props) => {
    const {
        name,
        onClick,
        width = 16,
        height = 16,
        className = '',
        title,
    } = props

    return (
        <svg
            width={width}
            height={height}
            className={`icon icon-${name} ${className} ${onClick && "icon-clickable"}`}
            onClick={(event) => onClick && onClick(event)}
        >
            {title &&
                <title>{title}</title>
            }
            <use href={`${Icons}#${name}`} />
        </svg>
    )
}

export default Icon
