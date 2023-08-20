import React, { lazy, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
const Icon = lazy(() => import('src/components/Icon/Icon'))
const LoaderView = lazy(() => import('src/components/LoaderView/LoaderView'))
const ProductItems = lazy(() => import('src/components/ProductItems/ProductItems'))
const SearchLine = lazy(() => import('src/components/SearchLine/SearchLine'))
const Layout = lazy(() => import('src/hoc/Layout'))
import { Ad, AdCard, useAds } from 'src/generated/graphql'
import { useDispatch, useSelector } from 'react-redux'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { setNotification } from 'src/reducers/notificationReducer'
import { AppDispatch, RootState } from 'src/store'
import './Home.scss'

const Home: React.FC = React.memo((props) => {
    const [error, setError] = useState<string>(null)
    const [isLoading, setLoading] = useState<boolean>(false)
    const [offset, setOffset] = useState<number>(0)
    const [products, setProducts] = useState<AdCard[]>([])

    const [first, setFirst] = useState<number>(window.innerWidth > 1024 ? 8 : 6)
    const [hasNextPage, setHasNextPage] = useState<boolean>()

    const dispatch: AppDispatch = useDispatch()
    const isAuth = useSelector((state: RootState) => state.user.isAuth)

    const [, getAds] = useAds()

    const param = new URLSearchParams(useLocation().search)
    const isDeleteAd = param.get('deleteAd')

    useEffect(() => {
        // A check for an "undefined" value is needed for the correct display of the toolbar in the ad card
        if (isAuth !== undefined || isAuth) {
            dispatch(setCommonLoader(true))
            onAds(first, offset)

            if (isDeleteAd) {
                dispatch(
                    setNotification({
                        text: 'Announcement successfully removed.',
                    }),
                )
            }
        }
    }, [isAuth])

    const onAds = (first: number, offset: number) => {
        setLoading(true)
        getAds({ first, offset })
            .then((res) => {
                const response = res.data.ads
                const error = response.runtimeError
                if (error) {
                    setError(error.message)
                    return false
                }
                const ads: AdCard[] = response.ads.edges.map((el) => el.node)

                setProducts((prev) => [...prev, ...ads])
                setOffset((prev) => prev + first)
                setHasNextPage(response.ads.pageInfo.hasNextPage)
            })
            .catch((err) => console.error(err))
            .finally(() => {
                dispatch(setCommonLoader(false))
                setLoading(false)
            })
    }

    return (
        <Layout>
            <SearchLine home />
            <div className="last-added">
                    {error && <small className="error-text">{error}</small>}

                    <ProductItems products={products} />

                    {hasNextPage ? (
                        <div className="load-more-block">
                            {!isLoading ? (
                                <Icon
                                    name="load-more"
                                    onClick={() => onAds(first, offset)}
                                />
                            ) : (
                                <LoaderView ring />
                            )}
                        </div>
                    ) : null}
            </div>
        </Layout>
    )
})

export default Home
