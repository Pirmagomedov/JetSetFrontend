import React from 'react'
import { useField } from 'formik'
import ImageCrop from 'src/components/ImageCrop/ImageCrop'
import { fileToBase64 } from 'src/helper'

interface IFormikImageCrop {
    name: string
    maxImages?: number
    onChange: (images: any) => void
    ratio: number
    minWidth: number
    minHeight: number
    onCropStart?: () => void
    onCropFinish?: () => void
}

const FormikImageCrop: React.FC<IFormikImageCrop> = (props) => {
    const { name, onChange, maxImages, ratio, minWidth, minHeight, onCropFinish, onCropStart } = props
    const [field, meta, helpers] = useField(props)

    const handleChange = (images) => {
        //helpers.setValue(images)
        onChange(images)
    }

    return (
        <>
            <ImageCrop 
                ratio={ratio} 
                minWidth={minWidth} 
                minHeight={minHeight} 
                onChange={handleChange} 
                onCropStart={() => onCropStart && onCropStart()}
                onCropFinish={() => onCropFinish && onCropFinish()} 
                uploaded={field.value}
            /> 
        </>
        
    )
}

export default FormikImageCrop
