import React from 'react'
import Icon from 'src/components/Icon/Icon'
import { AdFull } from 'src/generated/graphql'
import './ProductFeatures.scss'

interface IProductFeatures {
  product: AdFull
}

const ProductFeatures: React.FC<IProductFeatures> = React.memo(props => {
  //console.log('ProductFeatures', props)
  return null
  return (
    <div className="product-features">
      <div className="product-features__subtitle">Features</div>
      <div className="product-features__items">
        <div className="product-features__item">
          <Icon className="product-features__icon" name="check" />
          <span className="product-features__text">ADS-B Compliant</span>
        </div>
        <div className="product-features__item">
          <Icon className="product-features__icon" name="check" />
          <span className="product-features__text">HUD</span>
        </div>
        <div className="product-features__item">
          <Icon className="product-features__icon" name="check" />
          <span className="product-features__text">Fwd Lavatory</span>
        </div>
        <div className="product-features__item">
          <Icon className="product-features__icon" name="check" />
          <span className="product-features__text">Convection Oven</span>
        </div>
        <div className="product-features__item">
          <Icon className="product-features__icon" name="check" />
          <span className="product-features__text">Fwd Galley</span>
        </div>
      </div>
    </div>
  )
})

export default ProductFeatures
