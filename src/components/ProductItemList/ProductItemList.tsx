import React from 'react'
import { useHistory } from 'react-router'
import { AdType } from 'src/generated/graphql'
import { AdStatus } from 'src/types'
import ProductToolbar from '../ProductItem/views/ProductToolbar/ProductToolbar'
import { getImageLink, ImageStyles } from 'src/helper'
import './ProductItemList.scss'

interface IProductItemList {
    product: AdType
}

const ProductItemList: React.FC<IProductItemList> = React.memo(
    ({ product }) => {
        const { id, status, mainInformation, termsOfPayment, lists } = product
        const router = useHistory()

        const handleClick = (event) => {
            event.preventDefault()

            if (status === AdStatus.DRAFT) {
                router.push(`/create-ad/${id}`)
            } else {
                router.push(`/product/${id}`)
            }
            return
        }

        return (
            <div className="product-item-list">
                <div className="product-item-list__image">
                    <img
                        src={getImageLink(
                            mainInformation?.images?.[0],
                            ImageStyles.AD,
                        )}
                        alt=""
                        onClick={handleClick}
                    />
                    <ProductToolbar product={product} />
                </div>
                <div className="product-item-list__content">
                    <div className="product-item-list__header">
                        <div className="product-item-list__info">
                            <div
                                className="product-item-list__title"
                                onClick={handleClick}
                            >
                                {mainInformation?.name}
                            </div>
                            <div className="product-item-list__type">
                                {mainInformation?.category?.label}
                            </div>
                            <div className="product-item-list__year">
                                {mainInformation?.year}
                            </div>
                        </div>
                        <div className="product-item-list__price">
                            ${' '}
                            {parseFloat(
                                termsOfPayment?.aircraftPrice?.toString(),
                            ).toLocaleString('ru')}
                        </div>
                    </div>
                </div>
            </div>
        )
    },
)

export default ProductItemList
