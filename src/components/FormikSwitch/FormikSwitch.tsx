import { useField } from 'formik'
import React from 'react'
import './FormikSwitch.scss'
import Icon from '../Icon/Icon'
interface IFormikSwitch {
    name: string
    onChange?: () => void
    disabled?: boolean
    label?: string
    handleChange?: (name: string, value: boolean) => void
}

const FormikSwitch: React.FC<IFormikSwitch> = React.memo((props) => {
    const { onChange, disabled, label, handleChange, name } = props
    const [field, meta, helpers] = useField(props)

    const handleSubmit = (e) => {
        helpers.setValue(e.target.checked)
        handleChange && handleChange(name, e.target.checked)
        onChange && onChange()
    }

    return (
        <div className="switch__container">
            {label ? <span className="switch__label">{label}</span> : null}
            {disabled ? (
                <Icon name={field.value ? 'check' : 'i-reset-cross'} />
            ) : (
                <label className="switch">
                    <input
                        className="switch__input"
                        type="checkbox"
                        disabled={disabled}
                        checked={field.value}
                        onChange={handleSubmit}
                        defaultValue={field.value}
                    />
                    <span className="switch__slider"></span>
                </label>
            )}
        </div>
    )
})

export default FormikSwitch
