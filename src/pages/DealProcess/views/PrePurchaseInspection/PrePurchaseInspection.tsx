import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'
import { Form, Formik, FormikProps } from 'formik'
import FormikField from 'src/components/FormikField/FormikField'
import FormikCalendar from 'src/components/FormikCalendar/FormikCalendar'
import Button from 'src/components/Button/Button'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import { Deal, usePrePurchase } from 'src/generated/graphql'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch, RootState } from 'src/store'
import './PrePurchaseInspection.scss'
import Ol from 'src/components/Ol/Ol'
import { formatDate, getCalendarArray } from 'src/helper'
import { format } from 'date-fns'
import * as Yup from 'yup';
import { ref } from 'yup';
import { DealPermission } from 'src/types'

enum TFormActions {
  reject = 'reject',
  accept = 'accept'
}

interface IPrePurchaseInspection {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
}

const now = new Date()

const inspectionSchema = Yup.object().shape({
  facilityAndLocation: Yup.string().required('Required'),
  startingDate: Yup.date()
    .when('isSeller', { is: isSeller => !isSeller, then: Yup.date().min(now, 'Specify a date in the future').required('Required') }),
  expectedCompletionDate: Yup.date()
    .when('isSeller', { is: isSeller => !isSeller, then: Yup.date().min(now, 'The inspection should not end before the start').required('Required') }),
  sellerComment: Yup.string().when(['action', 'isSeller'], { is: (action, isSeller) => isSeller && action == TFormActions.reject, then: Yup.string().required('Required'), otherwise: Yup.string() })
});

