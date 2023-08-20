import React, { useEffect } from 'react'
import Accordion from 'src/components/Accordion/Accordion'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import { Ad, AircraftWeightsOtherFormInput, Choices } from 'src/generated/graphql'
import { IValues } from '../../types'

interface IWeights {
  currentAd: Ad
  choices: Choices
  values: IValues
  onChange: (values: AircraftWeightsOtherFormInput) => void
  onInitialValues: (values: IValues | ((prev: IValues) => IValues)) => void
}

const Weights: React.FC<IWeights> = React.memo(props => {
  const { currentAd, choices, values, onChange, onInitialValues } = props

  useEffect(() => {
    onChange({
      maxRamp: values.maxRamp,
      mtow: values.mtow,
      mlv: values.mlv,
      mzvf: values.mzvf,
      bew: values.bew,
      bow: values.bow,
      fuelCapacity: values.fuelCapacity,
      payload: values.payload,
      usefulLoad: values.usefulLoad,
      floatModel: values.floatModel,
      bewFloats: values.bewFloats,
      usefulLoadFloats: values.usefulLoadFloats,
      oxygenTank: values.oxygenTank,
      fuelCapacityGal: values.fuelCapacityGal,
    })
  }, [values])

  useEffect(() => {
    if (currentAd?.weightsOther) {
      const {
        maxRamp,
        mtow,
        mlv,
        mzvf,
        bew,
        bow,
        fuelCapacity,
        payload,
        usefulLoad,
        floatModel,
        bewFloats,
        usefulLoadFloats,
        oxygenTank,
        fuelCapacityGal,
      } = currentAd.weightsOther

      onInitialValues(prev => ({
        ...prev,
        maxRamp: maxRamp ? maxRamp : '',
        mtow: mtow ? mtow : '',
        mlv: mlv ? mlv : '',
        mzvf: mzvf ? mzvf : '',
        bew: bew ? bew : '',
        bow: bow ? bow : '',
        fuelCapacity: fuelCapacity ? fuelCapacity : '',
        payload: payload ? payload : '',
        usefulLoad: usefulLoad ? usefulLoad : '',
        floatModel: floatModel ? floatModel.value.toString() : '',
        bewFloats: bewFloats ? bewFloats : '',
        usefulLoadFloats: usefulLoadFloats ? usefulLoadFloats : '',
        oxygenTank: oxygenTank ? oxygenTank : '',
        fuelCapacityGal: fuelCapacityGal ? fuelCapacityGal : '',
      }))
    }
  }, [currentAd])

  return (
    <Accordion>
      <div className="accordion__header">
        <div className="accordion__title">Weights/other</div>
        <div className="accordion__arrow"></div>
      </div>
      <div className="accordion__body">
        <div className="accordion__items" title="Max Ramp (lbs)">
          <div className="accordion__item">
            <FormikField name="maxRamp" label="Max Ramp (lbs)" placeholder="Enter Max Ramp (lbs)" />
          </div>
          <div className="accordion__item" title="Maximum Takeoff Weight (lbs)">
            <FormikField name="mtow" label="MTOW (lbs)" placeholder="Enter MTOW (lbs)" />
          </div>
          <div className="accordion__item" title="Maximum Landing Weight (lbs)">
            <FormikField name="mlv" label="MLW (lbs)" placeholder="Enter MLW (lbs)" />
          </div>
          <div className="accordion__item" title="Maximum Zero Fuel Weight (lbs)">
            <FormikField name="mzvf" label="MZFW (lbs)" placeholder="Enter MZFW (lbs)" />
          </div>
          <div className="accordion__item" title="Basic Empty Weight (lbs)">
            <FormikField name="bew" label="BEW (lbs)" placeholder="Enter BEW (lbs)" />
          </div>
          <div className="accordion__item" title="Basic Operating Weight (lbs)">
            <FormikField name="bow" label="BOW (lbs)" placeholder="Enter BOW (lbs)" />
          </div>
          <div className="accordion__item" title="Fuel Capacity (lbs)">
            <FormikField name="fuelCapacity" label="Fuel Capacity (lbs)" placeholder="Enter Fuel Capacity (lbs)" />
          </div>
          <div className="accordion__item" title="Payload (lbs)">
            <FormikField name="payload" label="Payload (lbs)" placeholder="Enter Payload (lbs)" />
          </div>
          <div className="accordion__item" title="Useful Load (lbs)">
            <FormikField name="usefulLoad" label="Useful Load (lbs)" placeholder="Enter Useful Load (lbs)" />
          </div>
          <div className="accordion__item" title="Float Model">
            <FormikSelect
              className="select select-white"
              name="floatModel"
              options={choices?.floatModel}
              label="Float Model"
              placeholder="Select Float Model"
            />
          </div>
          <div className="accordion__item" title="Basic Empty Weight (lbs)">
            <FormikField name="bewFloats" label="BEW Floats (lbs)" placeholder="Enter BEW Floats (lbs)" />
          </div>
          <div className="accordion__item" title="Useful Load Floats">
            <FormikField name="usefulLoadFloats" label="Useful Load Floats" placeholder="Enter Useful Load Floats" />
          </div>
          <div className="accordion__item" title="Oxygen Tank (cu.ft)">
            <FormikField name="oxygenTank" label="Oxygen Tank (cu.ft)" placeholder="Enter Oxygen Tank (cu.ft)" />
          </div>
          <div className="accordion__item" title="Fuel Capacity (gal)">
            <FormikField name="fuelCapacityGal" label="Fuel Capacity (gal)" placeholder="Enter Fuel Capacity (gal)" />
          </div>
        </div>
      </div>
    </Accordion>
  )
})

export default Weights
