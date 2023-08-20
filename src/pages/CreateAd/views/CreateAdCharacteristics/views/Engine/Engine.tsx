import React, { useEffect, useState } from 'react'
import Accordion from 'src/components/Accordion/Accordion'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import Icon from 'src/components/Icon/Icon'
import { Ad, AircraftEngineFormInput, Choices, useFeeByAmount } from 'src/generated/graphql'
import { IValues } from '../../types'

interface IEngine {
  currentAd: Ad
  choices: Choices
  values: IValues
  onChange: (values: AircraftEngineFormInput) => void
  onInitialValues: (values: IValues | ((prev: IValues) => IValues)) => void
}

interface IExactEngine {
  i: number
}

const ExactEngine: React.FC<IExactEngine> = (props) => {
  const { i } = props

  return (
    <div className={`accordion__item-choices`}>
      <div className="accordion__item" title="Engine Serial Number">
        <FormikField name={`engineN${i}Sn`} required label={`Eng #${i} SN`} placeholder={`Enter Eng #${i} SN`} />
      </div>
      <div className="accordion__item" title="Engine Total Time Since New">
        <FormikField name={`engineN${i}Ttsn`} label={`Eng #${i} TTSN`} placeholder={`Enter Eng #${i} TTSN`} />
      </div>
      <div className="accordion__item" title="Engine Time Since Overhaul">
        <FormikField name={`engineN${i}Tsox`} label={`Eng #${i} TSOH`} placeholder={`Enter Eng #${i} TSOH`} />
      </div>
      <div className="accordion__item" title="Engine Since Hot Section Inspection (Turbine engine reference)">
        <FormikField name={`engineN${i}ShsiTop`} label={`Eng #${i} SHSI/TOP`} placeholder={`Enter Eng #${i} SHSI/TOP`} />
      </div>
      <div className="accordion__item" title="Engine Time Till Overhaul">
        <FormikField name={`engineN${i}Ttox`} label={`Eng #${i} TTOH`} placeholder={`Enter Eng #${i} TTOH`} />
      </div>
      <div className="accordion__item" title="Engine Cycles Since New">
        <FormikField name={`engineN${i}Csn`} label={`Eng #${i} CSN`} placeholder={`Enter Eng #${i} CSN`} />
      </div>
      <div className="accordion__item" title="Engine Cycles Since Overhaul">
        <FormikField name={`engineN${i}Csoh`} label={`Eng #${i} CSOH`} placeholder={`Enter Eng #${i} CSOH`} />
      </div>
    </div>
  )
}

