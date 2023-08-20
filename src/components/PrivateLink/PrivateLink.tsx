import React, { useState } from 'react'
import Icon from 'src/components/Icon/Icon'
import LoaderView from 'src/components/LoaderView/LoaderView'
import { RootState } from 'src/store'
import { useSelector } from 'react-redux'
import { useDownloadLink } from 'src/hooks'
import './PrivateLink.scss'

interface IPrivateLink {
  fileKey: string 
  fileBucket: string
  className?: string
  fileName: string
  icon?:boolean
  children?: JSX.Element[] | JSX.Element | string
}

const PrivateLink: React.FC<IPrivateLink> = (props) => {
  const { fileKey, fileBucket, children, className, fileName, icon } = props
  const { downloading, download } = useDownloadLink(fileKey, fileBucket, fileName)
  
  const handleDownload = (event) => {
    event.preventDefault()
    download()
  }

  return (
    <a href="#" className={`private-link ${className}`} onClick={handleDownload}>
      {
        downloading ? 
          <LoaderView ring />
        :
          <>
          {
            icon &&
              <span className="document-link__icon">
                <Icon name="i-download" />
              </span>
          }
          </>
      }
      <span className="private-link__content">{children}</span>
    </a>
  )
}

export default PrivateLink
