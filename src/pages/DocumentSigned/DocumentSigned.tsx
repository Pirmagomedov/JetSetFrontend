import React, { useState, useEffect } from 'react'
import Icon from 'src/components/Icon/Icon'
import './DocumentSigned.scss'

const DocumentSigned: React.FC = React.memo(props => {
  const [state, setState] = useState<boolean>(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setState(true)
    }, 6000)
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className={`document-signed ${state ? 'take-action' : 'give-a-chance'}`}>
      <Icon name="check" />
      <div className="document-signed__message">Congratulations, the document has been signed. <br />Please, click Next</div>
    </div>
  )
})

export default DocumentSigned