const Engine: React.FC<IEngine> = React.memo(props => {
  const { currentAd, choices, values, onChange, onInitialValues } = props
  const [enginesAmount, setEnginesAmount] = useState<number>(1)
  const [isLoading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (choices) {
      setLoading(false)
    }
  }, [choices])

  useEffect(() => {
    onChange({
      engineMake: values.engineMake,
      engineModel: values.engineModel,
      engineTbo: values.engineTbo,
      engineN1Ttsn: values.engineN1Ttsn,
      engineN1Tsox: values.engineN1Tsox,
      engineN1ShsiTop: values.engineN1ShsiTop,
      engineN1Ttox: values.engineN1Ttox,
      engineN1Csn: values.engineN1Csn,
      engineN1Csoh: values.engineN1Csoh,
      engineN2Ttsn: values.engineN2Ttsn,
      engineN2Tsox: values.engineN2Tsox,
      engineN2ShsiTop: values.engineN2ShsiTop,
      engineN2Ttox: values.engineN2Ttox,
      engineN2Csn: values.engineN2Csn,
      engineN2Csoh: values.engineN2Csoh,
      engineN3Ttsn: values.engineN3Ttsn,
      engineN3Tsox: values.engineN3Tsox,
      engineN3ShsiTop: values.engineN3ShsiTop,
      engineN3Ttox: values.engineN3Ttox,
      engineN3Csn: values.engineN3Csn,
      engineN3Csoh: values.engineN3Csoh,
      engineN4Ttsn: values.engineN4Ttsn,
      engineN4Tsox: values.engineN4Tsox,
      engineN4ShsiTop: values.engineN4ShsiTop,
      engineN4Ttox: values.engineN4Ttox,
      engineN4Csn: values.engineN4Csn,
      engineN4Csoh: values.engineN4Csoh,
      engineN1Sn: values.engineN1Sn,
      engineN2Sn: values.engineN2Sn,
      engineN3Sn: values.engineN3Sn,
      engineN4Sn: values.engineN4Sn,
      engineHpThrust: values.engineHpThrust,
    })
  }, [values])

  useEffect(() => {
    if (currentAd?.engine) {
      const {
        engineMake,
        engineModel,
        engineTbo,
        engineN1Ttsn,
        engineN1Tsox,
        engineN1ShsiTop,
        engineN1Ttox,
        engineN1Csn,
        engineN1Csoh,
        engineN2Ttsn,
        engineN2Tsox,
        engineN2ShsiTop,
        engineN2Ttox,
        engineN2Csn,
        engineN2Csoh,
        engineN3Ttsn,
        engineN3Tsox,
        engineN3ShsiTop,
        engineN3Ttox,
        engineN3Csn,
        engineN3Csoh,
        engineN4Ttsn,
        engineN4Tsox,
        engineN4ShsiTop,
        engineN4Ttox,
        engineN4Csn,
        engineN4Csoh,
        engineN1Sn,
        engineN2Sn,
        engineN3Sn,
        engineN4Sn,
        engineHpThrust,
      } = currentAd.engine

      onInitialValues(prev => ({
        ...prev,
        engineMake: engineMake ? engineMake.value.toString() : '',
        engineModel: engineModel ? engineModel : '',
        engineTbo: engineTbo ? engineTbo : '',
        engineN1Ttsn: engineN1Ttsn ? engineN1Ttsn : '',
        engineN1Tsox: engineN1Tsox ? engineN1Tsox : '',
        engineN1ShsiTop: engineN1ShsiTop ? engineN1ShsiTop : '',
        engineN1Ttox: engineN1Ttox ? engineN1Ttox : '',
        engineN1Csn: engineN1Csn ? engineN1Csn : '',
        engineN1Csoh: engineN1Csoh ? engineN1Csoh : '',
        engineN2Ttsn: engineN2Ttsn ? engineN2Ttsn : '',
        engineN2Tsox: engineN2Tsox ? engineN2Tsox : '',
        engineN2ShsiTop: engineN2ShsiTop ? engineN2ShsiTop : '',
        engineN2Ttox: engineN2Ttox ? engineN2Ttox : '',
        engineN2Csn: engineN2Csn ? engineN2Csn : '',
        engineN2Csoh: engineN2Csoh ? engineN2Csoh : '',
        engineN3Ttsn: engineN3Ttsn ? engineN3Ttsn : '',
        engineN3Tsox: engineN3Tsox ? engineN3Tsox : '',
        engineN3ShsiTop: engineN3ShsiTop ? engineN3ShsiTop : '',
        engineN3Ttox: engineN3Ttox ? engineN3Ttox : '',
        engineN3Csn: engineN3Csn ? engineN3Csn : '',
        engineN3Csoh: engineN3Csoh ? engineN3Csoh : '',
        engineN4Ttsn: engineN4Ttsn ? engineN4Ttsn : '',
        engineN4Tsox: engineN4Tsox ? engineN4Tsox : '',
        engineN4ShsiTop: engineN4ShsiTop ? engineN4ShsiTop : '',
        engineN4Ttox: engineN4Ttox ? engineN4Ttox : '',
        engineN4Csn: engineN4Csn ? engineN4Csn : '',
        engineN4Csoh: engineN4Csoh ? engineN4Csoh : '',
        engineN1Sn: engineN1Sn ? engineN1Sn : '',
        engineN2Sn: engineN2Sn ? engineN2Sn : '',
        engineN3Sn: engineN3Sn ? engineN3Sn : '',
        engineN4Sn: engineN4Sn ? engineN4Sn : '',
        engineHpThrust: engineHpThrust ? engineHpThrust : '',
      }))
    }
  }, [currentAd])

  const handleDecrement = () => {
    if (enginesAmount <= 0) {
      return
    }
    setEnginesAmount(
      (prev) => {
        return prev - 1
      }
    )
  }

  const handleIncrement = () => {
    if (enginesAmount >= 4) {
      return
    }
    setEnginesAmount(
      (prev) => {
        return prev + 1
      }
    )
  }

  return (
    <Accordion initialState={true}>
      <div className="accordion__header">
        <div className="accordion__title">Engine</div>
        <div className="accordion__arrow"></div>
      </div>
      <div className="accordion__body">
        <div className="accordion__items-choices">

          <div className="accordion__items-choices__header">
            <div className="accordion__item" title="Engine Make">
              <FormikSelect
                required
                className="select select-white"
                name="engineMake"
                options={choices?.engineMake}
                label="Engine Make"
                placeholder="Select Engine Make"
                isLoading={isLoading}
              />
            </div>
            <div className="accordion__item" title="Engine Model">
              <FormikField name="engineModel" required label="Engine Model" placeholder="Enter Engine Model" />
            </div>
            <div className="accordion__item" title="Engine Time Between Overhauls">
              <FormikField name="engineTbo" label="Engine TBO" placeholder="Enter Engine TBO" />
            </div>
            <div className="accordion__item" title="Engine Horse Power / Thrust">
              <FormikField name="engineHpThrust" label="ENG HP / Thrust" placeholder="Enter ENG HP / Thrust" />
            </div>
          </div>

          <div className='accordion__items-choices__wrapper'>

            {Array(enginesAmount).fill('').map((item, index) => {
              return <ExactEngine i={index + 1} key={index} />
            })}

          </div>
        </div>

        <div className="accordion__body-regulator">
          {enginesAmount > 1 &&
            <Icon name="delete-red" width={24} height={24} onClick={handleDecrement} />
          }
          {enginesAmount < 4 &&
            <Icon name="add" width={24} height={24} onClick={handleIncrement} />
          }
        </div>
      </div>
    </Accordion>
  )
})

export default Engine
