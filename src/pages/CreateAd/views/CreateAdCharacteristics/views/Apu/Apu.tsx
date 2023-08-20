import React, { useEffect } from 'react'
import Accordion from 'src/components/Accordion/Accordion'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import { Ad, AircraftApuInput, Choices } from 'src/generated/graphql'
import { IValues } from '../../types'

interface IApu {
  currentAd: Ad
  choices: Choices
  values: IValues
  onChange: (values: AircraftApuInput) => void
  onInitialValues: (values: IValues | ((prev: IValues) => IValues)) => void
}

const Apu: React.FC<IApu> = React.memo(props => {
  const { currentAd, choices, values, onChange, onInitialValues } = props

  useEffect(() => {
    onChange({
      apuMake: values.apuMake,
      apuModel: values.apuModel,
      apuTbo: values.apuTbo,
      apuTtsn: values.apuTtsn,
      apuTsoh: values.apuTsoh,
      apuCsn: values.apuCsn,
      apuCsoh: values.apuCsoh,
      apuSn: values.apuSn,
    })
  }, [values])

  useEffect(() => {
    if (currentAd?.apu) {
      const { apuMake, apuModel, apuTbo, apuTtsn, apuTsoh, apuCsn, apuCsoh, apuSn } = currentAd.apu

      onInitialValues(prev => ({
        ...prev,
        apuMake: apuMake ? apuMake.value.toString() : '',
        apuModel: apuModel ? apuModel : '',
        apuTbo: apuTbo ? apuTbo : '',
        apuTtsn: apuTtsn ? apuTtsn : '',
        apuTsoh: apuTsoh ? apuTsoh : '',
        apuCsn: apuCsn ? apuCsn : '',
        apuCsoh: apuCsoh ? apuCsoh : '',
        apuSn: apuSn ? apuSn : '',
      }))
    }
  }, [currentAd])

  return (
    <Accordion>
      <div className="accordion__header">
        <div className="accordion__title">APU</div>
        <div className="accordion__arrow"></div>
      </div>
      <div className="accordion__body">
        <div className="accordion__items">
          <div className="accordion__item" title="Auxiliary Power Unit Make">
            <FormikSelect
              className="select select-white"
              name="apuMake"
              options={choices?.apuMake}
              label="APU Make"
              placeholder="Select APU Make"
            />
          </div>
          <div className="accordion__item" title="Auxiliary Power Unit Model">
            <FormikField name="apuModel" label="APU Model" placeholder="Enter APU Model" />
          </div>
          <div className="accordion__item" title="Auxiliary Power Unit Serial Number">
            <FormikField name="apuSn" label="APU SN" placeholder="Enter APU SN" />
          </div>
          <div className="accordion__item" title="Auxiliary Power Unit Time Between Overhauls">
            <FormikField name="apuTbo" label="APU TBO" placeholder="Enter APU TBO" />
          </div>
          <div className="accordion__item" title="Auxiliary Power Unit Total Time Since New">
            <FormikField name="apuTtsn" label="APU TTSN" placeholder="Enter APU TTSN" />
          </div>
          <div className="accordion__item" title="Auxiliary Power Unit Time Since Overhaul">
            <FormikField name="apuTsoh" label="APU TSOH" placeholder="Enter APU TSOH" />
          </div>
          <div className="accordion__item" title="Auxiliary Power Unit Cycles Since New">
            <FormikField name="apuCsn" label="APU CSN" placeholder="Enter APU CSN" />
          </div>
          <div className="accordion__item" title="Auxiliary Power Unit Cycles Since Overhaul">
            <FormikField name="apuCsoh" label="APU CSOH" placeholder="Enter APU CSOH" />
          </div>
        </div>
      </div>
    </Accordion>
  )
})

export default Apu
