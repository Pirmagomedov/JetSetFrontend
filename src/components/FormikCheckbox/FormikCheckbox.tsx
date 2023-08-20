import { useField } from 'formik'
import React from 'react'
import Icon from 'src/components/Icon/Icon'
import './FormikCheckbox.scss'

interface IFormikCheckbox {
    name: string
    label?: string | JSX.Element
    handleChange?: (name: string, value: boolean) => void
    disabled?: boolean
}

const FormikCheckbox: React.FC<IFormikCheckbox> = React.memo((props) => {
    const { name, label, handleChange, disabled = false } = props
    const [field, meta, helpers] = useField(props)

    const handleSubmit = (event) => {
        helpers.setValue(event.target.checked)
        handleChange && handleChange(name, event.target.checked)
    }

    return (
        <>
            <label
                className={`checkbox ${disabled ? 'disabled' : 'enabled'} ${
                    field.value ? 'checked' : 'unchecked'
                }`}
            >
                {disabled ? (
                    <Icon name={field.value ? 'check' : 'i-reset-cross'} />
                ) : (
                    <>
                        <input
                            className="checkbox__input"
                            name={name}
                            type="checkbox"
                            checked={field.value}
                            onChange={handleSubmit}
                            defaultValue={field.value}
                        />
                        <span className="checkbox__box"></span>
                    </>
                )}

                <span className="checkbox__label">{label}</span>
            </label>
        </>
    )
})

export default FormikCheckbox
