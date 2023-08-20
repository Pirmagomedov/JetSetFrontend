import { format } from 'date-fns'
import React from 'react'
import Icon from 'src/components/Icon/Icon'
import { formatPrice } from 'src/helper'
import { AdStatus } from 'src/types'
import './PriceTag.scss'

interface IPriceTag {
    icon?: boolean
    currency: string
    amount: number
    status?: number
    isBuyer?: boolean
    vat?: number
}

const PriceTag: React.FC<IPriceTag> = (props) => {
    const { icon, currency, amount, status, isBuyer, vat } = props
    const currencyIcon = currency ? 'i-' + currency.toLowerCase() : null

    return (
        <div className="price-tag">
            {icon ? (
                <Icon
                    className="price-tag__icon"
                    name={currencyIcon}
                    title={currency}
                />
            ) : (
                currency &&
                status !== AdStatus.SOLD && (
                    <span className="price-tag__currency">{currency}</span>
                )
            )}

            <span className="price-tag__amount">
                {status === AdStatus.SOLD ? (
                    isBuyer ? (
                        'ACQUIRED'
                    ) : (
                        'SOLD'
                    )
                ) : (
                    <>
                        {formatPrice(amount)}
                        {vat && (
                            <span className="price-tag__vat">
                                {' '}
                                incl. VAT {formatPrice(vat)}%
                            </span>
                        )}
                    </>
                )}
            </span>
        </div>
    )
}

export default PriceTag
