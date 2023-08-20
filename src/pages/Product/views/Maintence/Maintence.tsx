import React, { useEffect, useState } from 'react'
import { AircraftMaintenanceType } from 'src/generated/graphql'
import { Options } from 'src/types'
import ProductCharacteristic from '../ProductCharacteristics/ProductCharacteristics'

interface IMaintence {
  maintence: AircraftMaintenanceType
}

const Maintence: React.FC<IMaintence> = React.memo(props => {
  const { maintence } = props
  const [options, setOptions] = useState<Options>([])

  useEffect(() => {
    if (maintence) {
      setOptions([
        { label: 'MTX Tracking', value: maintence?.mtxTracking?.label },
        { label: 'Airframe Program', value: maintence?.airframeProgram?.label },
        { label: 'Engine Program', value: maintence?.engineProgram?.label },
        { label: 'APU Program', value: maintence?.apuProgram?.label },
        { label: 'Avionics Program', value: maintence?.avionicsProgram?.label },
        { label: 'MTX Condition', value: maintence?.mtxCondition?.label },
        { label: 'Annual Due', value: maintence?.annualDue?.label },
        { label: 'C Check Due', value: maintence?.cCheckDue?.label },
        { label: 'L/Gear OH Due', value: maintence?.lGearOhDue?.label },
        { label: 'Inspection Status', value: maintence?.inspectionStatus?.label },
        { label: 'Last Performed', value: maintence?.lastPerformed },
        { label: 'Next Due', value: maintence?.nextDue },
        { label: 'Warranty AF Yr', value: maintence?.warrantyAfYr?.label },
        { label: 'Warranty AF Hrs', value: maintence?.warrantyAfHrs },
        { label: 'Warranty ENG Yr', value: maintence?.warrantyEngYr?.label },
        { label: 'Warranty ENG Hrs', value: maintence?.warrantyEngHrs },
        { label: 'Warranty AVI Yr', value: maintence?.warrantyAviYr?.label },
        { label: 'Warranty APU Yr', value: maintence?.warrantyApuYr?.label },
        { label: 'Warranty PROP Yr', value: maintence?.warrantyPropYr?.label },
        { label: 'Warranty PROP Hrs', value: maintence?.warrantyPropHrs },
      ])
    }
  }, [maintence])

  return <ProductCharacteristic options={options} />
})

export default Maintence
