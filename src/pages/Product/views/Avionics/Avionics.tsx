import React, { useEffect, useState } from 'react'
import { AircraftAvionicsType } from 'src/generated/graphql'
import { Options } from 'src/types'
import ProductCharacteristic from '../ProductCharacteristics/ProductCharacteristics'

interface IAvionics {
  avionics: AircraftAvionicsType
}

const Avionics: React.FC<IAvionics> = React.memo(props => {
  const { avionics } = props
  const [options, setOptions] = useState<Options>([])

  useEffect(() => {
    if (avionics) {
      setOptions([
        { label: 'FMS #', value: avionics?.fmsN?.label },
        { label: 'FMS', value: avionics?.fms?.label },
        { label: 'Eng Monitor', value: avionics?.engMonitor?.label },
        { label: 'GPS #', value: avionics?.gpsN?.label },
        { label: 'GPS Model', value: avionics?.gpsModel1?.label },
        { label: 'GPS Model #2', value: avionics?.gpsModel2?.label },
        { label: 'Autopilot #', value: avionics?.autopilotN?.label },
        { label: 'Autopilot', value: avionics?.autopilot?.label },
        { label: 'WX Radar', value: avionics?.wxRadar?.label },
        { label: 'Transponder #', value: avionics?.transponderN?.label },
        { label: 'Transponder', value: avionics?.transponder1?.label },
        { label: 'Transponder #2', value: avionics?.transponder2?.label },
        { label: 'VHF Com #', value: avionics?.vhfComN?.label },
        { label: 'VHF Com Model', value: avionics?.vhfComModel1?.label },
        { label: 'VHF Com Model #2', value: avionics?.vhfComModel2?.label },
        { label: 'VHF Nav #', value: avionics?.vhfNavN?.label },
        { label: 'VHF Nav Model', value: avionics?.vhfNavModel1?.label },
        { label: 'VHF Nav Model #2', value: avionics?.vhfNavModel2?.label },
      ])
    }
  }, [avionics])

  return <ProductCharacteristic options={options} />
})

export default Avionics
