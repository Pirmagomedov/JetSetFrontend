import { Form, Formik } from 'formik'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router'
import Sticky from 'react-sticky-el'
import Button from 'src/components/Button/Button'
import ScrollToErrors from 'src/components/ScrollToErrors/ScrollToErrors'
import {
  Ad,
  AircraftApuInput,
  AircraftAvionicsFormInput,
  AircraftEngineFormInput,
  AircraftExteriorCabinFormInput,
  AircraftMaintenanceFormInput,
  AircraftPropellerFormInput,
  AircraftSummaryInputType,
  AircraftWeightsOtherFormInput,
  Choices,
  useEditDraft,
} from 'src/generated/graphql'
import * as Yup from 'yup'
import { values } from './state'
import { IValues } from './types'
import Apu from './views/Apu/Apu'
import Avionics from './views/Avionics/Avionics'
import Engine from './views/Engine/Engine'
import Exterior from './views/Exterior/Exterior'
import Maintenance from './views/Maintenance/Maintenance'
import Propeller from './views/Propeller/Propeller'
import Summary from './views/Summary/Summary'
import Weights from './views/Weights/Weights'


interface ICreateAdCharacteristics {
  id: string
  step: number
  onStep: (step: number) => void
  currentAd: Ad
  choices: Choices
  onError: (text: string) => void
}

const CharacteristicsSchema = Yup.object().shape({
  serialNumber: Yup.string().required('Required'),
  engineN1Sn: Yup.string().required('Required'),
  engineMake: Yup.string().required('Required'),
  engineModel: Yup.string().required('Required'),
  registrationNumber: Yup.string().required('Required'),
  flightRules: Yup.string(),
  flightDeck: Yup.string(),
  airframeTtsn: Yup.number().typeError('Must be a number').required('Required'),
  landings: Yup.string().required('Required'),
  configuration: Yup.string(),
  landingGear: Yup.string(),
  totalSeats: Yup.number().typeError('Must be a number').required('Required'),
  crewSeats: Yup.number().typeError('Must be a number'),
  passengerSeats: Yup.number().typeError('Must be a number').required('Required'),
})

const CreateAdCharacteristics: React.FC<ICreateAdCharacteristics> = React.memo(props => {
  const { id, step, onStep, currentAd, choices, onError } = props

  const [initialValues, setInitialValues] = useState<IValues>(values)
  const [aircraftSummary, setAircraftSummary] = useState<AircraftSummaryInputType>()
  const [aircraftEngine, setAircraftEngine] = useState<AircraftEngineFormInput>()
  const [aircraftExterior, setAircraftExterior] = useState<AircraftExteriorCabinFormInput>()
  const [aircraftApu, setAircraftApu] = useState<AircraftApuInput>()
  const [aircraftPropeller, setAircraftPropeller] = useState<AircraftPropellerFormInput>()
  const [aircraftAvionics, setAircraftAvionics] = useState<AircraftAvionicsFormInput>()
  const [aircraftMaintenance, setAircraftMaintenance] = useState<AircraftMaintenanceFormInput>()
  const [aircraftWeights, setAircraftWeights] = useState<AircraftWeightsOtherFormInput>()
  const [isNext, setNext] = useState<boolean>()

  const history = useHistory()
  const formikRef = useRef(null)

  const [, updateDraft] = useEditDraft()

  const makeNext = (isNext: boolean) => {
    formikRef.current.handleSubmit()
    setNext(isNext)
  }

  const submitForm = (values: IValues, { setSubmitting, setErrors }) => {
    setSubmitting(true)
    updateDraft({
      draftId: id,
      currentStep: step,
      aircraftSummary,
      aircraftEngine,
      aircraftApu,
      aircraftPropeller,
      aircraftAvionics,
      aircraftMaintenance,
      aircraftExterior,
      aircraftWeights,
    })
      .then(res => {
        const response = res?.data?.editDraft
        const fieldErrors = response?.fieldErrors
        const runtimeError = response?.runtimeError
        if (runtimeError) {
          onError(runtimeError?.message)
          setSubmitting(false)
          return false
        }
        if (fieldErrors) {
          let errorList = {}
          fieldErrors.map(err => (errorList[err?.field] = err?.message))
          setErrors(errorList)
          setSubmitting(false)
          return false
        }
        if (isNext) {
          onStep(step + 1)
          history.push(`/create-ad/${id}`)
        } else {
          history.push('/inventory')
        }
      })
      .catch(err => console.error(err))
  }

  return (
    <Formik
      innerRef={formikRef}
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={submitForm}
      validationSchema={CharacteristicsSchema}
    >
      {({ values, errors, isSubmitting }) => {
        return (
          <Form className="create-ad__form">
            <ScrollToErrors errors={errors} isSubmitting={isSubmitting} />
            <Summary
              currentAd={currentAd}
              choices={choices}
              values={values}
              onChange={setAircraftSummary}
              onInitialValues={setInitialValues}
            />
            <Engine
              currentAd={currentAd}
              choices={choices}
              values={values}
              onChange={setAircraftEngine}
              onInitialValues={setInitialValues}
            />
            <Apu currentAd={currentAd} choices={choices} values={values} onChange={setAircraftApu} onInitialValues={setInitialValues} />
            <Propeller
              currentAd={currentAd}
              choices={choices}
              values={values}
              onChange={setAircraftPropeller}
              onInitialValues={setInitialValues}
            />
            <Avionics
              currentAd={currentAd}
              choices={choices}
              values={values}
              onChange={setAircraftAvionics}
              onInitialValues={setInitialValues}
            />
            <Maintenance
              currentAd={currentAd}
              choices={choices}
              values={values}
              onChange={setAircraftMaintenance}
              onInitialValues={setInitialValues}
            />
            <Exterior
              currentAd={currentAd}
              choices={choices}
              values={values}
              onChange={setAircraftExterior}
              onInitialValues={setInitialValues}
            />
            <Weights
              currentAd={currentAd}
              choices={choices}
              values={values}
              onChange={setAircraftWeights}
              onInitialValues={setInitialValues}
            />
            <div className="create-ad__footer">
              <Sticky className="create-ad__sticky" mode="bottom">
                <div className="create-ad__holderWide">
                  <div className="create-ad__footer__left">
                    <Button
                      className="create-ad__btn create-ad__btn--back"
                      type="secondary"
                      onClick={() => onStep(step - 1)}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      className="create-ad__btn create-ad__btn--save"
                      type="secondary"
                      onClick={() => makeNext(false)}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      Save draft and Exit
                    </Button>
                  </div>
                  <div className="create-ad__footer__right">
                    <Button
                      className="create-ad__btn create-ad__btn--next"
                      onClick={() => makeNext(true)}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Sticky>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
})

export default CreateAdCharacteristics
