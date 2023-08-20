import React, { useEffect, useState } from 'react'
import { AircraftExteriorCabinType } from 'src/generated/graphql'
import { Options } from 'src/types'
import ProductCharacteristic from '../ProductCharacteristics/ProductCharacteristics'

interface IExterior {
  exterior: AircraftExteriorCabinType
}

const Exterior: React.FC<IExterior> = React.memo(props => {
  const { exterior } = props
  const [options, setOptions] = useState<Options>([])

  useEffect(() => {
    if (exterior) {
      const optionList = [
        { label: 'Exterior Color', value: exterior?.exteriorColor?.label },
        { label: 'Exterior Detail', value: exterior?.exteriorDetail?.label },
        { label: 'Exterior Year', value: exterior?.exteriorYear?.label },
        { label: 'Interior Color', value: exterior?.interiorColor?.label },
        { label: 'Interior Finish', value: exterior?.interiorFinish?.label },
        { label: 'Interior Year', value: exterior?.interiorYear?.label },
        { label: 'GALLEY Location', value: exterior?.galleyLocation?.label },
        { label: 'LAV Location', value: exterior?.lavLocation?.label },
        { label: 'LAV Description', value: exterior?.lavDescription?.label },
        { label: 'WI-FI Connectivity', value: exterior?.wifiConnectivity?.label },
      ]
      if (exterior?.crewRest !== null) {
        optionList.push({ label: 'Crew Rest', value: exterior?.crewRest ? 'Yes' : 'No' })
      }
      if (exterior?.jumpSeat !== null) {
        optionList.push({ label: 'Jump Seat', value: exterior?.jumpSeat ? 'Yes' : 'No' })
      }
      setOptions(optionList)
    }
  }, [exterior])

  return <ProductCharacteristic options={options} />
})

export default Exterior
