import React from 'react'
import Icon from 'src/components/Icon/Icon'
import './WaitInspectionResponse.scss'

const WaitInspectionResponse: React.FC = props => {
  return (
    <div className="wait-inspection">
      <div className="wait-inspection__inner">
        <div className="wait-inspection__img">
          <Icon name="i-waiting-inspection" />
        </div>
        <div className="wait-inspection__content">
          <div className="wait-inspection__title">Inspection report</div>
          <div className="wait-inspection__text">Wait for the buyer's response</div>
        </div>
      </div>
    </div>
  )
}

export default WaitInspectionResponse
