import React, { useEffect, useState } from 'react'
import { AircraftSummaryType } from 'src/generated/graphql'
import { Options } from 'src/types'
import ProductCharacteristic from '../ProductCharacteristics/ProductCharacteristics'

interface IAircraftSummary {
  aircraftSummary: AircraftSummaryType
  isBlurred?: boolean
}

const AircraftSummary: React.FC<IAircraftSummary> = React.memo(props => {
  const { aircraftSummary, isBlurred } = props
  const [options, setOptions] = useState<Options>([])

  useEffect(() => {
    if (aircraftSummary) {
      setOptions([
        { label: 'Serial Number', value: aircraftSummary?.serialNumber },
        { label: 'Registration Number', value: aircraftSummary?.registrationNumber },
        { label: 'Flight Rules', value: aircraftSummary?.flightRules?.label },
        { label: 'Flight Deck', value: aircraftSummary?.flightDeck?.label },
        { label: 'Airframe TTSN', value: aircraftSummary?.airframeTtsn },
        { label: 'Landings', value: aircraftSummary?.landings },
        { label: 'Configuration', value: aircraftSummary?.configuration?.label },
        { label: 'Landing Gear', value: aircraftSummary?.landingGear?.label },
        { label: 'Total Seats', value: aircraftSummary?.totalSeats?.toString() },
        { label: 'Crew Seats', value: aircraftSummary?.crewSeats?.toString() },
        { label: 'Passenger Seats', value: aircraftSummary?.passengerSeats?.toString() },
        { label: 'Total time', value: aircraftSummary?.totalTime?.toString() },
      ])
    }
  }, [aircraftSummary])

  return <ProductCharacteristic isBlurred={isBlurred} options={options} />
})

export default AircraftSummary
