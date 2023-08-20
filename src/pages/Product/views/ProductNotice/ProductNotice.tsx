import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import Icon from 'src/components/Icon/Icon'
import { noticeClose, noticeConfirm } from 'src/reducers/productNoticeReducer'
import { AppDispatch, RootState } from 'src/store'
import './ProductNotice.scss'

const ProductNotice: React.FC = React.memo(props => {
  const { isOpen, image, title, text, btnText } = useSelector((state: RootState) => state.productNotice)
  const dispatch: AppDispatch = useDispatch()
  const router = useHistory()

  const closeModal = () => {
    dispatch(noticeClose())
  }

  const handleClick = () => {
    closeModal()
    dispatch(noticeConfirm())
  }

  return isOpen ? (
    <div className="product-block">
      <div className="container">
        <div className="product-block__inner">
          <div className="product-block__img">
            <img src={image} alt={title} />
          </div>
          <div className="product-block__body">
            <div className="product-block__content">
              <div className="product-block__name">{title}</div>
              <div className="product-block__text">{text}</div>
            </div>
            <div className="product-block__actions">
              <button className="product-block__btn btn btn-blue" onClick={handleClick}>
                {btnText}
              </button>
              <button className="product-block__close" onClick={() => closeModal()}>
                <Icon name="i-close" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null
})

export default ProductNotice
