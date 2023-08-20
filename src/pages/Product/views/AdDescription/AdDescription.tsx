import React, { useState } from 'react'
import Icon from 'src/components/Icon/Icon'
import './AdDescription.scss'

interface IAdDescription {
    product: any
}

const AdDescription: React.FC<IAdDescription> = (props) => {
    const { product } = props
    if (!product?.mainInformation?.description) return null
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const isEnoughLengthToHide = product?.mainInformation?.description.length > 375
    // console.log("isEnoughLengthToHide", isEnoughLengthToHide)

    const handleClick = () => {
        console.log('isOpen', isOpen)
        setIsOpen(
            (prev) => {
                return !prev
            }
        )
    }

    return (

        <div className="product__description">
            <div className="product__text">
                <p
                    className={isEnoughLengthToHide &&
                        `
                        product__text__content
                        product__text__content-${isOpen ? 'open' : 'close'}
                        `
                    }
                >
                    {
                        product?.mainInformation?.description
                    }
                </p>
                {
                    isEnoughLengthToHide &&
                    <Icon name='i-arrow' className={`product__text-collapsible product__text-collapsible__${isOpen ? "open" : "close"}`} onClick={handleClick} />
                }
            </div>
        </div>
    )
}


export default AdDescription