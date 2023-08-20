import { useField } from 'formik'
import React from 'react'
import { 
    fileAccept,
    fileToBase64
} from 'src/helper'

interface IFormikGalleryProps {
    name: string
    index?: number
    maxLength?: number
    changeHandler?: () => void
    multiple?: boolean
}

const FormikGallery: React.FC<IFormikGalleryProps> = (props) => {
    const { multiple, index, maxLength } = props
    const [field, meta, helpers] = useField(props)

    const handleChange = async (event) => {
        if (index !== null) {
            let newValue = field.value
            await Promise.all(
                Array.from(event.currentTarget.files).map(
                    (file: File, fileIndex: number) => {
                        if (fileIndex + index < maxLength) {
                            return fileToBase64(
                                event.currentTarget.files[fileIndex],
                            )
                                .then((res) => {
                                    newValue[index + fileIndex] = {
                                        file: res,
                                        filename: file.name,
                                    }
                                    helpers.setValue(newValue)
                                })
                                .catch((err) => console.error(err))
                        }
                    },
                ),
            )
        } else {
            helpers.setValue(event.currentTarget.files[0])
        }

        props.changeHandler && props.changeHandler()
    }

    return (
        <label
            className="btn btn-blue btn-small"
            onDrop={(e: React.DragEvent<HTMLLabelElement>) => {
                e.preventDefault()
                e.stopPropagation()
                handleChange(e)
            }}
            onDragOver={(e: React.DragEvent<HTMLLabelElement>) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            onDragLeave={(e: React.DragEvent<HTMLLabelElement>) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            htmlFor="uploadIMG"
        >
            <input
                id="uploadIMG"
                name={props.name}
                type="file"
                onChange={handleChange}
                multiple={multiple}
                accept={fileAccept(true, false)}
            />
            <span>Choose photos</span>
        </label>
    )
}

export default FormikGallery
