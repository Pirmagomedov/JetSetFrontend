import React, { useState } from 'react'
import FormikField from 'src/components/FormikField/FormikField'
import Icon from 'src/components/Icon/Icon'
import Button from 'src/components/Button/Button'


interface IProfileField {
  title: string
  name?: string
  value: string | number | null
  editable?: boolean
  onSave?: (e?: any) => void
}


const ProfileField: React.FC<IProfileField> = (props) => {
  const { title, value, name, editable = false, onSave } = props
  const [edit, setEdit] = useState<boolean>(false)

  const toggle = () => {
    if (edit) {
      setEdit(false)
      if (onSave) onSave()
    } else {
      setEdit(true)
    }
  }

  if ((value === null || value == '' || value === undefined) && !editable) return null
  return (
    <div className="profile-field">
      <div className="profile-field__title">
        {title}
        {
          editable &&
          <Button type='icon' onClick={toggle}>
            <Icon name={edit ? "i-save" : "i-edit"} />
          </Button>
        }
      </div>
      <div className="profile-field__value">
        {
          edit ?
            <FormikField name={name} value={String(value)} callback={toggle} />
            :
            value
        }
      </div>
    </div>
  )
}

export default ProfileField