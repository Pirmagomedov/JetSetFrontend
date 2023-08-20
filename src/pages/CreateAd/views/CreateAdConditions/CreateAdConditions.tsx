import { Form, Formik } from 'formik'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Sticky from 'react-sticky-el'
import Button from 'src/components/Button/Button'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import FormikSwitch from 'src/components/FormikSwitch/FormikSwitch'
import FormikAirports from 'src/components/FormikAirports/FormikAirports'
import FormikPrice from 'src/components/FormikPrice/FormikPrice'
import { Options } from 'src/types'
import ScrollToErrors from 'src/components/ScrollToErrors/ScrollToErrors'
import {
  Ad,
  useEditDraft,
  useSaveAd,
  useFeeByAmount
} from 'src/generated/graphql'
import { setNotification } from 'src/reducers/notificationReducer'
import { RootState } from 'src/store'
import { stringArrayToOptions, isNumeric } from 'src/helper'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import * as Yup from 'yup'
import '../../CreateAd.scss'


interface IInitialValues {
  aircraftPrice: string
  depositPercent: string
  depositAmount: string
  currency: number
  priceDescription: string
  standartCondition: boolean
  additionalData: string
  inspectionProgramLevel: string
  governingLaw: string
  commissionRule: string
  commissionAmount: number
  commissionPercent: number
  commissionSuffix: string | number
  aircraftLocation: number
  promocode: string
  vatAmount: string
  vat: string
}

interface ICreateAdConditions {
  id: string
  step: number
  onStep: (step: number) => void
  currentAd: Ad
  onError: (text: string) => void
}

const ConditionsSchema = Yup.object().shape({
  aircraftPrice: Yup.number()
    .typeError('Must be a number')
    .required('Required')
    .min(0.01, 'Must be more than 0'),
  depositPercent: Yup.number()
    .typeError('Must be a number')
    .min(1, 'Must be between 1 and 100')
    .max(100, 'Must be between 1 and 100')
    .required('Required'),
  depositAmount: Yup.number(),
  vat: Yup.number()
    .typeError('Must be a number')
    .min(0, 'Must be between 0 and 100')
    .max(100, 'Must be between 0 and 100'),
  currency: Yup.string().required('Required').typeError('Select a currency'),
  priceDescription: Yup.string(),
  daysForPurchaseAgreement: Yup.number().typeError('Must be a number'),
  daysForClosing: Yup.number(),
  standartCondition: Yup.boolean(),
  additionalData: Yup.string()
    .when('standartCondition', {
      is: true,
      then: Yup.string(),
    }),
  daysForFinalDelivery: Yup.string(),
  aircraftLocation: Yup.number().typeError('Select airport from the list').required('Select airport from the list'),
  inspectionFacility: Yup.string(),
  daysForInspection: Yup.string(),
  inspectionLocation: Yup.string(),
  inspectionProgramLevel: Yup.string().required('Required'),
  governingLaw: Yup.string().required('Required'),
  commissionRule: Yup.string().required('Required')
})

