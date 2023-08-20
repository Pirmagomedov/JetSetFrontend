import React from 'react'
import './Label.scss'

interface ILabel {
    src: string
    alt?: string
}

const Label: React.FC<ILabel> = (props) => {
    const { src, alt } = props
    return (
        <div className="ad-label">
            <img
                src={src}
                alt=""
            />
        </div>
    )
}

export default Label
