import React, { useEffect, useState } from 'react'

import { Form, Formik } from 'formik'
import { useLocation } from 'react-router'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch } from 'src/store'
import { Options } from 'src/types'

import { useDispatch } from 'react-redux'

import Layout from 'src/hoc/Layout'

import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import Icon from 'src/components/Icon/Icon'
import LoaderView from 'src/components/LoaderView/LoaderView'
import ProductItems from 'src/components/ProductItems/ProductItems'
import SearchLine from 'src/components/SearchLine/SearchLine'
import ProductItemList from 'src/components/ProductItemList/ProductItemList'
import Filters, { IFilterValuesRange } from 'src/components/Filters/Filters'

import {
  AdCard,
  useAds
} from 'src/generated/graphql'

import './Search.scss'

export interface IQueryValues {
  query: string
  categories: string
  manufacturer: string
  model: string
}

export type AdsOptions = {
  newAds?: boolean
  isLoadMore?: boolean
  resetOffset?: boolean
  termsOfPayment_AircraftPrice_Lte?: number
  termsOfPayment_AircraftPrice_Gte?: number
  mainInformation_Year_Lte?: number
  mainInformation_Year_Gte?: number
  aircraftLocation_Country_Value?: number
  aircraftSummary_TotalTime_Lte?: number
  aircraftSummary_TotalTime_Gte?: number
  aircraftSummary_TotalSeats_Lte?: number
  aircraftSummary_TotalSeats_Gte?: number
  mainInformation_Condition_Label?: string
}

interface ISortValues {
  date: boolean
}

const initialSortValues: ISortValues = {
  date: true,
}

const dateOptions: Options = [
  { label: 'New at first', value: true },
  { label: 'Old at first', value: false },
]

const Search: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>()
  const [isList, setIsList] = useState<boolean>(false)
  const [products, setProducts] = useState<AdCard[]>([])
  const [filterValues, setFilterValues] = useState<IFilterValuesRange>()
  const [first, setFirst] = useState<number>(8)
  const [offset, setOffset] = useState<number>(0)
  const [hasNextPage, setHasNextPage] = useState<boolean>()

  const dispatch: AppDispatch = useDispatch()
  const [, getAds] = useAds()

  const params = new URLSearchParams(useLocation().search)

  const query = params.get('query') || null
  const categoryId = +params.get('category') || null
  const manufacturersId = +params.get('manufacturer') || null
  const modelId = +params.get('model') || null



  useEffect(() => {
    dispatch(setCommonLoader(true))
    setOffset(0)
    getAdsData({ isLoadMore: false, resetOffset: true })

    return () => {
      setHasNextPage(false)
    }
  }, [query, categoryId, manufacturersId, modelId])

  const getAdsData = (opts: AdsOptions) => {
    const options = {
      first,
      offset: opts.resetOffset ? 0 : offset,
      mainInformation_Name_Icontains: query,
      mainInformation_Category_Value: categoryId,
      mainInformation_Manufacturer_Value: manufacturersId,
      mainInformation_Model_Value: modelId,
      newAds: opts.newAds,
      termsOfPayment_AircraftPrice_Lte: opts.termsOfPayment_AircraftPrice_Lte,
      termsOfPayment_AircraftPrice_Gte: opts.termsOfPayment_AircraftPrice_Gte,
      mainInformation_Year_Lte: opts.mainInformation_Year_Lte,
      mainInformation_Year_Gte: opts.mainInformation_Year_Gte,
      aircraftLocation_Country_Value: opts.aircraftLocation_Country_Value,
      aircraftSummary_TotalTime_Lte: opts.aircraftSummary_TotalTime_Lte,
      aircraftSummary_TotalTime_Gte: opts.aircraftSummary_TotalTime_Gte,
      aircraftSummary_TotalSeats_Lte: opts.aircraftSummary_TotalSeats_Lte,
      aircraftSummary_TotalSeats_Gte: opts.aircraftSummary_TotalSeats_Gte,
      mainInformation_Condition_Label: opts.mainInformation_Condition_Label,
    }

    let values = {}
    Object.keys(options).forEach(key => {
      if (options[key] !== undefined && options[key] !== null) {
        values[key] = options[key]
      }
    })

    setLoading(true)
    getAds(values)
      .then(res => {
        const response = res.data.ads
        const runtimeError = response.runtimeError
        if (runtimeError) {
          console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
          return false
        }
        const {
          ads,
          minPrice,
          maxPrice,
          minYearManufacturer,
          maxYearManufacturer,
          minTotalTime,
          maxTotalTime,
          minNumberOfSeats,
          maxNumberOfSeats,
        } = response

        setFilterValues({
          price: [minPrice, maxPrice],
          yearOfManufacture: [minYearManufacturer, maxYearManufacturer],
          time: [minTotalTime, maxTotalTime],
          seats: [minNumberOfSeats, maxNumberOfSeats],
        })

        const nodes = ads.edges.map(el => el.node)
        setHasNextPage(response.ads.pageInfo.hasNextPage)
        setOffset(prev => prev + first)
        if (opts.isLoadMore) {
          setProducts(prev => [...prev, ...nodes])
        } else {
          setProducts(nodes)
        }
      })
      .catch(err => console.error(err))
      .finally(() => {
        dispatch(setCommonLoader(false))
        setLoading(false)
      })
  }

  const handleSort = (values: ISortValues) => {
    dispatch(setCommonLoader(true))
    getAdsData({ newAds: values.date, isLoadMore: false, resetOffset: true })
  }

  return (
    <Layout>
      <SearchLine values={filterValues} onApply={getAdsData} />
      <div className="search">
        <div className="container">
          <div className="search__inner">
            {/*<div className="search__sidebar">
              <div className="search__sidebar-title title">Filters</div>
              <Filters values={filterValues} onApply={getAdsData} isLoading={isLoading} />
            </div>*/}
            <div className="search__content">
              <div className="search__filters hidden">
                <Formik initialValues={initialSortValues} onSubmit={handleSort}>
                  {({ handleSubmit }) => (
                    <Form className="search__sort">
                      <div className="select-wrapper">
                        <FormikSelect
                          name="date"
                          options={dateOptions}
                          className="search__sort-select select-text"
                          label="Date added: "
                          changeHandler={() => handleSubmit()}
                        />
                      </div>
                    </Form>
                  )}
                </Formik>
                {/* <div className="search__grid">
                  <Icon name="grid" className={isList ? '' : 'active'} onClick={() => setIsList(false)} />
                  <Icon name="list" className={isList ? 'active' : ''} onClick={() => setIsList(true)} />
                </div> */}
              </div>

              {/*<div className={`search__products ${isList ? 'list' : ''}`}>
                {products.length === 0
                  ? null
                  : products.map(el => {
                      return isList ? <ProductItemList key={el.id} product={el} /> : <ProductItem key={el.id} product={el} />
                    })}
              </div>*/}
              <ProductItems products={products} />
              {hasNextPage ? (
                <div className="load-more-block">
                  {!isLoading ? <Icon name="load-more" onClick={() => getAdsData({ isLoadMore: true })} /> : <LoaderView ring />}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Search
