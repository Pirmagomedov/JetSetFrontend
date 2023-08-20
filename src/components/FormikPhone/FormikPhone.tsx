import { useField } from 'formik'
import React, { useEffect, useState } from 'react'
import ClickAwayListener from 'react-click-away-listener'
import {
    getCountries,
    getCountryCallingCode,
    parsePhoneNumber,
} from 'react-phone-number-input'
import Input from 'react-phone-number-input/input'
import en from 'react-phone-number-input/locale/en.json'
import Icon from '../Icon/Icon'
import './FormikPhone.scss'
import { CountryCode, CountryCallingCode } from './types'

interface IFormikPhone {
    name: string
    disabled?: boolean
    isShowOnlyValue?: boolean
}

const CountrySelect = ({
    value,
    onChange,
    onCountryAbbr,
    onCountryCode,
    labels,
}) => {
    const handleClick = (country: string, code) => {
        onCountryAbbr(country)
        onCountryCode(code)
        onChange()
    }

    return (
        <ul className="phone-input__list">
            <li data-value="">{labels['ZZ']}</li>
            {getCountries().map((country) => (
                <li
                    key={country}
                    data-value={country}
                    onClick={() =>
                        handleClick(country, getCountryCallingCode(country))
                    }
                >
                    <img
                        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country}.svg`}
                        alt={labels[country]}
                    />
                    <span>{labels[country]}</span>
                </li>
            ))}
        </ul>
    )
}

const FormikPhone: React.FC<IFormikPhone> = React.memo((props) => {
    const { disabled = false, isShowOnlyValue = false } = props
    const [countryAbbr, setCountryAbbr] = useState<CountryCode>('RU')
    const [countryCode, setCountryCode] = useState<string>(
        getCountryCallingCode(countryAbbr),
    )
    const [country, setCountry] = useState()
    const [isShowList, setShowList] = useState<boolean>(false)
    const [field, meta, helpers] = useField(props)
    const wrapperClass = disabled ? 'phone-input disabled' : 'phone-input'

    const setValues = (phoneNumber) => {
        if (phoneNumber) {
            const abr = parsePhoneNumber(phoneNumber)
            if (abr?.country) {
                setCountryAbbr(abr.country as CountryCode)
                setCountryCode(getCountryCallingCode(abr.country))
            }
        }
    }
    const handleChangeCountry = () => {
        setShowList(false)
        helpers.setValue('')
    }

    useEffect(() => {
        setValues(meta.initialValue)
    }, [meta.initialValue])

    return (
        <ClickAwayListener onClickAway={() => setShowList(false)}>
            {!isShowOnlyValue ? (
                <div className={wrapperClass}>
                    <div
                        className={`phone-input__box ${
                            isShowList ? 'phone-input__box--show' : ''
                        }`}
                    >
                        <div
                            className="phone-input__control"
                            onClick={
                                !disabled
                                    ? () => setShowList(!isShowList)
                                    : () => {}
                            }
                        >
                            <span className="phone-input__icon">
                                <img
                                    src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryAbbr}.svg`}
                                    alt={en[countryAbbr]}
                                />
                            </span>
                            <span className="phone-input__code">
                                +{countryCode}
                            </span>
                            <Icon
                                className="phone-input__arrow"
                                name="select-arrow"
                            />
                        </div>
                        <Input
                            international={true}
                            autoComplete="off"
                            className="phone-input__field"
                            country={countryAbbr}
                            onChange={(val) => helpers.setValue(val)}
                            value={field.value}
                            placeholder="(000) 000-00-00"
                            disabled={disabled}
                        />
                    </div>
                    {isShowList ? (
                        <CountrySelect
                            labels={en}
                            value={country}
                            onChange={handleChangeCountry}
                            onCountryAbbr={setCountryAbbr}
                            onCountryCode={setCountryCode}
                        />
                    ) : null}
                    {meta.touched && meta.error ? (
                        <div className="phone-input__error">{meta.error}</div>
                    ) : null}
                </div>
            ) : (
                <div>{field.value}</div>
            )}
        </ClickAwayListener>
    )
})

export default FormikPhone
