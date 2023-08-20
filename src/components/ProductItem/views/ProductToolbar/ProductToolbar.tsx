import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'
import Icon from 'src/components/Icon/Icon'
import {
    AdType,
    useAddComparison,
    useAddFavorite,
    useDeleteComparison,
    useDeleteFavorite,
} from 'src/generated/graphql'
import { setProductNotice } from 'src/reducers/productNoticeReducer'
import { AppDispatch, RootState } from 'src/store'
import './ProductToolbar.scss'

interface IProductToolbar {
    product: AdType
    reRenderFavorites?: () => void
}

const ProductToolbar: React.FC<IProductToolbar> = React.memo(
    ({ product, reRenderFavorites }) => {
        const {
            id,
            lists: { comparison, favorites },
            mainInformation: { images, name, category },
        } = product
        const [isFavorites, setFavorites] = useState<boolean>(favorites)
        const [isComparison, setComparison] = useState<boolean>(comparison)
        const [isLoading, setLoading] = useState<boolean>(false)

        const location = useLocation()
        const [isFavoritesPage, setFavoritesPage] = useState<boolean>(
            location.pathname === '/favorites',
        )
        const isAuth = useSelector((state: RootState) => state.user.isAuth)

        const dispatch: AppDispatch = useDispatch()
        const router = useHistory()

        const [, addFavorite] = useAddFavorite()
        const [, deleteFavorite] = useDeleteFavorite()
        const [, addComparison] = useAddComparison()
        const [, deleteComparison] = useDeleteComparison()

        const handleFavorites = () => {
            setLoading(true)
            if (isFavorites) {
                deleteFavorite({ adId: id })
                    .then((res) => {
                        const response = res.data.deleteFavorite
                        const runtimeError = response.runtimeError
                        if (runtimeError) {
                            console.error(
                                `[${runtimeError.message}]: ${runtimeError.message}`,
                            )
                            return
                        }

                        setFavorites(false)
                        setLoading(false)

                        if (isFavoritesPage) {
                            reRenderFavorites && reRenderFavorites()
                        }
                    })
                    .catch((error) => console.log(error))
            } else {
                addFavorite({ adId: id })
                    .then((res) => {
                        const response = res.data.addFavorite
                        const runtimeError = response.runtimeError
                        if (runtimeError) {
                            console.error(
                                `[${runtimeError.message}]: ${runtimeError.message}`,
                            )
                            return
                        }

                        setFavorites(true)
                        setLoading(false)
                    })
                    .catch((error) => console.log(error))
            }
        }

        const handleComparison = () => {
            setLoading(true)
            if (isComparison) {
                deleteComparison({ adId: id })
                    .then((res) => {
                        const response = res.data.deleteComparison
                        const runtimeError = response.runtimeError
                        if (runtimeError) {
                            console.error(
                                `[${runtimeError.message}]: ${runtimeError.message}`,
                            )
                            return false
                        }
                        setComparison(false)
                        setLoading(false)
                    })
                    .catch((error) => console.error(error))
            } else {
                addComparison({ adId: id })
                    .then((res) => {
                        const response = res.data.addComparison
                        const runtimeError = response.runtimeError
                        if (runtimeError) {
                            console.error(
                                `[${runtimeError.message}]: ${runtimeError.message}`,
                            )
                            return false
                        }

                        dispatch(
                            setProductNotice({
                                image: images?.[0]?.link,
                                title: name,
                                text: category?.label,
                                onClick() {
                                    router.push('/compare')
                                },
                            }),
                        )

                        setComparison(true)
                        setLoading(false)
                    })
                    .catch((error) => console.error(error))
            }
        }

        return isAuth ? (
            <span className="product-toolbar">
                <button
                    className={`product-toolbar__favorites ${
                        isFavorites ? 'product-toolbar__favorites--active' : ''
                    }`}
                    type="button"
                    onClick={handleFavorites}
                    disabled={isLoading}
                >
                    <Icon name="heart" />
                </button>
                <button
                    className={`product-toolbar__shuffle ${
                        isComparison ? 'product-toolbar__shuffle--active' : ''
                    }`}
                    type="button"
                    onClick={handleComparison}
                >
                    <Icon name="shuffle" />
                </button>
            </span>
        ) : null
    },
)

export default ProductToolbar
