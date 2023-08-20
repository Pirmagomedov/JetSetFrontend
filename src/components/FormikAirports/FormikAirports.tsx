import React, { useState, useEffect } from 'react'
import { AirportType } from 'src/generated/graphql'
import { useField } from 'formik'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import { unique } from 'src/helper'
import Icon from 'src/components/Icon/Icon'
import './FormikAirports.scss'

interface IFormikSelectFilteredProps {
    name: string
    placeholder?: string
    className?: string
    label?: string
    changeHandler?: (value?: string | number, isClean?: boolean) => void
    isLoading?: boolean
    disabled?: boolean
    required?: boolean
    linkToHelp?: string
    title?: string
}

interface IAirportFilter {
    region?: string
    country?: string
    name?: string
    value?: number
    label?: string
}

export const renderAirport = (a: AirportType | IAirportFilter) => {
    if (a) {
        const row = []
        if (a.label) row.push(a.label)
        //if (a.country) row.push(a.country)
        //if (a.region) row.push(a.region)
        if (a.name) row.push(a.name)
        return row.join(', ')
    }
    return '-'
}

export const getAirportNameById = (id: number): string => {
    const { choices } = useSelector((state: RootState) => state.choices)
    if (choices?.airports?.length) {
        const airportFound = choices.airports.filter((a) => a.value == id)
        if (airportFound?.length == 1) {
            return renderAirport(airportFound[0])
        }
    }
    if (id) {
        return `${id}`
    }
    return ''
}

const FormikAirports: React.FC<IFormikSelectFilteredProps> = (props) => {
    const {
        placeholder,
        className,
        label,
        changeHandler,
        isLoading,
        disabled,
        name,
        required,
        linkToHelp,
        title
    } = props
    const { choices } = useSelector((state: RootState) => state.choices)
    const { airports } = choices
    const [field, meta, helpers] = useField(props)
    const [airportId, setAirportId] = useState<any>(field.value)
    const [airportSelected, setAirportSelected] = useState<AirportType | null>(
        null,
    )
    const [regions, setRegions] = useState<string[]>([])
    const [region, setRegion] = useState('')
    const [airportName, setAirportName] = useState('')
    const [airport, setAirport] = useState('')
    const [found, setFound] = useState<IAirportFilter[]>([])
    const [error, setError] = useState<boolean>(false)
    const [input, setInput] = useState<string>('')

    const isEmptyValue = field.value === null || field.value === ''

    const handleChange = (e) => {
        const value = e?.target?.value
        if (value !== undefined && airports?.length) {
            if (value?.length && value.length > 2) {
                const strings = value.replace(/[,.\s]{1,}/g, ' ').split(' ')
                const foundLines: IAirportFilter[] = []
                let airportList = [...airports]
                let regionsFound = [...regions]
                strings.forEach((s) => {
                    if (s.length > 2) {
                        regionsFound = regionsFound.filter(
                            (r) =>
                                r.toLowerCase().indexOf(s.toLowerCase()) >= 0,
                        )

                        airportList = airportList.filter(
                            (a) =>
                                a.country
                                    .toLowerCase()
                                    .indexOf(s.toLowerCase()) >= 0 ||
                                a.label
                                    .toLowerCase()
                                    .indexOf(s.toLowerCase()) >= 0 ||
                                a.name.toLowerCase().indexOf(s.toLowerCase()) >=
                                0 ||
                                a.region
                                    .toLowerCase()
                                    .indexOf(s.toLowerCase()) >= 0,
                        )
                    }
                })
                regionsFound.forEach((r) =>
                    foundLines.push({
                        region: r,
                    }),
                )
                airportList.forEach((a) =>
                    foundLines.push({
                        region: a.region,
                        name: a.name,
                        country: a.country,
                        value: a.value,
                        label: a.label,
                    }),
                )
                if (!foundLines.length) setError(true)
                setFound(foundLines)
                //const countryFound = countries.filter(c => c.toLowerCase().match(strings))
            } else {
                setError(false)
                setFound([])
            }
            setInput(value)
        }
    }

    const setAirportById = () => {
        if (airports?.length) {
            const airportFound = airports.filter(
                (a) => a.value == airportId || a.value == field.value,
            )
            if (airportFound?.length == 1) {
                setAirportSelected(airportFound[0])
                setAirportId(airportFound[0].value)
                if (changeHandler) changeHandler(airportFound[0].value)
            }
        } else {
            setAirportSelected(null)
            if (changeHandler) changeHandler(null)
        }
    }

    useEffect(() => {
        const regionsList = []
        if (airports?.length) {
            airports.forEach((a) => {
                regionsList.push(a.region)
            })
            setRegions(unique(regionsList))
            setAirportById()
        }
    }, [airports, field.value])

    useEffect(() => {
        setAirportById()
    }, [airportId])

    const handleRegionChange = (region: string) => {
        setInput(region + ' ')
    }

    const handleSelectAirport = (airport: IAirportFilter) => {
        setAirportId(airport.value)
        helpers.setValue(airport.value)
    }

    const handleClearAirport = () => {
        setAirportId(null)
        helpers.setValue(null)
        setAirportSelected(null)
        if (changeHandler) changeHandler(null)
        setInput('')
        setFound([])
        setError(false)
    }

    const isError = (meta.touched && meta.error) || error

    const extraClass: string[] = airportId
        ? ['selected']
        : found?.length > 0
            ? ['open']
            : ['empty']
    if (isError) extraClass.push('error')
    if (required) extraClass.push('required')

    const handleHelp = () => {
        window.open(linkToHelp)
    }

    return (
        <div
            className={`airports-select ${extraClass.join(' ')}`}
            data-name={name}
        >
            {label ? (
                <div className="airports-select__label-wrapper">
                    <div className="airports-select__label">{label}</div>
                    {/* <Icon
                        name="i-question"
                        title={title}
                        onClick={handleHelp}
                    /> */}
                </div>
            ) : null}
            <input
                name={name}
                value={field.value}
                type="hidden"
            />
            {airportId ? (
                <div
                    className="airports-select__selected"
                    title={renderAirport(airportSelected)}
                >
                    <span className="airports-select__selected-label">
                        {renderAirport(airportSelected)}
                    </span>
                    <span className="airports-select__selected-remove">
                        <Icon
                            name="i-remove"
                            onClick={handleClearAirport}
                        />
                    </span>
                </div>
            ) : (
                <input
                    name={name + '__input'}
                    className="airports-select__input"
                    type="text"
                    onChange={handleChange}
                    onKeyUp={handleChange}
                    value={input}
                    placeholder="Type region or airport code"
                />
            )}
            {!airportId && found?.length > 0 && (
                <div className="airports-select__options">
                    {found.map((f, i) => {
                        /*if (f.region && !f.name) {
              return <div className="airports-select__option airports-select__region" key={f.region} onClick={() => handleRegionChange(f.region)}>{f.region}</div>
            }*/
                        if (f.value) {
                            return (
                                <div
                                    className="airports-select__option"
                                    key={f.value}
                                    onClick={() => handleSelectAirport(f)}
                                >
                                    {renderAirport(f)}
                                </div>
                            )
                        }

                        return null
                    })}
                </div>
            )}
            {isError ? <div className="select__error">{meta.error}</div> : null}
        </div>
    )
}

export default FormikAirports