const PrePurchaseInspection: React.FC<IPrePurchaseInspection> = props => {
  const { deal, isSeller, onHelpModal, permissions } = props
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const currentStatus = deal.status
  const dealId = deal.id
  const router = useHistory()
  const formRef = useRef<FormikProps<any>>(null)
  const dispatch: AppDispatch = useDispatch()
  const { choices } = useSelector((state: RootState) => state.choices)
  const [, prePurchaseMutation] = usePrePurchase()
  const location = useLocation()
  const calendar = getCalendarArray(deal)

  const handleMutationResult = (result) => {
    const response = result.data.prePurchase
    const runtimeError = response.runtimeError
    if (runtimeError) {
      dispatch(setCommonLoader(false))
      console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
      return false
    }

    if (response.success === true) {
      router.push('/deals')
    } else {
      dispatch(setCommonLoader(false))
      //show errors?
    }
  }

  const formikDateToGraphQLDate = (value: string | Date) => {
    if (typeof value == 'string')
      return value
    else
      return format(value, 'yyyy-MM-dd')
  }

  const formSubmit = (values) => {
    const formValues = {
      facilityAndLocation: values.facilityAndLocation,
      startingDate: format(values.startingDate, 'yyyy-MM-dd'),
      expectedCompletionDate: format(values.expectedCompletionDate, 'yyyy-MM-dd'),
      otherDetails: values.otherDetails,
      buyerComment: values.buyerComment,
      sellerComment: values.sellerComment,
      deal: dealId,
    }

    if (isSeller) {
      if (TFormActions.accept === values.action) {
        //seller approve action
        dispatch(setCommonLoader(true))
        prePurchaseMutation({
          dealId: dealId,
          prePurchaseDetails: {
            approve: true,
            ...formValues
          }
        }).then(handleMutationResult)
      }
      if (TFormActions.reject === values.action) {
        //seller reject action
        dispatch(setCommonLoader(true))
        prePurchaseMutation({
          dealId: dealId,
          prePurchaseDetails: {
            //approve: false,
            ...formValues
          }
        }).then(handleMutationResult)
      }
    } else {
      //buyer action
      dispatch(setCommonLoader(true))
      prePurchaseMutation({
        dealId: dealId,
        prePurchaseDetails: {
          approve: false,
          ...formValues
        }
      }).then(handleMutationResult)
    }
  }
  const defaults = {
    facilityAndLocation: null,
    startingDate: null,
    expectedCompletionDate: null
  }
  const acceptButtonTitle = isSeller ? 'Accept' : 'Send'
  const currentDate = new Date()
  // const inspectionMax = new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000)
  const inspectionMax = new Date(Number(calendar[7].date) - 3600 * 24 * 1000)
  const ppiDetails = { ...deal.ppiDetails }
  if (ppiDetails.expectedCompletionDate) ppiDetails.expectedCompletionDate = new Date(ppiDetails.expectedCompletionDate)
  if (ppiDetails.startingDate) ppiDetails.startingDate = new Date(ppiDetails.startingDate)
  const [initialValues, setInitialValues] = useState({ ...defaults, ...ppiDetails, isSeller: isSeller })

  const shouldHideSellerAnswer = (!initialValues.sellerComment || initialValues.sellerComment == '') && !isSeller
  const isFirstTime = !initialValues.startingDate ? true : false

  useEffect(() => {
    const match = location.search.match(/\?mro=(.*)/);
    if (match && match.length == 2) {
      setInitialValues(prev => { return { ...prev, facilityAndLocation: decodeURIComponent(match[1]) } })
    } else {
      setInitialValues({ ...initialValues })
    }
  }, [])



  return (

    <Formik
      initialValues={initialValues}
      innerRef={formRef}
      onSubmit={formSubmit}
      validationSchema={inspectionSchema}
      enableReinitialize
    >
      {({ values, handleSubmit, setFieldValue }) => (
        <DealProcessLayout title="Pre-purchase Inspection Arrangement"
          noAccess={permissions.readOnly}
          links={[
            { title: "Help", onClick: () => onHelpModal(true) }
          ]}
          leftButtons={[
            { title: "Return to deals", onClick: () => router.push('/deals') },

          ]}
          rightButtons={[
            {
              title: "Reject", onClick: () => {
                setFieldValue('action', TFormActions.reject)
                setTimeout(handleSubmit, 10)

              },
              display: isSeller,
              disabled: permissions.readOnly
            },
            {
              title: acceptButtonTitle, onClick: () => {
                setFieldValue('action', TFormActions.accept)
                setTimeout(handleSubmit, 10)
              },
              disabled: permissions.readOnly
            },
          ]}
        >
          <Form className="ppi-form">
            <div className="ppi-main">
              {
                !isSeller &&
                <div className="ppi-main__text">
                  <Ol list={[
                    { index: "01", text: "To arrange the Inspection of your future Aircraft you need to find the appropriate Inspection Facility and negotiate Inspection details and dates" },
                    { index: "02", text: "Get preliminary approval of the Inspection details from the Seller by filling the form below." },
                    { index: "03", text: "After the Seller's approval, sign the contract with the Inspection Facility." }
                  ]} />
                  <div className="ppi-main__button">
                    <Button onClick={() => router.push(`/facilities/${dealId}`)}>Inspection Centers</Button>
                  </div>
                </div>
              }
              <div className="ppi-main__table">
                <div className="ppi-main__table-row">
                  <div className="ppi-main__table-row__title">
                    Inspection Facility &amp; Location
                  </div>
                  <div className="ppi-main__table-row__value">
                    {
                      isSeller ?
                        values.facilityAndLocation
                        :
                        <FormikField className="select select-white" name='facilityAndLocation' disabled={isSeller || permissions.readOnly} />
                    }
                  </div>
                </div>
                <div className="ppi-main__table-row">
                  <div className="ppi-main__table-row__title">
                    Inspection Starting Date
                  </div>
                  <div className="ppi-main__table-row__value">
                    {
                      isSeller ?
                        formatDate(values.startingDate)
                        :
                        <FormikCalendar
                          name='startingDate'
                          disabled={isSeller || permissions.readOnly}
                          minDate={currentDate}
                          maxDate={values.expectedCompletionDate ? values.expectedCompletionDate : inspectionMax}
                        />
                    }

                  </div>
                </div>
                <div className="ppi-main__table-row">
                  <div className="ppi-main__table-row__title">
                    Expected Completion of Inspection
                  </div>
                  <div className="ppi-main__table-row__value">
                    {
                      isSeller ?
                        formatDate(values.expectedCompletionDate)
                        :
                        <FormikCalendar
                          name='expectedCompletionDate'
                          disabled={isSeller || permissions.readOnly}
                          minDate={values.startingDate ? values.startingDate : currentDate}
                          maxDate={inspectionMax}
                        />
                    }
                  </div>
                </div>
                <div className="ppi-main__table-row">
                  <div className="ppi-main__table-row__title">
                    Other details (if any)
                  </div>
                  <div className="ppi-main__table-row__value">
                    {
                      isSeller ?
                        values.otherDetails
                        :
                        <FormikField name='otherDetails' isTextarea={true} disabled={isSeller || permissions.readOnly} />
                    }
                  </div>
                </div>
              </div>
            </div>
            {!isFirstTime &&
              <div className={`ppi-aside ${isSeller ? 'buyer-first' : 'seller-first'}`}>
                {(initialValues.buyerComment !== '' || !isSeller) &&
                  <div className="block">
                    <h2>{isSeller ? "Buyer's comment" : "Your's comments"}</h2>
                    {
                      isSeller ?
                        <div className="text-value">{values.buyerComment}</div>
                        :
                        <FormikField
                          name="buyerComment"
                          isTextarea={true}
                          isEdit={!isSeller}
                          disabled={permissions.readOnly}
                          placeholder={!isSeller ? "If you have objections please enter here" : ''}
                        />
                    }

                  </div>
                }
                <div className={shouldHideSellerAnswer ? 'hidden' : 'block'}>
                  <h2>{isSeller ? "Your's comments" : "Seller's comments"}</h2>
                  {
                    isSeller ?
                      <FormikField
                        name="sellerComment"
                        isTextarea={true}
                        disabled={permissions.readOnly}
                        isEdit={isSeller}
                        placeholder={isSeller ? "If you have objections please enter here" : ''}
                      />
                      :
                      <div className="text-value">{values.sellerComment}</div>
                  }
                </div>
              </div>
            }
            <input type="hidden" value={isSeller ? 1 : 0} name="isSeller" />
          </Form>
        </DealProcessLayout>
      )}
    </Formik>

  )
}

export default PrePurchaseInspection
