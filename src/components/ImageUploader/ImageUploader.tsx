import React, { useState } from 'react'
import { fileAccept } from 'src/helper'
import './ImageUploader.scss'

interface IImageUploader {
    name: string
    label?: string | JSX.Element
    icon?: string
    onChange?: (filename: string, data: any) => void
}

const ImageUploader: React.FC<IImageUploader> = (props) => {
    const { name, label, icon, onChange } = props
    const [image, setImage] = useState(icon ? icon : null)

    const handleUpload = (event) => {
        if (event.target.files && event.target.files[0]) {
            const img = URL.createObjectURL(event.target.files[0])
            if (onChange)
                onChange(event.target.files[0].name, event.target.files[0])
            setImage(img)
        }
    }

    return (
        <div className={`imageUploader ${image ? 'full' : 'empty'}`}>
            <input
                type="file"
                accept={fileAccept(true, false)}
                id={name}
                name={name}
                onChange={handleUpload}
            />
            <label htmlFor={name}>{image && <img src={image} />}</label>
        </div>
    )
}

export default ImageUploader