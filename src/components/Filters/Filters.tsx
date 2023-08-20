import { Form, Formik, FormikHelpers } from 'formik'
import React, { useEffect, useState } from 'react'
import AutosizeInput from 'react-input-autosize'
import { useSelector } from 'react-redux'
import ReactSlider from 'react-slider'
import { AdsOptions } from 'src/pages/Search/Search'
import { RootState } from 'src/store'
import Button from '../Button/Button'
import FormikSelect from '../FormikSelect/FormikSelect'
import './Filters.scss'
import FilterItem from './views/FilterItem/FilterItem'

interface IFilters {
    values?: IFilterValuesRange
    onApply?: (opts: AdsOptions) => void
    isLoading?: boolean
}

export interface IFilterValuesRange {
    price: number[]
    yearOfManufacture: number[]
    time: number[]
    seats: number[]
}

export interface IFilterValues extends IFilterValuesRange {
    country: string
    conditions: string
}

const Filters: React.FC<IFilters> = React.memo((props) => {
    const { values, onApply, isLoading } = props
    const [price, setPrice] = useState<number[]>([0, 0])
    const [yearOfManufacture, setYearOfManufacture] = useState<number[]>([0, 0])
    const [time, setTime] = useState<number[]>([0, 0])
    const [seats, setSeats] = useState<number[]>([0, 0])

    const { countries, planeConditions } = useSelector(
        (store: RootState) => store.choices.choices,
    )

    const initialValues: IFilterValues = {
        price,
        yearOfManufacture,
        country: null,
        time,
        seats,
        conditions: null,
    }

    useEffect(() => {
        if (values) {
            setPrice(values.price)
            setYearOfManufacture(values.yearOfManufacture)
            setTime(values.time)
            setSeats(values.seats)
        }
    }, [values])

    const handleSubmit = (
        values: IFilterValues,
        { setSubmitting }: FormikHelpers<IFilterValues>,
    ) => {
        onApply({
            isLoadMore: false,
            resetOffset: true,
            termsOfPayment_AircraftPrice_Lte: values.price[1],
            termsOfPayment_AircraftPrice_Gte: values.price[0],
            mainInformation_Year_Lte: values.yearOfManufacture[1],
            mainInformation_Year_Gte: values.yearOfManufacture[0],
            aircraftLocation_Country_Value: values.country
                ? +values.country
                : null,
            aircraftSummary_TotalTime_Lte: values.time[1],
            aircraftSummary_TotalTime_Gte: values.time[0],
            aircraftSummary_TotalSeats_Lte: values.seats[1],
            aircraftSummary_TotalSeats_Gte: values.seats[0],
            mainInformation_Condition_Label: values.conditions
                ? values.conditions?.toString()
                : null,
        })
    }

    const handleRange = (
        e,
        values: IFilterValues,
        setFieldValue,
        fieldName: string,
        newValue: 'first' | 'second',
    ) => {
        const [firstValue, secondValue] = values[fieldName]
        const [firstValueDefault, secondValueDefault] = initialValues[fieldName]
        const currentValue = +e.target.value

        if (!currentValue) return

        if (newValue === 'first') {
            if (currentValue <= secondValue) {
                setFieldValue(fieldName, [currentValue, secondValue])
            }
        }
        if (newValue === 'second') {
            setFieldValue(fieldName, [firstValue, currentValue])
        }
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            enableReinitialize={true}
        >
            {({ values, setFieldValue, resetForm }) => (
                <Form className="filters">
                    <div className="filters__items">
                        <FilterItem
                            icon="price"
                            label="Price"
                        >
                            <div className="range-slider">
                                <ReactSlider
                                    min={price?.[0]}
                                    max={price?.[1]}
                                    className="range-slider__slider"
                                    thumbClassName="range-slider__thumb"
                                    trackClassName="range-slider__track"
                                    value={values.price}
                                    onChange={(val) =>
                                        setFieldValue('price', val)
                                    }
                                    step={10000}
                                />
                                <div className="range-slider__fields">
                                    <span className="range-slider__symbol">
                                        $
                                    </span>
                                    <AutosizeInput
                                        className="range-slider__input"
                                        value={values.price[0]}
                                        onChange={(e) =>
                                            handleRange(
                                                e,
                                                values,
                                                setFieldValue,
                                                'price',
                                                'first',
                                            )
                                        }
                                    />
                                    <span className="range-slider__divider">
                                        -
                                    </span>
                                    <span className="range-slider__symbol">
                                        $
                                    </span>
                                    <AutosizeInput
                                        className="range-slider__input"
                                        value={values.price[1]}
                                        onChange={(e) =>
                                            handleRange(
                                                e,
                                                values,
                                                setFieldValue,
                                                'price',
                                                'second',
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </FilterItem>
                        <FilterItem
                            icon="year"
                            label="Year of manufacture"
                        >
                            <div className="range-slider">
                                <ReactSlider
                                    min={yearOfManufacture?.[0]}
                                    max={yearOfManufacture?.[1]}
                                    className="range-slider__slider"
                                    thumbClassName="range-slider__thumb"
                                    trackClassName="range-slider__track"
                                    value={values.yearOfManufacture}
                                    onChange={(val) =>
                                        setFieldValue('yearOfManufacture', val)
                                    }
                                />
                                <div className="range-slider__fields">
                                    <AutosizeInput
                                        className="range-slider__input"
                                        value={values.yearOfManufacture[0]}
                                        onChange={(e) =>
                                            handleRange(
                                                e,
                                                values,
                                                setFieldValue,
                                                'yearOfManufacture',
                                                'first',
                                            )
                                        }
                                    />
                                    <span className="range-slider__divider">
                                        -
                                    </span>
                                    <AutosizeInput
                                        className="range-slider__input"
                                        value={values.yearOfManufacture[1]}
                                        onChange={(e) =>
                                            handleRange(
                                                e,
                                                values,
                                                setFieldValue,
                                                'yearOfManufacture',
                                                'second',
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </FilterItem>
                        <FilterItem
                            icon="region"
                            label="Region"
                        >
                            <div className="filters__select">
                                <FormikSelect
                                    className="select select-white"
                                    name="country"
                                    options={countries}
                                    placeholder="Select Region"
                                />
                            </div>
                        </FilterItem>
                        <FilterItem
                            icon="time"
                            label="Total time"
                        >
                            <div className="range-slider">
                                <ReactSlider
                                    min={time?.[0]}
                                    max={time?.[1]}
                                    className="range-slider__slider"
                                    thumbClassName="range-slider__thumb"
                                    trackClassName="range-slider__track"
                                    value={values.time}
                                    onChange={(val) =>
                                        setFieldValue('time', val)
                                    }
                                />
                                <div className="range-slider__fields">
                                    <AutosizeInput
                                        className="range-slider__input"
                                        value={values.time[0]}
                                        onChange={(e) =>
                                            handleRange(
                                                e,
                                                values,
                                                setFieldValue,
                                                'time',
                                                'first',
                                            )
                                        }
                                    />
                                    <span className="range-slider__symbol">
                                        h
                                    </span>
                                    <span className="range-slider__divider">
                                        -
                                    </span>
                                    <AutosizeInput
                                        className="range-slider__input"
                                        value={values.time[1]}
                                        onChange={(e) =>
                                            handleRange(
                                                e,
                                                values,
                                                setFieldValue,
                                                'time',
                                                'second',
                                            )
                                        }
                                    />
                                    <span className="range-slider__symbol">
                                        h
                                    </span>
                                </div>
                            </div>
                        </FilterItem>
                        <FilterItem
                            icon="seats"
                            label="Number of Seats"
                        >
                            <div className="range-slider">
                                <ReactSlider
                                    min={seats?.[0]}
                                    max={seats?.[1]}
                                    className="range-slider__slider"
                                    thumbClassName="range-slider__thumb"
                                    trackClassName="range-slider__track"
                                    value={values.seats}
                                    onChange={(val) =>
                                        setFieldValue('seats', val)
                                    }
                                />
                                <div className="range-slider__fields">
                                    <AutosizeInput
                                        className="range-slider__input"
                                        value={values.seats[0]}
                                        onChange={(e) =>
                                            handleRange(
                                                e,
                                                values,
                                                setFieldValue,
                                                'seats',
                                                'first',
                                            )
                                        }
                                    />
                                    <span className="range-slider__divider">
                                        -
                                    </span>
                                    <AutosizeInput
                                        className="range-slider__input"
                                        value={values.seats[1]}
                                        onChange={(e) =>
                                            handleRange(
                                                e,
                                                values,
                                                setFieldValue,
                                                'seats',
                                                'second',
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </FilterItem>
                        <FilterItem
                            icon="conditions"
                            label="Conditions"
                        >
                            <div className="filters__select">
                                <FormikSelect
                                    className="select select-white"
                                    name="conditions"
                                    options={planeConditions}
                                    placeholder="Enter Conditions"
                                />
                            </div>
                        </FilterItem>
                    </div>
                    <div className="filters__buttons">
                        <Button
                            type="secondary"
                            size="small"
                            btnType="button"
                            onClick={() => resetForm()}
                            disabled={isLoading}
                        >
                            Clear
                        </Button>
                        <Button
                            size="small"
                            btnType="submit"
                            disabled={isLoading}
                        >
                            Apply
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    )
})

export default Filters
