import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AdCard, AppDealStatusChoices } from 'src/generated/graphql'
import {
    formatPrice,
    getProductStatus,
    getImageLink,
    getImageRatio,
    ImageStyles,
} from 'src/helper'
import { AdStatus, ProductStatus } from 'src/types'
import ProductToolbar from './views/ProductToolbar/ProductToolbar'
import Icon from 'src/components/Icon/Icon'
import PriceTag from 'src/components/PriceTag/PriceTag'
import CardImage from 'src/components/CardImage/CardImage'
import './ProductItem.scss'
import { lime } from '@mui/material/colors'

interface IProductItem {
    ad?: AdCard
    reRenderFavorites?: () => void
    pathname?: string
    inventory?: boolean
    workspaceId?: string
    triggerDemo?: () => void
}

const ProductItem: React.FC<IProductItem> = React.memo((props) => {
    const { ad = null, reRenderFavorites, pathname, inventory, workspaceId, triggerDemo } = props
    
    const demoMode = !ad

    const title = ad 
        ? ad.mainInformation.manufacturer.label + ' ' + ad.mainInformation.model.label 
        : 'Wright Flyer'

    const id = ad 
        ? ad.id 
        : '0'

    const year = ad 
        ? ad.mainInformation.year 
        : 1903

    const currency = ad 
        ? ad?.termsOfPayment?.currency?.label
        : 'USD'
    const price = ad 
        ? ad?.termsOfPayment?.aircraftPrice
        : 999

    const image = ad 
        ? getImageLink(ad?.mainInformation?.images?.sort((a, b) => a.order > b.order ? 1 : -1)?.[0], ImageStyles.AD)
        : '/assets/demo/flyer.gif'

    const deals = ad?.deals 
        ? ad.deals
        : []

    const status = ad 
        ? ad.status
        : 7

    const ttsn = ad 
        ? ad?.aircraftSummary?.airframeTtsn
            ? ad?.aircraftSummary.airframeTtsn
            : null
        : Math.floor((new Date().getTime() - new Date('1903-12-17').getTime())  / 3600000) 

    const sn = ad?.aircraftSummary?.serialNumber ? ad.aircraftSummary.serialNumber : null


    const router = useHistory()
    const inDeal = deals?.length
    const currentDeals = inDeal
        ? deals.filter((d) => {
              if (d?.status !== AppDealStatusChoices.DC) return d
          })
        : null
    const currentDeal = currentDeals?.length ? currentDeals.pop() : null
    const currentAppDealStatusChoices = currentDeal?.status
    const isBuyer = workspaceId == deals?.[0]?.buyer?.id
    const productStatus = getProductStatus(status, isBuyer)
    const productStatusClass = productStatus.replace(' ', '-').toLowerCase()

    const handleClick = (event) => {
        event.preventDefault()
        if (demoMode) {
            if (triggerDemo) {
                triggerDemo()
            }
        } else {
            if (status === AdStatus.DRAFT && pathname === '/inventory') {
                router.push(`/create-ad/${id}`)
            } else {
                router.push(`/product/${id}`)
            }
        }

        return
    }

    return (
        <div
            className={`product-item ${productStatusClass} product-status-${status}`}
            id={`product-item-ad-${id}`}
            onClick={handleClick}
        >
            <div className="product-item__image">
                <CardImage
                    ratio={getImageRatio(ImageStyles.AD)}
                    src={image}
                    title={title}
                />
            </div>
            <div className="product-item__content">
                <div
                    className="product-item__title"
                >
                    {title}
                    {
                        demoMode && 
                        <span className="grayed">&nbsp;(Demo)</span>
                    }
                </div>

                <div className="product-item__props">
                    <div className="product-item__year">{year}</div>
                    {
                        ttsn && 
                        <div className="product-item__ttsn">
                            <Icon name="i-clock"/> 
                            <span>{ttsn}</span>
                        </div>
                    }
                    {
                        sn &&
                        <div className="product-item__sn">
                            SN <span>{sn}</span>
                        </div>
                    }
                </div>

                <div className="product-item__footer">
                    

                    {status == AdStatus.PUBLISHED && (
                        <div className="product-item__published">
                            <span><PriceTag
                                icon={true}
                                currency={currency}
                                amount={price}
                            /> </span>
                        </div>
                    )}

                    <div className="product-item__status">
                        {`${inventory ? productStatus : ''}`}
                    </div>
                </div>
            </div>
        </div>
    )
})

export default ProductItem
