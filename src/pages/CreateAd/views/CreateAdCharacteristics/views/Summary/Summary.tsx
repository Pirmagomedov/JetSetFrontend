import React, { useEffect, useState } from 'react'
import Accordion from 'src/components/Accordion/Accordion'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import { Ad, AircraftSummaryInputType, Choices } from 'src/generated/graphql'
import { IValues } from '../../types'

interface ISummaryProps {
  currentAd: Ad
  choices: Choices
  values: IValues
  onChange: (values: AircraftSummaryInputType) => void
  onInitialValues: (values: IValues | ((prev: IValues) => IValues)) => void
}

const Summary: React.FC<ISummaryProps> = React.memo(props => {
  const { currentAd, choices, values, onChange, onInitialValues } = props
  const [isLoading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (choices) {
      setLoading(false)
    }
  }, [choices])

  useEffect(() => {
    onChange({
      serialNumber: values.serialNumber,
      registrationNumber: values.registrationNumber,
      flightRules: values.flightRules ? +values.flightRules : null,
      flightDeck: values.flightDeck ? +values.flightDeck : null,
      airframeTtsn: +values.airframeTtsn,
      landings: values.landings ? values.landings : null,
      configuration: values.configuration ? +values.configuration : null,
      landingGear: values.landingGear ? +values.landingGear : null,
      totalSeats: +values.totalSeats,
      crewSeats: +values.crewSeats ? +values.crewSeats : null,
      passengerSeats: +values.passengerSeats,
      //totalTime: +values.totalTime,
    })
  }, [values])

  useEffect(() => {
    if (currentAd?.aircraftSummary) {
      const {
        airframeTtsn,
        landings,
        registrationNumber,
        serialNumber,
        configuration,
        flightDeck,
        flightRules,
        landingGear,
        crewSeats,
        passengerSeats,
        totalSeats,
        //totalTime,
      } = currentAd.aircraftSummary

      onInitialValues(prev => ({
        ...prev,
        registrationNumber: registrationNumber ? registrationNumber : '',
        landings: landings ? landings : '',
        serialNumber: serialNumber ? serialNumber : '',
        airframeTtsn: airframeTtsn ? +airframeTtsn : null,
        flightRules: flightRules ? flightRules.value.toString() : '',
        flightDeck: flightDeck ? flightDeck.value.toString() : '',
        configuration: configuration ? configuration.value.toString() : '',
        landingGear: landingGear ? landingGear.value.toString() : '',
        totalSeats: totalSeats ? totalSeats.toString() : '',
        crewSeats: crewSeats ? crewSeats.toString() : '',
        passengerSeats: passengerSeats.toString(),
        //totalTime: totalTime ? totalTime.toString() : '',
      }))
    }
  }, [currentAd])

  return (
    <Accordion initialState={true}>
      <div className="accordion__header">
        <div className="accordion__title">Aircraft Summary</div>
        <div className="accordion__arrow"></div>
      </div>
      <div className="accordion__body">
        <div className="accordion__items" title="Aircraft Serial Number">
          <div className="accordion__item">
            <FormikField name="serialNumber" label="Serial Number" required placeholder="Enter Serial number" />
          </div>
          <div className="accordion__item" title="Aircraft Registration number">
            <FormikField name="registrationNumber" label="Registration Number" required placeholder="Enter Registration" />
          </div>
          <div className="accordion__item" title="Airframe Total Time Since New">
            <FormikField name="airframeTtsn" label="Airframe TTSN" required placeholder="Enter Airframe TTSN" />
          </div>

          <div className="accordion__item" title="Aircraft Landing">
            <FormikField name="landings" label="Landings" required placeholder="Enter Landings" />
          </div>
          <div className="accordion__item" title="Aircraft Total Seats">
            <FormikField name="totalSeats" label="Total Seats" required placeholder="Enter Total Seats" />
          </div>
          <div className="accordion__item" title="Aircraft Passenger Seats">
            <FormikField name="passengerSeats" label="Passenger Seats" required placeholder="Enter Passenger Seats" />
          </div>
          <div className="accordion__item" title="Aircraft Crew Seats">
            <FormikField name="crewSeats" label="Crew Seats" placeholder="Enter Crew Seats" />
          </div>
          <div className="accordion__item" title="Aircraft Flight Rules">
            <FormikSelect
              className="select"
              name="flightRules"
              options={choices?.flightRules}
              label="Flight Rules"
              placeholder="Select flight rules"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Aircraft Flight Deck">
            <FormikSelect
              className="select"
              name="flightDeck"
              options={choices?.flightDecks}
              label="Flight Deck"
              placeholder="Select Flight Deck"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Aircraft Configuration">
            <FormikSelect
              className="select"
              name="configuration"
              options={choices?.aircraftConfigurations}
              label="Configuration"
              placeholder="Select Configuration"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Aircraft Landing Gear">
            <FormikSelect
              className="select"
              name="landingGear"
              options={choices?.landingGears}
              label="Landing Gear"
              placeholder="Select Landing Gear"
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </Accordion>
  )
})

export default Summary
