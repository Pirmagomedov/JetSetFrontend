import { useField } from 'formik'
import React, { useEffect, useState } from 'react'
import { FileType } from 'src/types'
import Upload from '../Upload/Upload'
import './FormikFile.scss'

interface IFormikFileProps {
    name: string
    text?: string
    label?: string
    multiple?: boolean
    changeHandler?: (event: any) => void
    className?: string
    disabled?: boolean
}

const FormikFile: React.FC<IFormikFileProps> = (props) => {
    const {
        text,
        label,
        multiple,
        className = '',
        name,
        disabled,
        changeHandler,
    } = props
    const [field, meta, helpers] = useField(props)
    const [value, setValue] = useState<FileType[]>(field.value)

    useEffect(() => {
        helpers.setValue(value)
    }, [value])

    return (
        <div
            className={`field field--file ${className} ${
                disabled ? 'disabled' : ''
            }`}
            data-name={name}
        >
            {label ? <div className="field__label">{label}</div> : null}
            <Upload
                name={field.name}
                text={text}
                isOneFile={!multiple}
                disabled={disabled}
                onChange={changeHandler}
            />
            {/* {meta.touched && meta.error ? <div className="field__error">{meta.error}</div> : null} */}
        </div>
    )
}

export default FormikFile
