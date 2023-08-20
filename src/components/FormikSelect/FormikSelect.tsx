import { useField } from 'formik'
import React from 'react'
import ReactSelect, {
    OptionTypeBase,
    components,
    IndicatorProps,
    OptionsType,
} from 'react-select'
import { Options } from 'src/types'
import './FormikSelect.scss'
import Icon from '../Icon/Icon'
import { useHistory } from 'react-router-dom'
import { IHelp } from 'src/types'
import HelpIcon from '../Icon/views/HelpIcon/HelpIcon'

interface IFormikSelectProps {
    options: Options
    name: string
    placeholder?: string
    className?: string
    label?: string
    changeHandler?: (value?: string, isClean?: boolean) => void
    isLoading?: boolean
    disabled?: boolean
    isShowOnlyValue?: boolean
    setDocType?: any
    required?: boolean
    clearable?: boolean
    help?: IHelp
}

const DropdownIndicator = (props: IndicatorProps<OptionsType<any>, false>) => {
    return (
        <components.DropdownIndicator {...props}>
            <div className="dropdown-indicator-arrow"></div>
        </components.DropdownIndicator>
    )
}
/*
const ClearIndicator = (props: IndicatorProps<OptionsType<any>, false>) => {
  return (
    <components.ClearIndicator {...props}>
      <div className="clear-indicator">Y</div>
    </components.ClearIndicator>
  )
}*/

const FormikSelect: React.FC<IFormikSelectProps> = (props) => {
    const {
        options,
        placeholder,
        className,
        isShowOnlyValue = false,
        label,
        changeHandler,
        isLoading,
        disabled,
        name,
        setDocType,
        required,
        clearable = true,
        help
    } = props
    const [field, meta, helpers] = useField(props)
    const router = useHistory()

    const isEmptyValue = field.value === ''
    const classNames: string[] = ['select select-white', className]
    if (field?.value?.length > 0 || !isEmptyValue) classNames.push('has-value')
    if (meta.error && meta.touched) classNames.push('select--error')
    if (required) classNames.push('required')

    const onChangeHandle = (value: OptionTypeBase) => {
        if (setDocType) {
            setDocType(value.label)
        }
        helpers.setValue(value.value)
        changeHandler && changeHandler(value.value)
    }

    /*
const filterOption = (option, inputValue) => {
    const { label, value } = option;
    const otherKey = options.filter(
      opt => opt.label === label && opt.value.includes(inputValue)
    );
    return value.includes(inputValue) || otherKey.length > 0;
  };
  */

    const getLabel = (): string => {
        const currentOption = options?.find(
            (option) => option.value == field.value,
        )
        return currentOption ? currentOption.label : placeholder
    }

    const handleHelp = () => {
        window.open(help.link)
    }

    return (
        <div
            className={classNames.join(' ')}
            data-name={name}
        >
            {label ?
                <div className="select__label-wrapper">
                    <div className="select__label">{label}</div>
                    <HelpIcon help={help} />
                </div>
                : null
            }
            {!isShowOnlyValue ? (
                <ReactSelect
                    options={options}
                    onChange={onChangeHandle}
                    placeholder={isEmptyValue ? placeholder : field.value}
                    isSearchable={true}
                    //isClearable={clearable}
                    components={{ DropdownIndicator }}
                    classNamePrefix="select select-white"
                    defaultValue={placeholder ? null : options?.[0]}
                    value={{ label: getLabel(), value: field.value }}
                    isLoading={isLoading}
                    isDisabled={isLoading || disabled}
                />
            ) : (
                <div>{getLabel()}</div>
            )}
            {meta.touched && meta.error ? (
                <div className="field__error">{meta.error}</div>
            ) : null}
        </div>
    )
}

export default FormikSelect
