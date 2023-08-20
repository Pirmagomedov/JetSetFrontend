import React, { useEffect, useState } from 'react'
import Accordion from 'src/components/Accordion/Accordion'
import FormikRadio from 'src/components/FormikRadio/FormikRadio'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import { Ad, AircraftExteriorCabinFormInput, Choices } from 'src/generated/graphql'
import { IValues } from '../../types'

interface IExterior {
  currentAd: Ad
  choices: Choices
  values: IValues
  onChange: (values: AircraftExteriorCabinFormInput) => void
  onInitialValues: (values: IValues | ((prev: IValues) => IValues)) => void
}

const Exterior: React.FC<IExterior> = React.memo(props => {
  const { currentAd, choices, values, onChange, onInitialValues } = props
  const [isLoading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (choices) {
      setLoading(false)
    }
  }, [choices])

  useEffect(() => {
    onChange({
      exteriorColor: values.exteriorColor,
      exteriorDetail: values.exteriorDetail,
      exteriorYear: values.exteriorYear,
      interiorColor: values.interiorColor,
      interiorFinish: values.interiorFinish,
      interiorYear: values.interiorYear,
      galleyLocation: values.galleyLocation,
      lavLocation: values.lavLocation,
      lavDescription: values.lavDescription,
      crewRest: values.crewRest,
      jumpSeat: values.jumpSeat,
      wifiConnectivity: values.wifiConnectivity,
    })
  }, [values])

  useEffect(() => {
    if (currentAd?.exteriorCabin) {
      const {
        exteriorColor,
        exteriorDetail,
        exteriorYear,
        interiorColor,
        interiorFinish,
        interiorYear,
        galleyLocation,
        lavLocation,
        lavDescription,
        crewRest,
        jumpSeat,
        wifiConnectivity,
      } = currentAd.exteriorCabin

      onInitialValues(prev => ({
        ...prev,
        exteriorColor: exteriorColor ? exteriorColor.value.toString() : '',
        exteriorDetail: exteriorDetail ? exteriorDetail.value.toString() : '',
        exteriorYear: exteriorYear ? exteriorYear.value.toString() : '',
        interiorColor: interiorColor ? interiorColor.value.toString() : '',
        interiorFinish: interiorFinish ? interiorFinish.value.toString() : '',
        interiorYear: interiorYear ? interiorYear.value.toString() : '',
        galleyLocation: galleyLocation ? galleyLocation.value.toString() : '',
        lavLocation: lavLocation ? lavLocation.value.toString() : '',
        lavDescription: lavDescription ? lavDescription.value.toString() : '',
        crewRest: crewRest ? crewRest : null,
        jumpSeat: jumpSeat ? jumpSeat : null,
        wifiConnectivity: wifiConnectivity ? wifiConnectivity.value.toString() : '',
      }))
    }
  }, [currentAd])

  return (
    <Accordion>
      <div className="accordion__header">
        <div className="accordion__title">Exterior/Cabin</div>
        <div className="accordion__arrow"></div>
      </div>
      <div className="accordion__body">
        <div className="accordion__items" title="Exterior Color">
          <div className="accordion__item">
            <FormikSelect
              className="select select-white"
              name="exteriorColor"
              options={choices?.exteriorColor}
              label="Exterior Color"
              placeholder="Select Exterior Color"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Exterior Detail">
            <FormikSelect
              className="select select-white"
              name="exteriorDetail"
              options={choices?.exteriorDetail}
              label="Exterior Detail"
              placeholder="Select Exterior Detail"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Exterior Year">
            <FormikSelect
              className="select select-white"
              name="exteriorYear"
              options={choices?.exteriorYear}
              label="Exterior Year"
              placeholder="Select Exterior Year"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Interior Color">
            <FormikSelect
              className="select select-white"
              name="interiorColor"
              options={choices?.interiorColor}
              label="Interior Color"
              placeholder="Select Interior Color"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Interior Finish">
            <FormikSelect
              className="select select-white"
              name="interiorFinish"
              options={choices?.interiorFinish}
              label="Interior Finish"
              placeholder="Select Interior Finish"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Interior Year">
            <FormikSelect
              className="select select-white"
              name="interiorYear"
              options={choices?.interiorYear}
              label="Interior Year"
              placeholder="Select Interior Year"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="GALLEY Location">
            <FormikSelect
              className="select select-white"
              name="galleyLocation"
              options={choices?.galleyLocation}
              label="GALLEY Location"
              placeholder="Select GALLEY Location"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Lavatory Location">
            <FormikSelect
              className="select select-white"
              name="lavLocation"
              options={choices?.lavLocation}
              label="LAV Location"
              placeholder="Select LAV Location"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Lavatory Description">
            <FormikSelect
              className="select select-white"
              name="lavDescription"
              options={choices?.lavDescription}
              label="LAV Description"
              placeholder="Select LAV Description"
              isLoading={isLoading}
            />
          </div>
          <div className="accordion__item" title="Crew Rest">
            <div className="accordion__label">Crew Rest</div>
            <div className="accordion__radios">
              <FormikRadio name="crewRest" label="Yes" value={true} />
              <FormikRadio name="crewRest" label="No" value={false} />
            </div>
          </div>
          <div className="accordion__item" title="Jump Seat">
            <div className="accordion__label">Jump Seat</div>
            <div className="accordion__radios">
              <FormikRadio name="jumpSeat" label="Yes" value={true} />
              <FormikRadio name="jumpSeat" label="No" value={false} />
            </div>
          </div>
          <div className="accordion__item" title="WI-FI Connectivity">
            <FormikSelect
              className="select select-white"
              name="wifiConnectivity"
              options={choices?.wifiConnectivity}
              label="WI-FI Connectivity"
              placeholder="Select WI-FI Connectivity"
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </Accordion>
  )
})

export default Exterior
