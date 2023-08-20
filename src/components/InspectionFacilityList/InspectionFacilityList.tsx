import React, { useEffect, useState } from 'react'
import { AircraftFacilityType } from 'src/generated/graphql'
import { Form, Formik, FormikProps } from 'formik'
import { OptionsType } from 'react-select'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import Button from 'src/components/Button/Button'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import './InspectionFacilityList.scss'

interface IInspectionFacilityList {
    onSelect?: (text) => void
}

interface filterParams {
    manufacturer?: String
    region?: string
    country?: string
}

interface Option {
    label: string
    value: string
}

const emptyValue = ''

const defaulfFilters = {
    manufacturer: emptyValue,
    region: emptyValue,
    country: emptyValue,
}

const InspectionFacilityList: React.FC<IInspectionFacilityList> = (props) => {
    const { onSelect } = props
    const { choices } = useSelector((state: RootState) => state.choices)
    const allFacilities = choices?.aircraftFacility
    const [facilities, setFacilities] = useState<Array<AircraftFacilityType>>()
    const [manufacturers, setManufacturers] = useState<Array<Option>>()
    const [regions, setRegions] = useState<Array<Option>>()
    const [countries, setCountries] = useState<Array<Option>>()
    const [filters, setFilters] = useState<filterParams>(defaulfFilters)
    const [selected, setSelected] = useState<AircraftFacilityType | null>(null)

    const setSelectedValue = (value) => {
        if (onSelect) {
            if (value) {
                onSelect(`${value.planeMro} ${value.address}`)
            } else {
                onSelect(null)
            }
        }
        setSelected(value)
    }

    const applyFilter = (filters) => {
        const manufacturerFiltered = allFacilities.filter((el) =>
            filters.manufacturer
                ? el.manufacturer === filters.manufacturer
                : true,
        )
        setRegions([
            { value: emptyValue, label: 'All' },
            ...manufacturerFiltered
                .map((item) => item.region)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((value) => {
                    return { value: value, label: value }
                }),
        ])
        const regionFiltered = manufacturerFiltered.filter((el) =>
            filters.region ? el.region === filters.region : true,
        )
        setCountries([
            { value: emptyValue, label: 'All' },
            ...regionFiltered
                .map((item) => item.country)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((value) => {
                    return { value: value, label: value }
                }),
        ])
        setFacilities(
            regionFiltered.filter((el) =>
                filters.country ? el.country === filters.country : true,
            ),
        )
    }

    useEffect(() => {
        if (allFacilities) {
            applyFilter(filters)
        }
    }, [filters])

    useEffect(() => {
        if (allFacilities) {
            setFacilities(allFacilities)
            setManufacturers([
                { value: '', label: 'All' },
                ...allFacilities
                    .map((item) => item.manufacturer)
                    .filter(
                        (value, index, self) => self.indexOf(value) === index,
                    )
                    .map((value) => {
                        return { value: value, label: value }
                    }),
            ])
            setRegions([
                { value: '', label: 'All' },
                ...allFacilities
                    .map((item) => item.region)
                    .filter(
                        (value, index, self) => self.indexOf(value) === index,
                    )
                    .map((value) => {
                        return { value: value, label: value }
                    }),
            ])
            setCountries([
                { value: '', label: 'All' },
                ...allFacilities
                    .map((item) => item.country)
                    .filter(
                        (value, index, self) => self.indexOf(value) === index,
                    )
                    .map((value) => {
                        return { value: value, label: value }
                    }),
            ])
        }
    }, [allFacilities])

    const formSubmit = (v) => { }

    const handleManufacturerChange = (v) => {
        setFilters({ ...filters, manufacturer: v, region: '', country: '' })
        setSelectedValue(null)
    }
    const handleRegionChange = (v) => {
        setFilters({ ...filters, region: v, country: '' })
        setSelectedValue(null)
    }
    const handleCountryChange = (v) => {
        setFilters({ ...filters, country: v })
        setSelectedValue(null)
    }
    const resetFilters = () => {
        setFilters(defaulfFilters)
        setSelectedValue(null)
    }

    if (!allFacilities) return null

    return (
        <Formik
            initialValues={{ ...filters }}
            onSubmit={formSubmit}
            enableReinitialize
        >
            <div className="facilities">
                <div className="facilities__filters sticky-facilities">
                    <div className="ficilities__filter">
                        <div className="facilities__label">
                            Select Manufacturer
                        </div>
                        <FormikSelect
                            name="manufacturer"
                            options={manufacturers}
                            className="facilities__select select"
                            changeHandler={handleManufacturerChange}
                        />
                    </div>
                    <div className="ficilities__filter">
                        <div className="facilities__label">Select Region</div>
                        <FormikSelect
                            name="region"
                            options={regions}
                            className="facilities__select select"
                            changeHandler={handleRegionChange}
                        //disabled={filters.manufacturer == emptyValue}
                        />
                    </div>
                    <div className="ficilities__filter">
                        <div className="facilities__label">Select Country</div>
                        <FormikSelect
                            name="country"
                            options={countries}
                            className="facilities__select select"
                            changeHandler={handleCountryChange}
                        //disabled={filters.region == emptyValue}
                        />
                    </div>
                    <div className="ficilities__filter">
                        {filters !== defaulfFilters && (
                            <Button onClick={resetFilters}>Reset</Button>
                        )}
                    </div>
                </div>
                <div>
                    <table
                        cellPadding={0}
                        cellSpacing={0}
                        aria-label="simple table"
                    >
                        <thead>
                            <tr
                                className='tr-head'
                            >
                                <th scope="col">MRO</th>
                                <th scope="col">City/State</th>
                                <th scope="col">Address</th>
                                <th scope="col">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facilities &&
                                facilities.map((row, i) => {
                                    const rowClass =
                                        row === selected
                                            ? 'selected'
                                            : 'available'
                                    return (
                                        <tr
                                            key={i}
                                            className={rowClass}
                                            onClick={() => {
                                                setSelectedValue(row)
                                            }}
                                        >
                                            <td data-label="MRO">
                                                {row.planeMro}
                                            </td>
                                            <td data-label="City/State">
                                                {row.state
                                                    ? row.city + ',' + row.state
                                                    : row.city}
                                            </td>
                                            <td data-label="Address">
                                                {row.address}
                                            </td>
                                            <td data-label="Phone">
                                                {row.contacts}
                                            </td>
                                            <td align="center">
                                                <a
                                                    href={
                                                        row.website.match(
                                                            'http',
                                                        )
                                                            ? row.website
                                                            : `https://${row.website}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Website
                                                </a>
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </table>
                    {/* <div className='table'>
                        <div className='table__heading'>
                            <div>MRO</div>
                            <div>City/State</div>
                            <div>Address</div>
                            <div>Phone</div>
                        </div>
                        <div className='table__content'>
                            {facilities &&
                                facilities.map((row, i) => {
                                    const rowClass =
                                        row === selected
                                            ? 'selected'
                                            : 'available'
                                    return (
                                        <div
                                            key={i}
                                            className={`table__content__row ${rowClass}`}
                                            onClick={() => {
                                                setSelectedValue(row)
                                            }}
                                        >
                                            <div>
                                                {row.planeMro}
                                            </div>
                                            <div>
                                                {row.state
                                                    ? row.city + ',' + row.state
                                                    : row.city}
                                            </div>
                                            <div>
                                                {row.address}
                                            </div>
                                            <div className='table__content__contacts'>
                                                {row.contacts}
                                            </div>
                                            <div>
                                                <a
                                                    href={
                                                        row.website.match(
                                                            'http',
                                                        )
                                                            ? row.website
                                                            : `https://${row.website}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Website
                                                </a>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div> */}
                </div>
            </div>
        </Formik>
    )
}

export default InspectionFacilityList