const CreateAdConditions: React.FC<ICreateAdConditions> = React.memo(props => {
  const { id, step, onStep, currentAd, onError } = props
  const [initialValues, setInitialValues] = useState<IInitialValues>({
    aircraftPrice: '',
    depositPercent: '0',
    depositAmount: '0',
    currency: null,
    priceDescription: '',
    standartCondition: true,
    additionalData: '',
    inspectionProgramLevel: '',
    aircraftLocation: null,
    governingLaw: '',
    commissionRule: '',
    commissionAmount: 0,
    commissionPercent: 0,
    commissionSuffix: '',
    vatAmount: '0',
    promocode: '',
    vat: '0'
  })
  const [isFinish, setFinish] = useState<boolean>()
  const [fee, getFeeByAmount] = useFeeByAmount()

  const dispatch = useDispatch()
  const formikRef = useRef(null)
  const { choices } = useSelector((state: RootState) => state.choices)
  const [, updateDraft] = useEditDraft()
  const [, saveAd] = useSaveAd()
  const history = useHistory()
  const [comissionLoading, setCommissionLoading] = useState<boolean>(false)
  const [inspectionLevels, setInspectionLevels] = useState([...choices?.inspectionProgramLevels])

  const makeFinish = (isFinish: boolean) => {
    formikRef.current.handleSubmit()
    setFinish(isFinish)
  }

  useEffect(() => {

    if (currentAd?.termsOfPayment) {
      const {
        termsOfPayment: { aircraftPrice, depositPercent, currency, priceDescription, vat, commissionRule },
        timeConditions: { daysForPurchaseAgreement, daysForClosing },
        deliveryConditions: { standartCondition, additionalData, deliveryLocation, daysForFinalDelivery },
        inspectionConditions: { inspectionFacility, daysForInspection, inspectionLocation, inspectionProgramLevel, governingLaw },
        aircraftLocation
      } = currentAd

      const loadedValues = {
        aircraftPrice: aircraftPrice.toString(),
        depositPercent: depositPercent.toString(),
        depositAmount: ((aircraftPrice * depositPercent) / 100).toString(),
        currency: currency ? +currency?.value : null,
        priceDescription: priceDescription ? priceDescription?.value.toString() : '',
        standartCondition: standartCondition,
        additionalData,
        inspectionProgramLevel: inspectionProgramLevel ? inspectionProgramLevel?.value.toString() : '',
        governingLaw: governingLaw ? governingLaw?.value.toString() : '',
        commissionRule: commissionRule ? commissionRule.toString() : '',
        commissionAmount: 0,
        commissionPercent: 0,
        commissionSuffix: 0,
        aircraftLocation: aircraftLocation?.airport?.value,
        promocode: '',
        vat: vat,
        vatAmount: ((aircraftPrice * vat) / 100).toString(),
      }

      setInitialValues(loadedValues)
      handleComission(loadedValues, (key, value) => setInitialValues(v => { return { ...v, [key]: value } }))
    }
  }, [currentAd])

  const handleDeposit = (values: IInitialValues, setFieldValue) => {
    const aircraftPrice = +values?.aircraftPrice
    const depositPercent = +values?.depositPercent

    if (isNumeric(aircraftPrice) && isNumeric(depositPercent)) {
      setFieldValue('depositAmount', ((aircraftPrice * depositPercent) / 100))
    } else {
      setFieldValue('depositAmount', '')
    }
  }


  const handleVat = (values: IInitialValues, setFieldValue) => {
    const aircraftPrice = +values?.aircraftPrice
    const vat = +values?.vat

    if (isNumeric(aircraftPrice) && isNumeric(vat)) {
      setFieldValue('vatAmount', (aircraftPrice * vat) / 100)
    } else {
      setFieldValue('vatAmount', '')
    }
  }

  const handleComission = (values: IInitialValues, setFieldValue) => {
    setCommissionLoading(true)
    getFeeByAmount({ amount: values?.aircraftPrice ? values?.aircraftPrice : 0, promocode: values?.promocode }).then(res => {
      setCommissionLoading(false)
      if (res?.data?.getFeeByAmount?.feeAmount) {
        setFieldValue('commissionAmount', res?.data?.getFeeByAmount?.feeAmount)
        setFieldValue('commissionPercent', res?.data?.getFeeByAmount?.feePercent)
        setFieldValue('commissionSuffix', commissionValueSuffix(
          values.aircraftPrice,
          res?.data?.getFeeByAmount?.feePercent,
          res?.data?.getFeeByAmount?.feeAmount,
          res?.data?.getFeeByAmount?.isMin
        ))
      } else {
        console.error(res)
      }
    })
  }

  const submitForm = (values: IInitialValues, { setSubmitting, setErrors }) => {
    setSubmitting(true)

    const termsOfPayment = {
      aircraftPrice: +values?.aircraftPrice,
      depositPercent: +values?.depositPercent,
      currency: values?.currency ? +values?.currency : null,
      priceDescription: values?.priceDescription ? +values?.priceDescription : null,
      commissionRule: values?.commissionRule ? values?.commissionRule : null,
      promocode: values?.promocode ? values?.promocode : null,
      vat: values?.vat ? +values?.vat : null
    }

    const aircraftLocation = {
      airport: values?.aircraftLocation,
    }

    const deliveryConditions = {
      standartCondition: values?.standartCondition,
      additionalData: values?.additionalData,
    }
    const inspectionConditions = {

      inspectionProgramLevel: +values?.inspectionProgramLevel,
      governingLaw: values?.governingLaw ? +values?.governingLaw : null,
    }
    updateDraft({ draftId: id, currentStep: step, termsOfPayment, deliveryConditions, inspectionConditions, aircraftLocation })
      .then(async res => {
        const response = res?.data?.editDraft
        const id = response?.draft?.id
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

        if (isFinish) {
          dispatch(setCommonLoader(true))
          saveAd({ draftId: id }).then(async res => {
            if (runtimeError) {
              onError(runtimeError?.message)
              setSubmitting(false)
              dispatch(setCommonLoader(false))
              return false
            }
            history.push('/inventory')
          })
        } else {
          history.push('/inventory')
        }
      })
      .catch(err => console.error(err))
  }

  const handleUpdateFields = (values, setFieldValue) => {
    handleDeposit(values, setFieldValue)
    handleVat(values, setFieldValue)
    handleComission(values, setFieldValue)
  }

  const commissionValueSuffix = (summ, percent, value, isMin) => {
    const calculated = Math.round(value * 10000 / summ) / 100
    return /*(summ / 100) * percent < 20000*/ isMin ? 'min' : `${calculated}%`
  }

  return (
    <>
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        onSubmit={submitForm}
        validationSchema={ConditionsSchema}
        enableReinitialize={true}
      >
        {({ values, errors, isSubmitting, setFieldValue }) => (
          <Form className="create-ad__form">
            <ScrollToErrors errors={errors} isSubmitting={isSubmitting} />
            <div className="create-ad__fieldset-wrapper">
              <div className="create-ad__fieldset">
                <div className="create-ad__fields create-ad__fields__payment">
                  <FormikPrice
                    className='aircraftPrice'
                    name="aircraftPrice"
                    label="Aircraft price"
                    required
                    placeholder="Enter price"
                    onTypeEnd={() => handleUpdateFields(values, setFieldValue)}
                  //changeHandler={() => handleUpdateFields(values, setFieldValue)}
                  />
                  <FormikPrice
                    className='depositPercent'
                    name="depositPercent"
                    label="Deposit size (%)"
                    required
                    placeholder="0"
                    onTypeEnd={() => handleDeposit(values, setFieldValue)}
                    //changeHandler={() => handleDeposit(values, setFieldValue)}
                    max={100}
                    min={0}
                    float={true}
                  />
                  <FormikPrice
                    className='depositAmount'
                    name="depositAmount"
                    label="Deposit amount"
                    readonly={true}
                    float={true}
                    help={{
                      title: "Learn about deposit",
                      link: "/help/terms-of-aircraft-sales-transactions/7"
                    }}
                  />
                  <FormikSelect
                    className="select select-white currency"
                    label="Currency"
                    name="currency"
                    options={choices?.currencies}
                    // placeholder="USD"
                    // placeholder="Select"
                    required
                  />
                  <FormikPrice
                    className='vat'
                    name="vat"
                    label="VAT included (%)"
                    placeholder="VAT"
                    onTypeEnd={() => handleVat(values, setFieldValue)}
                    //changeHandler={() => handleVat(values, setFieldValue)}
                    max={100}
                    min={0}
                    float={true}
                  />
                  <FormikPrice
                    className='vatAmount'
                    name="vatAmount"
                    label="VAT amount"
                    readonly={true}
                    float={true}
                    help={{
                      link: "/help/terms-of-aircraft-sales-transactions/31",
                      title: "Learn about taxation"
                    }}
                  />
                  <FormikSelect
                    className="select select-white hidden priceDescription"
                    label="Price description"
                    name="priceDescription"
                    options={choices?.priceDescriptions}
                    placeholder="Select"
                  />

                  <FormikSelect
                    className="select select-white commissionRule"
                    label="Distribution of Wingform's fees"
                    name="commissionRule"
                    options={choices?.commissionRules}
                    placeholder="Select"
                    changeHandler={() => handleComission(values, setFieldValue)}
                  />
                  <FormikField
                    className="promocode"
                    name="promocode"
                    label="Promocode"
                    onTypeEnd={() => handleComission(values, setFieldValue)}
                  //changeHandler={() => handleComission(values, setFieldValue)}
                  />
                  <FormikPrice
                    className="commissionAmount"
                    name="commissionAmount"
                    label={`Administration fee (${values.commissionSuffix})`}
                    readonly={true}
                    float={true}
                    help={{
                      title: "Learn about administration fee",
                      link: "/help/terms-of-aircraft-sales-transactions/33"
                    }}
                  />
                </div>
              </div>
              <div className="create-ad__fieldset">
                <div className="create-ad__fields">
                  <FormikSelect
                    className="select select-white"
                    label="Desired governing law"
                    required
                    name="governingLaw"
                    options={choices?.governingLaws}
                    placeholder="Select governing law"
                  />
                  <div className="create-ad__program">
                    <FormikSelect
                      className="select select-white"
                      name="inspectionProgramLevel"
                      options={inspectionLevels.sort((a, b) => a.value - b.value)}
                      label="Desired inspection program level"
                      required
                      placeholder="Select inspection program level"
                      help={{
                        title: "Learn about inspection program",
                        link: "https://dev.wingform.com/info/pre_purchase-inspection"
                      }}
                    />
                    <div className="create-ad__program-text">
                      You can read about the programs <a href="#">here</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="create-ad__fieldset">
                <div className="create-ad__fields create-ad__fields--start create-ad__fields-left-wide">
                  <div className="create-ad__airport">
                    <FormikAirports
                      name="aircraftLocation"
                      label="Location"
                      required
                    // title="Learn about delivery location"
                    // linkToHelp='/help/terms-of-aircraft-sales-transactions/25'
                    />
                  </div>
                  <div className="create-ad__block">
                    <FormikField
                      label="Delivery Condition"
                      // disabled={values.standartCondition}
                      className={`create-ad__textarea`}
                      isTextarea={true}
                      name="additionalData"
                      // placeholder="Text here..."
                      placeholder="Please enter any specific terms as compared or to be added to standard DCs (can be: history of damage, any AC programs, mutual agreements, etc.)"
                      // required
                      help={{
                        title: "Learn about delivery conditions",
                        link: "/info/delivery-condition",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="create-ad__footer">
              <Sticky className="create-ad__sticky" mode="bottom">
                <div className="create-ad__holderWide">
                  <div className="create-ad__footer__left">
                    <Button
                      className="create-ad__btn create-ad__btn--back"
                      type="secondary"
                      onClick={() => onStep(step - 1)}
                      isLoading={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      className="create-ad__btn create-ad__btn--save"
                      type="secondary"
                      onClick={() => makeFinish(true)}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      Save draft and Exit
                    </Button>
                  </div>
                  <div className="create-ad__footer__right">
                    <Button
                      className="create-ad__btn create-ad__btn--next"
                      onClick={() => makeFinish(true)}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      Finish
                    </Button>
                  </div>
                </div>
              </Sticky>
            </div>
          </Form>
        )}
      </Formik>
    </>
  )
})

export default CreateAdConditions