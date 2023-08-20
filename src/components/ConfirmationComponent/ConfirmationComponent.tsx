import React, { useEffect, useState } from 'react'
import Button from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import './ConfirmationComponent.scss'

interface IConfirmationComponent {
  title: string
  name: string
  confirmed?: boolean
  disabled?: boolean
  signable?: boolean
  onConfirm: (name: string, value: boolean) => void
  onDownload?: (name: string) => void
}

const ConfirmationComponent: React.FC<IConfirmationComponent> = props => {
  const { title, name, onConfirm, onDownload, disabled = false, confirmed = false, signable = false } = props
  const [isConfirmed, setIsConfirmed] = useState<boolean>(confirmed)
  const className = `confirmation-component  ${isConfirmed ? 'confirmed' : 'unconfirmed'} ${signable ? 'signable' : 'confirmable'}`

  useEffect(() => {
    setIsConfirmed(confirmed)
  }, [confirmed])

  const handleConfirm = () => {
    if (!signable) {
      setIsConfirmed(true)
    }
    onConfirm(name, true)
  }

  const handleDownload = () => {
    onDownload(name)
  }

  return (
    <div className={className} >
      <div className="confirmation-component__header">
        <div className="confirmation-component__success"><Icon name="i-success" /></div>
        <div className="confirmation-component__title">{title}</div>
      </div>
      <div className="confirmation-component__button">
        {
          signable ?
            isConfirmed ?
              <Button btnType='submit' onClick={handleConfirm} disabled={disabled}>View</Button>
              :
              <>
                <Button type='secondary' onClick={handleDownload} disabled={disabled}>View</Button>
                <Button btnType='submit' onClick={handleConfirm} disabled={disabled}>Sign</Button>
              </>
            :
            <Button btnType='submit' onClick={handleConfirm} disabled={disabled}>Confirm</Button>
        }
      </div>
    </div>
  )
}

export default ConfirmationComponent
