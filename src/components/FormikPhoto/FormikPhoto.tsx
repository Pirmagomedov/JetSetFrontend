import React, { useEffect } from 'react'
import { useField } from 'formik'
import { 
    fileAccept,
    fileToBase64
} from 'src/helper'
import Icon from 'src/components/Icon/Icon'
import './FormikPhoto.scss'

interface IUpload {
    name: string
    text?: string
    className?: string
    theme?: string
    isOneFile?: boolean
    disabled?: boolean
    onChange?: (event: any) => void
    link?: string
}

const MAX_MEMORY_SIZE = 2500000

const FormikPhoto: React.FC<IUpload> = React.memo((props) => {
    const {
        text,
        className,
        link,
        theme,
        isOneFile,
        name,
        disabled = false,
        onChange,
    } = props
    const [field, meta, helpers] = useField(props)
    const files = field.value || []

    const buttonName = text ? text : 'Load document'
    const themeName = theme ? theme : ''
    const isOne = isOneFile && files?.length === 1
    const isPhotoLoaded = link ? true : false

    const removeDocument = (id: number) => {
        helpers.setValue(files.filter((el, index) => index !== id))
    }

    const addDocument = (file: File) => {
        fileToBase64(file).then((res) => {
            helpers.setValue([
                ...files,
                {
                    file: res,
                    filename: file.name,
                },
            ])
        })
    }

    return (
        <div
            className={`photo ${themeName}`}
            data-name={name}
        >
            <label
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <input
                    type="file"
                     accept={fileAccept(true, false)}
                    className="photo__load-input"
                    onChange={(event) => addDocument(event.target.files[0])}
                    disabled={disabled}
                />
                {link && !files?.length ? (
                    <img src={link} />
                ) : files?.length ? (
                    <img src={field.value[0].file} />
                ) : (
                    <div>
                        <Icon
                            height={61}
                            width={61}
                            name="plus"
                        />
                    </div>
                )}
            </label>
            {meta.touched && meta.error ? (
                <div className="field__error">{meta.error}</div>
            ) : null}
        </div>
    )
})

export default FormikPhoto
