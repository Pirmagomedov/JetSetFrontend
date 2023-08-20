import React, { useEffect, useState } from 'react'
import { Options } from 'src/types'

interface IProductCharacteristic {
  options: Options
  isBlurred?: boolean
}

const ProductCharacteristic: React.FC<IProductCharacteristic> = React.memo(props => {
  const { options, isBlurred } = props
  const [filteredOptions, setFilteredOptions] = useState<Options>([])

  useEffect(() => {
    if (options.length) {
      setFilteredOptions(options.filter(el => el.value))
    }
  }, [options])

  return filteredOptions.length ? (
    <div className="product__items">
      {filteredOptions.map(({ label, value }) => (
        <div key={label} className="product__item">
          <div className="product__item-label">{label}</div>
          <div className={(/*label === 'Serial Number' ||*/ label === 'Registration Number') && isBlurred ? 'product__blurry-text' : 'product__item-value'}>{value}</div>
        </div>
      ))}
    </div>
  ) : (
    <b style={{ display: 'block', textAlign: 'center' }}>There are no characteristics in the category.</b>
  )
})

export default ProductCharacteristic
