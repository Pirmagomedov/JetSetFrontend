import React from 'react'

interface IProductInfoList {
  year: number
  totalSeats: number
  ttsn: number
  serialNumber?: string
  registrationNumber?: string
  isBlurred?: boolean
}

const ProductInfoList: React.FC<IProductInfoList> = React.memo(props => {
  const { year, totalSeats, ttsn, serialNumber, registrationNumber, isBlurred } = props

  return (
    <div className="product__info-items">
      <div className="product__info-item">
        <div className="product__info-label">Year: </div>
        <div className="product__info-value">{year}</div>
      </div>
      <div className="product__info-item">
        <div className="product__info-label">Seats: </div>
        <div className="product__info-value">{totalSeats}</div>
      </div>
      <div className="product__info-item">
        <div className="product__info-label">TTSN: </div>
        <div className="product__info-value">{ttsn} h</div>
      </div>
      {serialNumber ?
        <div className="product__info-item">
          <div className='product__info-label'>SN: </div>
          <div className={'product__info-label'}>{serialNumber}</div>
        </div> : null}
      {registrationNumber ?
        <div className="product__info-item">
          <div className='product__info-label'>Reg. N: </div>
          <div className={isBlurred ? "product__blurry-text" : 'product__info-label'}>{registrationNumber}</div>
        </div> : null}
    </div>
  )
})

export default ProductInfoList
