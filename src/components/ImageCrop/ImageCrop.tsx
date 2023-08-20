import React, { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { createImage, getCroppedImg } from './functions/canvasFunctions'
import ReactSlider from 'react-slider'
import Icon from 'src/components/Icon/Icon'
import Button from 'src/components/Button/Button'
import { fileAccept } from 'src/helper'
import Slider from "react-slick";
import './ImageCrop.scss'
import 'src/scss/slick.scss'

interface Point {
  x: number
  y: number
}

interface Crop {
  width: number
  height: number
  x: number
  y: number
}

interface ImageCrapData {
  zoom: number
  crop: Point
  pixelCrop?: Crop
  image: string
  cropped: string
  filename: string
  width?: number
  height?: number
  aspectRatio?: number
}

interface FileData {
  id: string
  file: string
  filename: string 
}

type ImageCrapContent = FileData | ImageCrapData
type ImageCrapEvent = FileData | string


interface IImageCrop {
  uploaded?: any[]
  ratio: number
  minWidth: number
  minHeight: number
  onChange: (files: ImageCrapEvent[]) => void
  onCropStart: () => void
  onCropFinish: () => void
}

interface ICropCard {
  cropped: string
  aspectRatio?: number
}


const ImageSlide: React.FC<ICropCard> = props => {
  const {cropped, aspectRatio} = props

  return (
    <div className="image-crap__preview" style={{aspectRatio: `${aspectRatio}`}}>
      <img src={cropped} />
    </div>
  )
}

/*const getMaxZoom = (
  images: ImageCrapData[], 
  currentImage: number, 
  minWidth: number, 
  minHeight: number
) => {
  return currentImage!== null && images[currentImage] 
    ? Math.min(
        images[currentImage].width / minWidth, 
        images[currentImage].height / minHeight
      ) * 1
    : 1
}*/

const ImageCrap: React.FC<IImageCrop> = props => {
  const { uploaded, ratio, minWidth, minHeight, onChange, onCropStart, onCropFinish } = props
  const [ images, setImages ] = useState<ImageCrapContent[]>(uploaded ? uploaded : [])
  const [ cropped, setCropped ] = useState<string[]>([])
  const [ currentImage, setCurrentImage ] = useState<number>()
  const currentImageItem = currentImage!== null && images[currentImage] ? images[currentImage] : null
  const [ zoomLock, setZoomLock] = useState<boolean>(false)

  const slickSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    responsive: [
      /*{
        breakpoint: 970,
        settings: {
          slidesToShow: 5,
        }
      },*/
      {
        breakpoint: 980,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 720,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        }
      }
  ]
    //centerMode: true,
    //centerPadding: '24px',
    //slidesToScroll: 1,
    //nextArrow: <Icon className="arrow-next" name="next" />,
    /*prevArrow: <Icon className="arrow-prev" name="prev" />,
    customPaging: function(i) {
      return (
        <div className="slick-dot" >
          
        </div>
      );
    },*/
  }

  useEffect(() => {
    if (uploaded && uploaded.length) {
      setImages(uploaded)
      const initialCropped = []
      uploaded.forEach(u => {
        initialCropped.push(u.file)
      })
      setCropped(initialCropped)
      if (!currentImage) {
        setCurrentImage(0)
      }
    }
  }, [uploaded])

  const maxZoom = currentImageItem && 'width' in currentImageItem 
    ? Math.min(
        currentImageItem.width / minWidth, 
        currentImageItem.height / minHeight
      )
    : 1

  const setZoom = (zoom: number) => {
    const newImages = []
    images.forEach((image, i) => {
      if (i === currentImage) {
        newImages.push({...image, zoom})
      } else {
        newImages.push(image)
      }
    })
    setImages(newImages)
  }

  const setCrop = (crop: Point) => {
    const newImages = []
    images.forEach((image, i) => {
      if (i === currentImage) {
        newImages.push({...image, crop})
      } else {
        newImages.push(image)
      }
    })
    setImages(newImages)
  }

  const onCropComplete = async (cropPercent: Crop, croppedAreaPixels: Crop) => {
    const newImages = []
    images.forEach((image, i) => {
      if (i === currentImage) {
        newImages.push({...image, pixelCrop: croppedAreaPixels})
      } else {
        newImages.push(image)
      }
    })
    setImages(newImages)

    if (!zoomLock) {
      onCropStart()
      if (currentImage !== null && cropped[currentImage] && currentImageItem && 'image' in currentImageItem) {
        const croppedImage = await getCroppedImg(
          currentImageItem.image,
          croppedAreaPixels
        )
        const newCropped = []
        cropped.forEach((image, i) => {
          if (i === currentImage) {
            newCropped.push(croppedImage)
          } else {
            newCropped.push(image)
          }
        })
        setCropped(newCropped)
      }
      onCropFinish()
    }
  }

  const updateCrop = async () => {
    if (currentImageItem && 'pixelCrop' in currentImageItem) {
      onCropStart()
      const croppedImage = await getCroppedImg(
        currentImageItem.image,
        currentImageItem.pixelCrop
      )

      const newCropped = []
      cropped.forEach((image, i) => {
        if (i === currentImage) {
          newCropped.push(croppedImage)
        } else {
          newCropped.push(image)
        }
      })
      setCropped(newCropped)
      onCropFinish()
    }
  }

  useEffect(() => {
    if (zoomLock === false) {
      updateCrop()
    }
  }, [zoomLock])

  const onFileChange = async (event) => {
    onCropStart()
    if (event.target.files && event.target.files[0]) {
      const files = event.target.files
      const newImages = []
      const newCropped = []
      for (var i = 0; i < files.length; i++) {
        const file = files[i]
        const image = URL.createObjectURL(file)
        const imageProps = await createImage(image) as HTMLImageElement
        //console.log({imageW: imageProps.width, minWidth, imageH:imageProps.height, minHeight})
        if (imageProps.width < minWidth || imageProps.height < minHeight) {
          console.log('Image is too small!', file)
        }
        newImages.push(
          {
            zoom: 1, 
            filename: file.name,
            crop: {x: 0, y: 0}, 
            image, 
            width:imageProps.width, 
            height:imageProps.height
          }
        )
        const croppedImage = await getCroppedImg(
          image,
          {aspectRatio: ratio}
        )
        newCropped.push(croppedImage)
      }
      setImages([...images, ...newImages])
      setCropped([...cropped, ...newCropped])
      if (!currentImage) {
        setCurrentImage(0)
      }
    }
    onCropFinish()
  }

  const handleRemove = () => {
    const newCurrentImage = images.length > 1
      ? currentImage > 0 
        ? currentImage - 1 
        : 0
      : null 
    const newCropped = []
    const newImages = []
    cropped.forEach((image, i) => {
      if (i !== currentImage) {
        newImages.push(images[i])
        newCropped.push(image)
      }
    })
    setCropped(newCropped)
    setImages(newImages)
    setCropped(newCropped)
    setCurrentImage(newCurrentImage)
  }

  const arrayMoveLeft = (array, index) => {
    const newArray = []
    const movingItem = array[index]
    array.forEach((item, i) => {
      if (i + 1 == index) {
        newArray.push(movingItem)
      }
      if (i !== index) {
        newArray.push(item)
      }
    })
    return newArray
  }

  const arrayMoveRight = (array, index) => {
    const newArray = []
    const movingItem = array[index]
    array.forEach((item, i) => {
      if (i !== index) {
        newArray.push(item)
      }
      if (i - 1 == index) {
        newArray.push(movingItem)
      }
    })
    return newArray
  }

  const makeOnChange = () => {
    const result = []
    images.forEach((image, i) => {
      if ('file' in image) {
        result.push(image)
      } else {
        result.push({
          file: cropped[i],
          filename: image.filename
        })
      }
    })
    onChange && onChange(result)
  }

  useEffect(() => {
    makeOnChange()
  }, [cropped]) 

  const handleMoveLeft = () => {
    if (currentImage > 0) {
      setImages(arrayMoveLeft(images, currentImage))
      setCropped(arrayMoveLeft(cropped, currentImage))
      setCurrentImage(currentImage - 1)
    }
  }

  const handleMoveRight = () => {
    if (currentImage < images.length - 1) {
      setImages(arrayMoveRight(images, currentImage))
      setCropped(arrayMoveRight(cropped, currentImage))
      setCurrentImage(currentImage + 1)
    }
  }

  return (
    <div className={`image-crap ${images.length > 0 ? 'stuffed' : 'empty'}`}>
      <div className="image-crap__area" style={{aspectRatio: `${ratio}`, maxWidth: minWidth}}>
        {
          images.length > 0 && currentImageItem 
          ?
            'image' in currentImageItem 
              ?
                <Cropper
                  {...currentImageItem}
                  aspect={ratio}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  maxZoom={maxZoom}
                  objectFit={'cover'}
                />
              :
                <div className="image-crap__area--cropped"><img src={currentImageItem.file} /><Icon name="lock" /></div>
          :
            <label htmlFor="g-crap" className="image-crap__gallery--input">Please, upload images</label>
    
        }
        
      </div>
      {
        currentImage!== null && currentImageItem && 
          <div className="image-crap__controls">
            { 
              maxZoom > 1 && 'zoom' in currentImageItem &&
                <ReactSlider 
                  className="image-crap__slider"
                  thumbClassName="image-crap__slider--thumb"
                  trackClassName="image-crap__slider--track"
                  min={100}
                  onChange={v => setZoom(v / 100)}
                  onAfterChange={v => setZoomLock(false)}
                  onBeforeChange={v => setZoomLock(true)}
                  value={currentImageItem.zoom * 100}
                  max={maxZoom * 100}
                  renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                />
            }
            <div className="image-crap__controls--buttons">
              <Button type="link" onClick={handleMoveLeft} disabled={currentImage <= 0}>Move left</Button>
              <Button type="link" onClick={handleMoveRight} disabled={currentImage >= images.length - 1}>Move right</Button>
              <Button onClick={handleRemove}>Remove</Button>
            </div>
          </div>
      }
      <div className="image-crap__gallery">
        <div className="image-crap__gallery--slider">
          <Slider
            {...slickSettings}
            //freeMode={true}
            //slidesPerView={4}
            
            //onSlideChange={() => console.log('slide change')}
            //onSwiper={(swiper) => console.log(swiper)}
          >
            {
              cropped.map((image, i) =>
                <div onClick={() => {setCurrentImage(i)}} key={i}>
                  <ImageSlide cropped={image} aspectRatio={ratio}/>
                </div>
              )
            }
          </Slider>
        </div>
        <label htmlFor="g-crap" className="image-crap__gallery--input">
          <input 
            className="hidden" 
            id="g-crap" 
            multiple 
            type="file" 
            onChange={onFileChange} 
            accept={fileAccept(true, false)}
          />
          <div className="image-crap__add" style={{minHeight: `${10 / ratio}rem`}}><Icon name="add" /></div>
        </label>
      </div>
    </div>
  )
}


export default ImageCrap