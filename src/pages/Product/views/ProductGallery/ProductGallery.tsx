import React, { useEffect, useState } from 'react'
import 'react-image-lightbox/style.css'
import Icon from 'src/components/Icon/Icon'
import CardImage from 'src/components/CardImage/CardImage'

import {
  getImageRatio,
  ImageStyles
} from 'src/helper'
import './ProductGallery.scss'

import Slider from "react-slick";
import 'src/scss/slick.scss'


interface IProductGallery {
  images: string[]
  title: string
  ratio: number
}

const ProductGallery: React.FC<IProductGallery> = React.memo(props => {
  const {images = [], title, ratio} = props

  const settings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      nextArrow: <Icon className="arrow-next" name="next" />,
      prevArrow: <Icon className="arrow-prev" name="prev" />,
      customPaging: function(i) {
        return (
          <div className="slick-dot" >
            
          </div>
        );
      },
    }

  return (
    <div className="product-gallery" >
      <div className="product-gallery__wrapper">
        <svg className="svg-placeholder" style={{aspectRatio: `${ratio}`}}>
        </svg>
        <Slider {...settings}>
          {
            images.map((image, i) =>
              <img key={`img${i}`} src={image} title={title} alt={title} />
            )
          }
        </Slider>
      </div>
    </div>
  )
})

export default ProductGallery
