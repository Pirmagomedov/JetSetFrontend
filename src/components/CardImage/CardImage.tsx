import React, { useState, useEffect } from 'react'
import './CardImage.scss'

interface ICardImage {
    src: string
    src2?: string
    title: string
    ratio: number
    onClick?: (event: any) => void
    mockable?: boolean
}

const CardImage: React.FC<ICardImage> = (props) => {
    const {
        src,
        src2,
        title,
        onClick,
        ratio,
        mockable
    } = props

    const mock = '../../assets/images/small-logo-mock.svg'
    const source = () => {

        if (src === 'undefined' || src === 'null') {
            return mock
        }
        else if (!src) {
            return mock
        }
        else {
            return src
        }
    }
    const handleClick = (event) => {
        if (onClick) {
            onClick(event)
        }
    }

    useEffect(() => {
    }, [src])

    return (
        <div className="card-image" style={{ aspectRatio: `${ratio}` }}>
            <div className="card-image__ghost" style={{ backgroundImage: `URL(${src})` }}></div>
            <img
                src={mockable ? source() : src}
                title={title}
                alt={title}
                draggable="false"
                onClick={handleClick}
            />
        </div>
    )
}

export default CardImage
