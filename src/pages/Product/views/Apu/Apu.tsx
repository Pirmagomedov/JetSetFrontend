import React, { useEffect, useState } from 'react'
import { AircraftApuType } from 'src/generated/graphql'
import { Options } from 'src/types'
import ProductCharacteristic from '../ProductCharacteristics/ProductCharacteristics'

interface IApu {
  apu: AircraftApuType
}

const Apu: React.FC<IApu> = React.memo(props => {
  const { apu } = props
  const [options, setOptions] = useState<Options>([])

  useEffect(() => {
    if (apu) {
      setOptions([
        { label: 'APU Make', value: apu?.apuMake?.label },
        { label: 'APU Model', value: apu?.apuModel },
        { label: 'APU TBO', value: apu?.apuTbo },
        { label: 'APU TTSN', value: apu?.apuTtsn },
        { label: 'APU TSOH', value: apu?.apuTsoh },
        { label: 'APU CSN', value: apu?.apuCsn },
        { label: 'APU CSOH', value: apu?.apuCsoh },
        { label: 'APU SN', value: apu?.apuSn },
      ])
    }
  }, [apu])

  return <ProductCharacteristic options={options} />
})

export default Apu
