import { useField } from 'formik'
import React, { useState, useRef, useEffect } from 'react'
import Icon from 'src/components/Icon/Icon'
import './FormikField.scss'
import { IHelp } from 'src/types'
import HelpIcon from '../Icon/views/HelpIcon/HelpIcon'

interface IFormikFieldProps {
    name: string
    value?: string
    placeholder?: string
    type?: string
    icon?: string
    className?: string
    label?: string
    isTextarea?: boolean
    readonly?: boolean
    disabled?: boolean
    isString?: boolean
    isEmail?: boolean
    required?: boolean
    isEdit?: boolean
    isShowOnlyValue?: boolean
    changeHandler?: (event) => void
    typeHandler?: (event) => void
    onTypeEnd?: () => void
    callback?: () => void
    help?: IHelp
}

const FormikField: React.FC<IFormikFieldProps> = React.memo(({ ...props }) => {
    const {
        name,
        value,
        type,
        icon,
        className = '',
        isShowOnlyValue = false,
        label,
        isTextarea,
        placeholder,
        readonly,
        disabled,
        changeHandler,
        typeHandler,
        onTypeEnd,
        required,
        isString = false,
        isEmail = false,
        isEdit = true,
        callback,
        help
    } = props

    const [isVisible, setIsVisible] = useState<boolean>(false)
    const [fieldType, setfieldType] = useState<string>(type ? type : 'text')
    const timerRef = useRef<any>()
    const [field, meta, helpers] = useField(props)

    const classNames: string[] = ['field', className]
    if (icon) classNames.push('field--with-icon')
    if (meta.error && meta.touched) classNames.push('field--error')
    if (required) classNames.push('required')

    const deleteSpacesRegex = /\s\s+/g

    const onChangeHandle = (event) => {
        if (isEdit) {
            if (isString) {
                helpers.setValue(
                    event.target.value.replace(deleteSpacesRegex, ' ').trim(),
                )
            } else if (isEmail) {
                helpers.setValue(event.target.value.toLowerCase())
            } else {
                helpers.setValue(event.target.value)
            }
            changeHandler && changeHandler(event)
        } else {
            return
        }
    }

    const handlePasswordShow = (): void => {
        setIsVisible((prevState) => {
            setfieldType(!prevState ? 'text' : 'password')
            return !prevState
        })
    }

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            event.target.blur()
            if (callback) callback()
        }
        if (typeHandler) {
            typeHandler(event)
        }
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
            console.log('type end!')
            if (onTypeEnd) {
                onTypeEnd()
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

    const handleClear = () => {
        helpers.setValue('')
    }


    return (
        <label
            className={classNames.join(' ')}
            data-name={name}
        >
            {label ?
                <div className="field__label-wrapper">
                    <span className="field__label">{label}</span>
                    <HelpIcon help={help} />
                </div>
                :
                null}
            <span className="field__input">
                {icon ? (
                    <img
                        src={`assets/images/${icon}`}
                        alt=""
                        className="field__icon"
                    />
                ) : null}
                {isTextarea ? (
                    <textarea
                        {...field}
                        name={name}
                        value={field.value}
                        placeholder={placeholder}
                        onBlur={onChangeHandle}
                        onChange={onChangeHandle}
                        readOnly={readonly}
                        disabled={disabled}
                        maxLength={6000}
                    />
                ) : !isShowOnlyValue ? (
                    <input
                        {...field}
                        placeholder={placeholder}
                        name={name}
                        value={field.value}
                        type={fieldType}
                        onBlur={onChangeHandle}
                        readOnly={readonly}
                        disabled={disabled}
                        onKeyUp={handleKeyUp}
                    />
                ) : (
                    <div>{field.value}</div>
                )}
                {type === 'password' ? (
                    <span
                        className="field__show-password"
                        onClick={() => handlePasswordShow()}
                    >
                        {isVisible ? (
                            <Icon name="i-eye-closed" />
                        ) : (
                            <Icon name="i-eye" />
                        )}
                    </span>
                ) : null}
            </span>
            {meta.touched && meta.error ? (
                <div className="field__error">{meta.error}</div>
            ) : null}
        </label>
    )
})

export default FormikField
