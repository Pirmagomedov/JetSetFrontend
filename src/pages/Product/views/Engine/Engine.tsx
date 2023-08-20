import React, { useEffect, useState } from 'react'
import { AircraftEngineType } from 'src/generated/graphql'
import { Options } from 'src/types'
import ProductCharacteristic from '../ProductCharacteristics/ProductCharacteristics'

interface IEngine {
  engine: AircraftEngineType
}

const Engine: React.FC<IEngine> = React.memo(props => {
  const { engine } = props
  const [options, setOptions] = useState<Options>([])

  useEffect(() => {
    if (engine) {
      setOptions([
        { label: 'Engine Make', value: engine?.engineMake?.label },
        { label: 'Engine Model', value: engine?.engineModel },
        { label: 'Engine TBO', value: engine?.engineTbo },
        { label: 'Eng #1 TTSN', value: engine?.engineN1Ttsn },
        { label: 'Eng #1 TSOH', value: engine?.engineN1Tsox },
        { label: 'Eng #1 SHSI/TOP', value: engine?.engineN1ShsiTop },
        { label: 'Eng #1 TTOH', value: engine?.engineN1Ttox },
        { label: 'Eng #1 CSN', value: engine?.engineN1Csn },
        { label: 'Eng #1 CSOH', value: engine?.engineN1Csoh },
        { label: 'Eng #2 TTSN', value: engine?.engineN2Ttsn },
        { label: 'Eng #2 TSOH', value: engine?.engineN2Tsox },
        { label: 'Eng #2 SHSI/TOP', value: engine?.engineN2ShsiTop },
        { label: 'Eng #2 TTOH', value: engine?.engineN2Ttox },
        { label: 'Eng #2 CSN', value: engine?.engineN2Csn },
        { label: 'Eng #2 CSOH', value: engine?.engineN2Csoh },
        { label: 'Eng #3 TTSN', value: engine?.engineN3Ttsn },
        { label: 'Eng #3 TSOH', value: engine?.engineN3Tsox },
        { label: 'Eng #3 SHSI/TOP', value: engine?.engineN3ShsiTop },
        { label: 'Eng #3 TTOH', value: engine?.engineN3Ttox },
        { label: 'Eng #3 CSN', value: engine?.engineN3Csn },
        { label: 'Eng #3 CSOH', value: engine?.engineN3Csoh },
        { label: 'Eng #4 TTSN', value: engine?.engineN4Ttsn },
        { label: 'Eng #4 TSOH', value: engine?.engineN4Tsox },
        { label: 'Eng #4 SHSI/TOP', value: engine?.engineN4ShsiTop },
        { label: 'Eng #4 TTOH', value: engine?.engineN4Ttox },
        { label: 'Eng #4 CSN', value: engine?.engineN4Csn },
        { label: 'Eng #4 CSOH', value: engine?.engineN4Csoh },
        { label: 'Eng #1 SN', value: engine?.engineN1Sn },
        { label: 'Eng #2 SN', value: engine?.engineN2Sn },
        { label: 'Eng #3 SN', value: engine?.engineN3Sn },
        { label: 'Eng #4 SN', value: engine?.engineN4Sn },
        { label: 'ENG HP / Thrust', value: engine?.engineHpThrust },
      ])
    }
  }, [engine])

  return <ProductCharacteristic options={options} />
})

export default Engine
