import React, { useState } from 'react'
import FormikFile from 'src/components/FormikFile/FormikFile'
import Icon from 'src/components/Icon/Icon'
import Button from 'src/components/Button/Button'
import FileLink from 'src/components/FileLink/FileLink'
import { FileType } from 'src/generated/graphql'
import { fileAccept } from 'src/helper'
import './ProfileFileField.scss'

interface ISimpleFile {
  filename: string,
  file: any
}

interface IProfileFileField {
  title: string
  name?: string
  value: FileType
  editable?: boolean
  onSave?: (file: ISimpleFile) => void
}


const ProfileFileField: React.FC<IProfileFileField> = (props) => {
  const { title, value, name, editable = false, onSave } = props
  const [ edit, setEdit ] = useState<boolean>(false)
  const [ file, setFile ] = useState<ISimpleFile>()
  const [ updated, setUpdated ] = useState(false)

  const toggle = () => {
    if (edit) {
      setEdit(false)
      if (onSave && updated) {
        onSave(file)
      }
    } else {
      setEdit(true)
    }
  }

  const handleChange = event => {
    if (event.target.files && event.target.files[0]) {
      const img = URL.createObjectURL(event.target.files[0]);
      setFile({filename: event.target.files[0].name, file: event.target.files[0]})
      setUpdated(true)
    }
  }

  if ((value === null || !value?.links || value === undefined) && !editable) return null
  return (
    <div className="profile-field profile-field-file">
      <div className="profile-field__title">
        {title}
        {
          editable &&
            <Button type='icon' onClick={toggle}>
              <Icon name={edit ? "i-save" : "i-edit"}/>
            </Button>
        }
      </div>
      <div className="profile-field__value">
        {
          edit ? 
            <label className="btn  btn-blue " htmlFor={name}>
              {file?.filename ? file.filename : `Upload ${title}`}
              <input 
                accept={fileAccept(true, true)} 
                type="file" 
                id={name} 
                name={name} 
                onChange={handleChange}
              />
            </label>
          :
            value ?
              <FileLink file={value} filename={value.filename} />
            :
              "-"
        }
      </div>
    </div>
  )
}

export default ProfileFileField