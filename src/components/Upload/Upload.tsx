import React, { useEffect, useRef } from 'react'
import { useField } from 'formik'
import { fileToBase64 } from 'src/helper'
import Icon from 'src/components/Icon/Icon'
import PrivateLink from 'src/components/PrivateLink/PrivateLink'
import { fileAccept } from 'src/helper'
import './Upload.scss'

interface IUpload {
    name: string
    text?: string
    className?: string
    theme?: string
    isOneFile?: boolean
    disabled?: boolean
    onChange?: (event: any) => void
}

const MAX_MEMORY_SIZE = 2500000

const Upload: React.FC<IUpload> = React.memo((props) => {
    const {
        text,
        className,
        theme,
        isOneFile,
        name,
        disabled = false,
        onChange,
    } = props
    const [field, meta, helpers] = useField(props)
    const files = field.value || []
    const inputRef = useRef<HTMLInputElement>()

    // const buttonName = text ? text : 'Load document'
    const buttonName = 'Load document'
    const themeName = theme ? theme : ''
    const isOne = isOneFile && files?.length === 1

    const removeDocument = (id: number) => {
        helpers.setValue(files.filter((el, index) => index !== id))
        if (inputRef?.current?.value) {
          inputRef.current.value = null
        }
        
    }

    const addDocument = (file: File) => {
        fileToBase64(file).then((res) => {
          console.log('addDocument', res)
            helpers.setValue([
                ...files,
                {
                    file: res,
                    filename: file.name,
                },
            ])
            if (onChange) {
              onChange(event)
            }
        })
    }

    const updateDocument = (event, id: number) => {
        const file: File = event.target.files[0]
        fileToBase64(file).then((res) => {
            helpers.setValue(
                files.map((el, index) =>
                    index === id ? { file: res, filename: file.name } : el,
                ),
            )
            if (onChange) {
              onChange(event)
            }
        })
    }


  return (
    <div className={`upload ${themeName}`} data-name={name}>
      <div className="upload__items">
        {files?.length
          ? files.map((file, index) => {
              return (
                <div className="upload__item" key={index}>
                  <PrivateLink fileName={file.filename} fileKey={file.keySigned ? file.keySigned : file.key} fileBucket={file.bucket}>
                    {file.filename}
                  </PrivateLink>
                  <div className="upload__name"></div>
                  <div className="upload__actions">
                    <label className="upload__reload">
                      <input accept={fileAccept(true, true)} type="file" onChange={event => updateDocument(event, index)} />
                      <Icon name="i-reload" width={16} height={16} />
                    </label>
                    <button className="upload__delete" onClick={(e) => {e.preventDefault();removeDocument(index)}} >
                      <Icon name="i-trash" width={16} height={16} />
                    </button>
                  </div>
                </div>
              )
            })
          : null}
      </div>
      {isOne ? null : (
        <label className={`upload__load ${className ? `btn ${className}` : 'btn btn-blue'} ${files?.length && 'upload__load--link'}`}>
          <input ref={inputRef} type="file" accept={fileAccept(true, true)} className="upload__load-input" onChange={event => addDocument(event.target.files[0])} disabled={disabled}/>
          <span className="upload__load-text">{files?.length ? 'Load more files' : buttonName}</span>
        </label>
      )}
      {meta.touched && meta.error ? <div className="field__error">{meta.error}</div> : null}
    </div>
  )
})

export default Upload
