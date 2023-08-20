import { useField } from 'formik'
import React from 'react'
import './FormikRadio.scss'

interface IFormikRadio {
    name: string
    value: string | boolean
    label: string
    className?: string
}

const FormikRadio: React.FC<IFormikRadio> = (props) => {
    const { className = '', value, label } = props
    const [field, meta, helpers] = useField({ name: props.name })
    const isError = meta.touched && meta.error && 'radio--error'

    return (
        <label className={`radio ${className} ${isError ? isError : ''}`}>
            <input
                className="radio__input"
                type="radio"
                checked={field.value === value}
                onChange={(e) => helpers.setValue(value)}
            />
            <span className="radio__box"></span>
            <span className="radio__label">{label}</span>
        </label>
    )
}

export default FormikRadio
