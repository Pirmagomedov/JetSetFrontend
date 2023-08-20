import React, { useEffect, useState, useRef } from 'react'
import Accordion from 'src/components/Accordion/Accordion'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import Icon from 'src/components/Icon/Icon'
import { Ad, AircraftPropellerFormInput, Choices } from 'src/generated/graphql'
import { IValues } from '../../types'

interface IPropeller {
  currentAd: Ad
  choices: Choices
  values: IValues
  onChange: (values: AircraftPropellerFormInput) => void
  onInitialValues: (values: IValues | ((prev: IValues) => IValues)) => void
}

interface IExactPropeller {
  i: number
  isLoading?: any
  choices?: any
}

const ExactPropeller: React.FC<IExactPropeller> = (props) => {
  const { i, choices, isLoading } = props
  return (
    <div className="accordion__item-choices">
      <div className="accordion__item" title="Propeller Total Time Since New">
        <FormikField name={`prop${i}Ttsn`} label={`Prop #${i} TTSN`} placeholder={`Enter Prop #${1} TTSN`} />
      </div>
      <div className="accordion__item" title="Propeller Time Since Overhaul">
        <FormikField name={`prop${i}Tsoh`} label={`Prop #${i} TSOH`} placeholder={`Enter Prop #${i} TSOH`} />
      </div>
      <div className="accordion__item" title="Propeller Time Till Overhaul">
        <FormikField name={`prop${i}Ttoh`} label={`Prop #${i} TTOH`} placeholder={`Enter Prop #${i} TTOH`} />
      </div>
      <div className="accordion__item" title="Select Propeller Overhaul (Years)">
        <FormikSelect
          className="select select-white"
          name={`prop${i}OhYr`}
          options={choices?.prop1OhYr}
          label={`Prop #${i} OH Yr`}
          placeholder={`Select Prop #${i} OH Yr`}
          isLoading={isLoading}
        />
      </div>
      <div className="accordion__item" title="Select Propeller Overhaul Due">
        <FormikSelect
          className="select select-white"
          name="prop1OhDue"
          options={choices?.prop1OhDue}
          label={`Prop #${i} OH Due`}
          placeholder={`Select Prop #${i} OH Due`}
          isLoading={isLoading}
        />
      </div>
      <div className="accordion__item" title="Propeller Serial Number">
        <FormikField name={`prop${i}Sn`} label={`Prop #${i} SN`} placeholder={`Enter Prop #${i} SN`} />
      </div>
    </div>
  )
}

