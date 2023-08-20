import { useField } from 'formik'
import React, { useState, useRef, useEffect } from 'react'
import Icon from 'src/components/Icon/Icon'
// Все значения просто скопированы из FormikField
import './FormikPrice.scss'
import { formatPriceNullable } from 'src/helper'
import { useHistory } from 'react-router-dom'
import { IHelp } from 'src/types'
import HelpIcon from '../Icon/views/HelpIcon/HelpIcon'



const clearValue = (value: string, min: number, max: number, float: boolean = true) => {
    if (value === null || value === '') {
        return null
    }
    let cleared = Number.parseFloat(value ? value.toString().replace(/[^\d\.]/g, '') : '0')
    if (isNaN(cleared)) return null
    if (max != undefined && cleared > max) {
        cleared = max
    }
    if (min != undefined && cleared < min) {
        cleared = min
    }
    if (float) {
        return cleared.toFixed(2).toString()
    } else {
        return cleared.toString()
    }
}


interface IFormikPriceProps {
    name: string
    value?: string
    placeholder?: string
    icon?: string
    className?: string
    label?: string
    readonly?: boolean
    // disabled?: boolean
    required?: boolean
    changeHandler?: (event: any) => void
    typeHandler?: (event: any) => void
    onTypeEnd?: (event: any) => void
    max?: number
    min?: number
    float?: boolean
    help?: IHelp
}

const FormikPrice: React.FC<IFormikPriceProps> = ({ ...props }) => {
    const {
        name,
        icon,
        className = '',
        label,
        placeholder,
        changeHandler,
        typeHandler,
        onTypeEnd,
        required,
        readonly,
        min,
        float = false,
        max = 1000000000,
        help
    } = props

    const timerRef = useRef<any>()
    const inputRef = useRef<any>()
    const [field, meta, helpers] = useField(props)
    const [formatValue, setFormatValue] = useState<string>(formatPriceNullable(clearValue(field.value, min, max, float), 2, true))
    const router = useHistory()


    const classNames: string[] = ['field', className]
    if (icon) classNames.push('field--with-icon')
    if (meta.error && meta.touched) classNames.push('field--error')
    if (required) classNames.push('required')

    const onChangeHandle = (event) => {
        const value = event.target.value
        const newFormatValue = formatPriceNullable(clearValue(value, min, max, float), 2, true)
        setFormatValue(newFormatValue)
        if (formatValue === newFormatValue || newFormatValue === null) {
            //there will be no update, if values are equal, so update value directly
            inputRef.current.value = newFormatValue
        }
    }

    const handleBlur = (event) => {
        if (changeHandler) {
            const updatedEvent = event
            updatedEvent.target.value = clearValue(event.target.value, min, max, float)
            changeHandler(event)
        }
    }

    useEffect(() => {
        const newValue = clearValue(formatValue, min, max, float)
        if (newValue !== field.value) {
            helpers.setValue(newValue)
        }
    }, [formatValue])

    useEffect(() => {
        setFormatValue(formatPriceNullable(clearValue(field.value, min, max, float)))
    }, [field.value])


    const handleKeyUp = (event) => {
        if (typeHandler) {
            typeHandler({ target: { value: clearValue(event.target.value, min, max, float) } })
        }
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
            if (onTypeEnd) {
                onTypeEnd({ target: { value: clearValue(event.target.value, min, max, float) } })
            }
        }, 500)
    }

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [])


    const handleHelp = () => {
        window.open(help.link)
    }

    return (
        <label
            className={classNames.join(' ')}
            data-name={name}
        >
            {label ?
                <div className="field__label-wrapper">
                    <div className="field__label">{label}</div>
                    <HelpIcon help={help} />
                </div>
                : null}
            <span className="field__input">
                {icon ? (
                    <img
                        src={`assets/images/${icon}`}
                        alt=""
                        className="field__icon"
                    />
                ) : null}
                <>
                    <input
                        ref={inputRef}
                        placeholder={placeholder}
                        name={`visible_${name}`}
                        value={formatValue}
                        type="text"
                        onChange={onChangeHandle}
                        onBlur={handleBlur}
                        onKeyUp={handleKeyUp}
                        readOnly={readonly}
                    />
                </>
            </span>
            {meta.touched && meta.error ? (
                <div className="field__error">{meta.error}</div>
            ) : null}
        </label>
    )
}

export default FormikPrice
