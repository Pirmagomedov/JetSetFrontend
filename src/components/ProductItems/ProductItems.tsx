import React from 'react'
import { AdCard } from 'src/generated/graphql'
import ProductItem from 'src/components/ProductItem/ProductItem'
import './ProductItems.scss'

interface IProductItems {
    products: Array<AdCard>
    inventory?: boolean
}

const ProductItems: React.FC<IProductItems> = React.memo((props) => {
    const { products, inventory } = props
    return (
        <div className="product-items">
            {products.length === 0
                ? null
                : products.map((el) => {
                      return (
                          <ProductItem
                              key={el.id}
                              ad={el}
                              inventory={inventory}
                          />
                      )
                  })}
        </div>
    )
})

export default ProductItems