const Propeller: React.FC<IPropeller> = React.memo(props => {
  const { currentAd, choices, values, onChange, onInitialValues } = props
  const [isLoading, setLoading] = useState<boolean>(true)
  const [propellersAmount, setPropellersAmount] = useState(0)

  useEffect(() => {
    if (choices) {
      setLoading(false)
    }
  }, [choices])

  useEffect(() => {
    onChange({
      propMake: values.propMake,
      propType: values.propType,
      propModel: values.propModel,
      propSize: values.propSize,
      propTboHrs: values.propTboHrs,
      propTboYrs: values.propTboYrs,
      prop1Sn: values.prop1Sn,
      prop1Ttsn: values.prop1Ttsn,
      prop1Tsoh: values.prop1Tsoh,
      prop1Ttoh: values.prop1Ttoh,
      prop1OhYr: values.prop1OhYr,
      prop1OhDue: values.prop1OhDue,
      prop2Sn: values.prop2Sn,
      prop2Ttsn: values.prop2Ttsn,
      prop2Tsoh: values.prop2Tsoh,
      prop2Ttoh: values.prop2Ttoh,
      prop2OhYr: values.prop2OhYr,
      prop2OhDue: values.prop2OhDue,
    })
  }, [values])

  useEffect(() => {
    if (currentAd?.propeller) {
      const {
        propMake,
        propType,
        propModel,
        propSize,
        propTboHrs,
        propTboYrs,
        prop1Sn,
        prop1Ttsn,
        prop1Tsoh,
        prop1Ttoh,
        prop1OhYr,
        prop1OhDue,
        prop2OhYr,
        prop2Sn,
        prop2Ttsn,
        prop2Tsoh,
        prop2Ttoh,
        prop2OhDue,
      } = currentAd.propeller

      onInitialValues(prev => ({
        ...prev,
        propMake: propMake ? propMake.value.toString() : '',
        propType: propType ? propType.value.toString() : '',
        propModel: propModel ? propModel : '',
        propSize: propSize ? propSize : '',
        propTboHrs: propTboHrs ? propTboHrs : '',
        propTboYrs: propTboYrs ? propTboYrs.value.toString() : '',
        prop1Sn: prop1Sn ? prop1Sn : '',
        prop1Ttsn: prop1Ttsn ? prop1Ttsn : '',
        prop1Tsoh: prop1Tsoh ? prop1Tsoh : '',
        prop1Ttoh: prop1Ttoh ? prop1Ttoh : '',
        prop1OhYr: prop1OhYr ? prop1OhYr.value.toString() : '',
        prop1OhDue: prop1OhDue ? prop1OhDue.value.toString() : '',
        prop2Sn: prop2Sn ? prop2Sn : '',
        prop2Ttsn: prop2Ttsn ? prop2Ttsn : '',
        prop2Tsoh: prop2Tsoh ? prop2Tsoh : '',
        prop2Ttoh: prop2Ttoh ? prop2Ttoh : '',
        prop2OhYr: prop2OhYr ? prop2OhYr.value.toString() : '',
        prop2OhDue: prop2OhDue ? prop2OhDue.value.toString() : '',
      }))
    }
  }, [currentAd])

  const handleDecrement = () => {
    if (propellersAmount <= 0) {
      return
    }
    setPropellersAmount(
      (prev) => {
        return prev - 1
      }
    )
  }

  const handleIncrement = () => {
    if (propellersAmount >= 2) {
      return
    }
    setPropellersAmount(
      (prev) => {
        return prev + 1
      }
    )
  }

  return (
    <Accordion>
      <div className="accordion__header">
        <div className="accordion__title">Propeller</div>
        <div className="accordion__arrow"></div>
      </div>
      <div className="accordion__body">
        <div className="accordion__items-choices">

          <div className="accordion__items-choices__header">

            <div className="accordion__item" title="Propeller Make">
              <FormikSelect
                className="select select-white"

                name="propMake"
                options={choices?.propMake}
                label="Prop Make"
                placeholder="Select Prop Make"
                isLoading={isLoading}
              />
            </div>
            <div className="accordion__item" title="Propeller Type">
              <FormikSelect
                className="select select-white"
                name="propType"
                options={choices?.propType}
                label="Prop Type"
                placeholder="Select Prop Type"
                isLoading={isLoading}
              />
            </div>
            <div className="accordion__item" title="Propeller Model">
              <FormikField name="propModel" label="Prop Model" placeholder="Enter Prop Model" />
            </div>
            <div className="accordion__item" title="Propeller Size (inches)">
              <FormikField name="propSize" label="Prop Size (in)" placeholder="Enter Prop Size (in)" />
            </div>
            <div className="accordion__item" title="Propeller Time Between Overhauls Hours">
              <FormikField name="propTboHrs" label="Prop TBO Hrs" placeholder="Enter Prop TBO Hrs" />
            </div>
            <div className="accordion__item" title="Propeller Time Between Overhauls Years">
              <FormikSelect
                className="select select-white"
                name="propTboYrs"
                options={choices?.propTboYrs}
                label="Prop TBO Yrs"
                placeholder="Select Prop TBO Yrs"
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className='accordion__items-choices__wrapper'>

            {Array(propellersAmount).fill('').map((item, index) => {
              return <ExactPropeller
                i={index + 1}
                key={index}
                isLoading={isLoading}
                choices={choices}
              />
            })}

          </div>
        </div>

        <div className="accordion__body-regulator">
          {propellersAmount > 0 &&
            <Icon name="delete-red" width={24} height={24} onClick={handleDecrement} />
          }
          {propellersAmount < 2 &&
            <Icon name="add" width={24} height={24} onClick={handleIncrement} />
          }
        </div>
      </div>
    </Accordion>
  )
})

export default Propeller
