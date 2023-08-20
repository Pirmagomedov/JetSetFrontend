import './FormikCalendar.scss'
import ClickAwayListener from 'react-click-away-listener'
import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useField } from 'formik'
import _ from 'lodash'
import Icon from 'src/components/Icon/Icon'
import { format, getMonth, getYear } from 'date-fns'
import { date } from 'yup'

interface ICalendar {
    name: string
    label?: string
    changeHandler?: (date: Date) => void
    defaultDate?: any
    disabled?: boolean
    minDate?: Date
    maxDate?: Date
    isShowOnlyValue?: boolean
    required?: boolean
}

const FormikCalendar: React.FC<ICalendar> = React.memo((props) => {
    const {
        label,
        isShowOnlyValue = false,
        changeHandler,
        defaultDate,
        disabled = false,
        minDate,
        maxDate,
        required = false,
    } = props
    const [isShow, setShow] = useState<boolean>(false)
    const [field, meta, helpers] = useField(props)
    const dateValue =
        typeof field.value == 'string' ? new Date(field.value) : field.value
    const defaultInputDate = defaultDate ? defaultDate : dateValue

    const handleChange = (date) => {
        helpers.setValue(date)
        setShow(false)
        changeHandler && changeHandler(date)
    }

    const years = _.range(
        getYear(minDate) || 1900,
        (getYear(maxDate) || getYear(new Date())) + 1,
        1,
    )

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ]

    return (
        <ClickAwayListener onClickAway={() => setShow(false)}>
            <div className={!required ? 'calendar' : 'calendar required'}>
                {label ? <div className="calendar__label">{label}</div> : null}
                {!isShowOnlyValue ? (
                    <div className="calendar__input">
                        <DatePicker
                            renderCustomHeader={({
                                date,
                                changeYear,
                                changeMonth,
                                decreaseMonth,
                                increaseMonth,
                                prevMonthButtonDisabled,
                                nextMonthButtonDisabled,
                            }) => (
                                <div
                                    style={{
                                        margin: 10,
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            decreaseMonth()
                                        }}
                                        disabled={prevMonthButtonDisabled}
                                    >
                                        {'<'}
                                    </button>
                                    <select
                                        value={getYear(date)}
                                        onChange={({ target: { value } }) =>
                                            changeYear(+value)
                                        }
                                    >
                                        {years.map((option) => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={months[getMonth(date)]}
                                        onChange={({ target: { value } }) =>
                                            changeMonth(months.indexOf(value))
                                        }
                                    >
                                        {months.map((option) => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            increaseMonth()
                                        }}
                                        disabled={nextMonthButtonDisabled}
                                    >
                                        {'>'}
                                    </button>
                                </div>
                            )}
                            selected={defaultInputDate}
                            disabled={disabled}
                            minDate={minDate}
                            maxDate={maxDate}
                            dateFormat={'yyyy/MM/dd'}
                            onChange={(date) => handleChange(date)}
                        />
                        <Icon name="i-cal" />
                    </div>
                ) : (
                    <div>
                        {field?.value
                            ? new Date(field.value).toLocaleDateString(
                                  'en-GB',
                                  {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                  },
                              )
                            : ''}
                    </div>
                )}
                {meta.touched && meta.error ? (
                    <div className="calendar__error">{meta.error}</div>
                ) : null}
            </div>
        </ClickAwayListener>
    )
})

export default FormikCalendar
