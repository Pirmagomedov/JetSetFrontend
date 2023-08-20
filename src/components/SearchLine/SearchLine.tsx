import { Form, Formik } from 'formik'
import React, { SyntheticEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'
import { useGetManufacturers, useGetModels } from 'src/generated/graphql'
import { AdsOptions } from 'src/pages/Search/Search'
import { setNotification } from 'src/reducers/notificationReducer'
import { AppDispatch, RootState } from 'src/store'
import { Options } from 'src/types'
import Icon from 'src/components/Icon/Icon'
import Button from '../Button/Button'
import Filters, { IFilterValues, IFilterValuesRange } from '../Filters/Filters'
import FormikField from '../FormikField/FormikField'
import FormikSelect from '../FormikSelect/FormikSelect'
import './SearchLine.scss'

interface ISearchLine {
    home?: boolean
    values?: IFilterValuesRange
    onApply?: (opts: AdsOptions) => void
}

interface IValues {
    query: string
    category: string
    manufacturer: string
    model: string
}

const SearchLine: React.FC<ISearchLine> = React.memo((props) => {
    const { home, values, onApply } = props
    const params = new URLSearchParams(useLocation().search)
    const searchQuery = params.get('query')
    const searchCategoryId = params.get('category')
    const searchManufacturerId = params.get('manufacturer')
    const searchModelId = params.get('model')

    const initialValues: IValues = {
        query: searchQuery || '',
        category: searchCategoryId || '',
        manufacturer: searchManufacturerId || '',
        model: searchModelId || '',
    }

    const [isFilters, setIsFilters] = useState<boolean>(false)
    const [manufacturerOptions, setManufacturerOptions] = useState<Options>([])
    const [modelOptions, setModelOptions] = useState<Options>([])
    const [isLoading, setLoading] = useState<boolean>(false)

    const router = useHistory()
    const { planeCategories } = useSelector(
        (store: RootState) => store.choices.choices,
    )
    const dispatch: AppDispatch = useDispatch()
    const [, getManufacturers] = useGetManufacturers()
    const [, getModels] = useGetModels()
    const history = useHistory()
    const inSearch = history.location.pathname === '/search'

    useEffect(() => {
        if (planeCategories?.length) {
            if (searchCategoryId) {
                handleCategories(searchCategoryId)
            }
            if (searchManufacturerId) {
                handleManufacture(searchManufacturerId)
            }
        }
    }, [planeCategories])

    const handleCategories = (category: string) => {
        setLoading(true)
        getManufacturers({ category: +category })
            .then((res) => {
                const response = res.data.getManufacturers
                const runtimeError = response.runtimeError
                if (runtimeError) {
                    dispatch(
                        setNotification({
                            text: runtimeError.message,
                            isPositive: false,
                        }),
                    )
                    console.error(runtimeError.message)
                    return false
                }
                setManufacturerOptions(response.manufacturers)
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false))
    }

    const handleManufacture = (manufacturer: string) => {
        setLoading(true)
        getModels({ manufacturer: +manufacturer })
            .then((res) => {
                const response = res.data.getModels
                const runtimeError = response.runtimeError
                if (runtimeError) {
                    dispatch(
                        setNotification({
                            text: runtimeError.message,
                            isPositive: false,
                        }),
                    )
                    console.error(runtimeError.message)
                    return false
                }
                setModelOptions(response.models)
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false))
    }

    const fields = (
        <div className='search-filters__fields'>
            <FormikSelect
                name="category"
                options={planeCategories}
                placeholder="Categories"
                className="search-line__categories select"
                isLoading={isLoading}
                changeHandler={handleCategories}
            />
            <FormikSelect
                name="manufacturer"
                options={manufacturerOptions}
                placeholder="Manufacturers"
                className="search-line__manufacturer select"
                isLoading={isLoading}
                changeHandler={handleManufacture}
            />
            <FormikSelect
                name="model"
                options={modelOptions}
                placeholder="Model"
                className="search-line__model select"
                isLoading={isLoading}
            />
        </div>
    )

    const handleSubmit = (values: IValues) => {
        let searchValues = {}
        Object.keys(values).forEach((key) =>
            values[key] ? (searchValues[key] = values[key]) : null,
        )

        const searchParams = new URLSearchParams(
            searchValues as Record<string, string>,
        )
        router.push({ pathname: '/search', search: searchParams.toString() })
    }

    return (
        <div className="search-line">
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                <Form className="search-line__inner" >
                    <FormikField
                        name="query"
                        placeholder="Enter keywords"
                        icon="search-icon.svg"
                        className="search-line__query"
                    />
                    {fields}
                    <Button
                        className='search-line__inner__close-icon'
                        btnType='reset'
                        type='white'
                    >
                        Reset
                    </Button>
                    {/* <div className='search-filters__fields__non-mobile'></div> */}
                    {/* <div
                        className="search-line__filter-toggle"
                        onClick={() => setIsFilters(true)}
                    >
                        <Icon name="i-filter" />
                    </div> */}
                    {isFilters && (
                        <div className="search-filters">
                            <div className="search-filters__header">
                                <div className="search-filters__label">
                                    Search settings
                                </div>
                                <div
                                    className="search-filters__close"
                                    onClick={() => setIsFilters(false)}
                                >
                                    <Icon name="i-close" />
                                </div>
                            </div>
                            {/* {fields} */}
                            {/* <div className="search-filters__fields">
                                <div className={`search-filters__fields__${isFilters ? 'open' : 'closed'}`}>
                                </div>
                            </div> */}
                            {inSearch ? (
                                <>
                                    <div className="search-filters__header">
                                        Filters
                                    </div>
                                    <Filters
                                        values={values}
                                        onApply={onApply}
                                    />
                                </>
                            ) : (
                                <Button
                                    className="search-filters__apply"
                                    size="small"
                                >
                                    Apply
                                </Button>
                            )}
                        </div>
                    )}
                    <Button
                        className="search-line__submit"
                        btnType="submit"
                    >
                        Search
                    </Button>
                </Form>
            </Formik>
        </div>
    )
})

export default SearchLine
