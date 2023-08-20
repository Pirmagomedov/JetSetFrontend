import { Form, Formik, FormikProps } from 'formik'
import React, { useEffect, useState, useRef, useReducer } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  DealTermsType,
  Deal,
  useTermsAndConditions,
  AppInitialDealActionActionChoices,
  useGetTermsAndConditionsFields,
  DealTermsAndConditionsType,
  Tnc,
  TermsAndConditionsAction,
  AppDealStatusChoices
} from 'src/generated/graphql'
import { Options } from 'src/types'
import {
  formatPrice,
  areEqual,
  isEmpty,
  isNumeric,
  formatDate,
  permView
} from 'src/helper'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import { RootState } from 'src/store'
import Sticky from 'react-sticky-el'
import Button from 'src/components/Button/Button'
import ConditionsCard, { getOptionsLabelByValue } from './views/ConditionsCard/ConditionsCard'
import { renderAirport } from 'src/components/FormikAirports/FormikAirports'
import { useDispatch } from 'react-redux'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch } from 'src/store'
import { useChatButton } from 'src/hooks'
import Icon from 'src/components/Icon/Icon'
import { DealPermission } from 'src/types'
import RenderObject from 'src/components/RenderObject/RenderObject'
import './Terms.scss'


interface ITerms {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
  approvedMode?: boolean
}

interface ITermsInfo {
  deal: Deal
  inspection: boolean
}



const TermsInfo: React.FC<ITermsInfo> = props => {
  const { deal, inspection } = props
  const dealId = deal.id
  const hasInspection = inspection ? 0 : 1
  const router = useHistory()
  const steps = deal.steps
  let stepApA = 0
  let stepTnC = 0
  let stepInspection = 0
  let stepFinalDelivery = 0
  let stepClosing = 0
  let stepState = 0
  steps.forEach(step => {
    let stepLength = step.days ? step.days : 0
    step.actions.forEach(action => {
      if (action.days) {
        //console.log(`action.initialAction.action (${stepState})`, action.initialAction.action, action.days)
        if (stepState < 2) stepTnC += action.days
        if (stepState < 3) stepInspection += action.days
        if (stepState < 4) stepFinalDelivery += action.days
        if (stepState < 5) stepClosing += action.days
      }
      //console.log('action.initialAction.action', action.initialAction.action)
      if (action.initialAction.action == AppInitialDealActionActionChoices.PPIC) stepState++
      if (action.initialAction.action == AppInitialDealActionActionChoices.PCD) stepState++
    })
    //console.log('stepState', stepState, {stepTnC, stepFinalDelivery, stepClosing})
    //if (stepState < 1) stepApA += stepLength
    //console.log(`step.initialStep.step (${stepState})`, step.initialStep.step, stepLength)

    if (stepState < 2) stepTnC += stepLength
    if (stepState < 3) stepInspection += stepLength
    if (stepState < 4) stepFinalDelivery += stepLength
    if (stepState < 5) stepClosing += stepLength
    if (step.initialStep.step == 'FP') stepState++
    if (step.initialStep.step == 'PA') stepState++
    if (step.initialStep.step == 'CG') stepState++
  })

  return (
    <div className="terms__info">
      <div className="terms__info-header">
        Recommended timeframes to be included in Aircraft Purchase Agreement (days from APA)
      </div>
      {
        //JSON.stringify({inspection, hasInspection, stepApA, stepTnC, stepInspection, stepFinalDelivery, stepClosing})
      }
      <div className="terms__info__table">
        {
          inspection &&
          <div className="terms__info__table-row">
            <div className="terms__info__table-title">
              Inspection Completion
            </div>
            <div className="terms__info__table-value">
              {stepTnC ? stepTnC - stepApA : 60}
            </div>
          </div>
        }
        <div className="terms__info__table-row">
          <div className="terms__info__table-title">
            Final Delivery
          </div>
          <div className="terms__info__table-value">
            {stepFinalDelivery ? stepFinalDelivery - stepApA - (hasInspection * (stepTnC - stepApA)) : 180}
          </div>
        </div>
        <div className="terms__info__table-row">
          <div className="terms__info__table-title">
            Closing of the transaction
          </div>
          <div className="terms__info__table-value">
            {stepClosing ? stepClosing - stepApA - (hasInspection * (stepTnC - stepApA)) : 180}
          </div>
        </div>
      </div>
      <div className="terms__info-footer">
        <div className="terms__info-footer-text">
          (!) You will be able to modify timeframes in the course of the deal
        </div>
        <div className="terms__info-footer-action">
          <Button type={'secondary'} onClick={() => { window.open(`/deal-calendar/${dealId}`)/*router.push(`/deal-calendar/${dealId}`)*/ }}>Calendar</Button>
        </div>
      </div>
    </div>
  )
}


enum termsReducerActions {
  SET_SELLER = 1,
  SET_BUYER = 2,
  SET_INITIAL = 3,
  SET_ACCEPTED = 4,
  SET_MSG = 5,
  SET_COMP_MSG = 6,
  SET_TITLE = 7
}


interface termsReducerAction {
  key: string
  action: termsReducerActions
  value?: string
}



const termsValuesReducer = (state, action: termsReducerAction) => {
  const newState = { ...state }
  if (!newState[action.key]) newState[action.key] = {}
  switch (action.action) {
    case termsReducerActions.SET_SELLER:
      newState[action.key].seller = action.value
      break
    case termsReducerActions.SET_BUYER:
      newState[action.key].buyer = action.value
      break
    case termsReducerActions.SET_INITIAL:
      newState[action.key].initial = action.value
      break
    case termsReducerActions.SET_ACCEPTED:
      newState[action.key].accepted = action.value
      break
    case termsReducerActions.SET_MSG:
      newState[action.key].message = action.value
      break
    case termsReducerActions.SET_COMP_MSG:
      newState[action.key].companionMessage = action.value
      break
    case termsReducerActions.SET_TITLE:
      newState[action.key].title = action.value
      break
  }
  return newState
}


const renderDate = (date: Date | string | null): string => {
  if (isEmpty(date)) return ''
  if (typeof date == 'string') {
    if (date == '') {
      return ''
    } else {
      return formatDate(new Date(date))
    }
  } else {
    return formatDate(date)
  }
}


const getPreviousTerms = (deal: Deal): Tnc | null => {
  return deal.contractedTermsAndCond
  const current = deal?.termsAndCond
  //return current
  if (current?.id && deal?.termsAndConditions?.length > 1) {
    const tncList = [...deal.termsAndConditions]
    tncList.sort((a, b) => new Date(a.dateCreated) > new Date(b.dateCreated) ? 1 : -1)
    var previous = null
    var terms = null
    for (let i = 0; i < tncList.length; i++) {
      terms = tncList[i]
      if (terms.id == current.id) return previous
      previous = terms
    }
  }
  return null
}


const Terms: React.FC<ITerms> = props => {
  const { deal, isSeller, onHelpModal, onReload, permissions, approvedMode = false } = props
  const { choices } = useSelector((state: RootState) => state.choices)
  const dealId = deal.id
  const isOnRenegotiation = !(deal.status == AppDealStatusChoices.TCWS || deal.status == AppDealStatusChoices.TCWB)
  const currentTerms = isOnRenegotiation ? getPreviousTerms(deal) : null
  const [tcValues, updateTcValues] = useReducer(termsValuesReducer, {})
  const [ approvedModeValue, setApprovedMode] = useState<boolean>(approvedMode && deal.termsAndConditions.length == 1)
  const iteration = deal?.termsAndCond?.iterator
  const readOnly = permissions.readOnly
  const noComments = deal.status == AppDealStatusChoices.TCWB || AppDealStatusChoices.TCWS 

  const [fieldsData, reloadFields] = useGetTermsAndConditionsFields({
    variables: { dealId: dealId },
    pause: true,
    requestPolicy: 'network-only'
  })
  const [fields, setFields] = useState([])
  const { fetching, data: termsAndConditionsFields } = fieldsData
  const [isAskedToCancel, setAskedToCancel] = useState(isSeller ? deal?.termsAndCond?.buyerTerms?.isRejected : deal?.termsAndCond?.sellerTerms?.isRejected)
  const dispatch: AppDispatch = useDispatch()
  const [isAccepted, setAccepted] = useState<boolean>()
  const [isAbleToFinish, setIsAbleToFinish] = useState<boolean>(false)
  const [revized, setRevized] = useState<any>()
  const formRef = useRef<FormikProps<any>>(null);
  const router = useHistory()
  const [, termsAndConditions] = useTermsAndConditions()
  const openChat = useChatButton()

  const handleChat = () => {
    openChat(deal.buyer.user.id, deal.seller.user.id, deal.ad)
  }

  const formatPriceValue = (price) => {
    return <span className="aircraftPrice"><span className="aircraftPrice__currency">{deal?.ad?.termsOfPayment?.currency?.label?.toUpperCase()}</span> <span className="aircraftPrice__price">{formatPrice(price)}</span></span>
  }

  const handleReject = () => {
    termsAndConditions({ action: TermsAndConditionsAction.REJECT, dealId: dealId })
      .then(res => {
        const response = res.data.termsAndConditions
        const runtimeError = response.runtimeError
        if (runtimeError) {
          console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
          return
        }
        //alert('navigate to the /deals page')
        dispatch(setCommonLoader(true))
        router.push('/deals')
      })
      .catch(error => console.error(error))
  }


  const getCardClass = (key) => {
    if (key == 'inspectionDate') {
      if (tcValues?.['inspectionProgramLevel']?.accepted == 1) {
        return 'disabled'
      }
    }
    return null
  }

  const getCardInfo = (key) => {

  }

  const getCardHelp = (key) => {
    if (key === 'inspectionProgramLevel') {
      return {
        title: "Learn about Inspection Levels",
        link: "/info/pre_purchase-inspection/1"
      }
    } 
    if (key === 'commissionRule') {
      return {
        title: "Learn about Service Fee",
        link: "/help/terms-of-aircraft-sales-transactions/33"
      }
    }
    return null
  }

  const getCardType = (key) => {
    const field = fields.filter(f => f.key == key)
    if (field.length == 1) {
      const fielType = field[0].type.toLowerCase()

      if (fielType == 'choices.airports') {
        return 'airports'
      }
      if (fielType == 'date' || fielType == 'datetime') {
        return 'date'
      }
      return fielType
    }
    return null
  }


  useEffect(() => {
    reloadFields()
  }, [])


  const getAirportNameById = (id: number): string => {
    if (choices?.airports?.length) {
      const airportFound = choices?.airports?.filter(a => a.value == id)
      if (airportFound?.length == 1) {
        return renderAirport(airportFound[0])
      }
    }
    if (id) {
      return `${id}`
    }
    return ''
  }


  const getAirportNameByValue = (value: string | false): string => {
    if (value === false) {
      return 'Rejected'
    }
    return getAirportNameById(+value)
  }

  const getCardOptions = (key) => {
    const field = fields.filter(f => f.key == key)
    if (field.length == 1) {
      if (field[0].type) {
        const type = field[0].type
        if (type.match(/choices\..*/)) {
          if (type !== 'choices.airports') {
            const choice = type.replace(/choices\./, '')
            if (choices[choice]) {
              return choices[choice]
            }
          }
        }
      }
    }
    return null
  }

  const getCardFormatFunction = (key) => {
    //TODO переписать на компоненты отдельные

    if (key == 'aircraftPrice') return formatPriceValue
    const field = fields.filter(f => f.key == key)
    if (field.length == 1) {
      const fieldType = field[0].type.toLowerCase()
      if (fieldType == 'choices.airports') {
        return getAirportNameByValue
      }
      if (fieldType.match(/choices\..*/)) {
        return (value) => getOptionsLabelByValue(value, getCardOptions(key))
      }
      if (fieldType == 'date' || fieldType == 'datetime') {
        return renderDate
      }
    }
    return null
  }




  useEffect(() => {
    if (termsAndConditionsFields?.getTermsAndConditionsFields?.fields) {
      const sellerTerms = deal.termsAndCond?.sellerTerms
      const buyerTerms = deal.termsAndCond?.buyerTerms
      const fieldsArray = []
      const fieldsData = termsAndConditionsFields.getTermsAndConditionsFields.fields
      const buyerComments = buyerTerms?.comments ? JSON.parse(buyerTerms.comments) : {}
      const sellerComments = sellerTerms?.comments ? JSON.parse(sellerTerms.comments) : {}

      Object.keys(fieldsData).forEach((key) => {
        const fieldData = fieldsData[key]
        fieldsArray.push({ key, ...fieldData })
        const buyerValue = buyerTerms?.[key] !== undefined ? buyerTerms[key] : ''
        const sellerValue = sellerTerms?.[key] !== undefined ? sellerTerms[key] : ''
        const buyerComment = buyerComments?.[key + 'Message'] ? buyerComments[key + 'Message'] : ''
        const sellerComment = sellerComments?.[key + 'Message'] ? sellerComments[key + 'Message'] : ''

        updateTcValues({ action: termsReducerActions.SET_SELLER, key, value: sellerValue })
        updateTcValues({ action: termsReducerActions.SET_BUYER, key, value: buyerValue })
        updateTcValues({ action: termsReducerActions.SET_TITLE, key, value: fieldData.title })
        if (isSeller) {
          updateTcValues({ action: termsReducerActions.SET_INITIAL, key, value: sellerValue })
          updateTcValues({ action: termsReducerActions.SET_ACCEPTED, key, value: sellerValue })
          updateTcValues({ action: termsReducerActions.SET_MSG, key, value: sellerComment })
          updateTcValues({ action: termsReducerActions.SET_COMP_MSG, key, value: buyerComment })
        } else {
          updateTcValues({ action: termsReducerActions.SET_INITIAL, key, value: buyerValue })
          updateTcValues({ action: termsReducerActions.SET_ACCEPTED, key, value: buyerValue })
          updateTcValues({ action: termsReducerActions.SET_COMP_MSG, key, value: sellerComment })
          updateTcValues({ action: termsReducerActions.SET_MSG, key, value: buyerComment })
        }
      })
      setFields(fieldsArray)

    }
  }, [fieldsData])


  useEffect(() => {

    let canFinish = true;
    let accept = true;
    Object.keys(tcValues).forEach(key => {
      const { accepted, buyer, seller } = tcValues[key]
      if (accepted !== undefined && accepted !== null) {
        //ставим на кнопку Finish если значения совпадают с другой стороной
        canFinish = canFinish && areEqual(accepted, isSeller ? buyer : seller)
        //разрешаем идти дальше, если все поля как минимум не пустые
        accept = accept && !isEmpty(accepted)
      } else {
        canFinish = false
        accept = false
      }
    })
    for (let key in revized) {
      if (!revized[key]) {
        accept = false
      }
    }
    setIsAbleToFinish(canFinish);
    setAccepted(accept);

  }, [tcValues, revized])


  const handleRevert = () => {
    termsAndConditions({ action: TermsAndConditionsAction.INIJECT, dealId: dealId })
      .then(res => {
        const response = res.data.termsAndConditions
        const runtimeError = response.runtimeError
        if (runtimeError) {
          console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
          return
        }
        //alert('navigate to the /deals page')
        dispatch(setCommonLoader(true))
        router.push('/deals')
      })
      .catch(error => console.error(error))
  }

  const getFormValues = () => {
    const formValues = {}
    Object.keys(tcValues).forEach(key => {
      formValues[key] = tcValues[key].accepted
      formValues[key + 'Message'] = tcValues[key].message
    })
    return formValues
  }

  const handleSubmit = (values) => {

    if (isOnRenegotiation && isAbleToFinish && iteration == 0) {
      handleRevert()
    } else {
      const comments: any = {}
      const termsAndConditionsInput: any = {}

      Object.keys(values).forEach(key => {
        const value = values[key]
        if (key.match(/.*Message$/)) {
          comments[key] = value
        } else {
          const field = fields.filter(f => f.key == key)
          if (field.length == 1) {
            const type = field[0].type
            switch (type) {
              case 'float':
              case 'number':
              case 'int':
              case 'integer':
                termsAndConditionsInput[key] = +value
                break
              case 'choices.airports':
                termsAndConditionsInput[key] = value === false ? null : +value
                break
              case 'choices.commissionRules':
                termsAndConditionsInput[key] = value === false ? null : value
                break
              case 'date':
              case 'datetime':
                termsAndConditionsInput[key] = renderDate(value)
                break
              default:
                if (type.match(/^choices\..*/)) {
                  termsAndConditionsInput[key] = +value
                } else {
                  termsAndConditionsInput[key] = value
                }
            }
          }
        }
      })

      termsAndConditionsInput.comments = JSON.stringify(comments)

      termsAndConditions({ termsAndConditions: termsAndConditionsInput, action: (isOnRenegotiation || approvedMode) ? TermsAndConditionsAction.NEW : TermsAndConditionsAction.OLD, dealId: dealId })
        .then(res => {
          const response = res.data.termsAndConditions
          const runtimeError = response.runtimeError
          if (runtimeError) {
            console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
            return
          }
          if (isAbleToFinish) {
            if (isSeller) {
              //router.go(0)
              router.push('/deals')
              //onReload()
            } else {
              dispatch(setCommonLoader(true))
              router.push('/deals')
            }
            // alert('refresh page here')
          } else {
            dispatch(setCommonLoader(true))
            //alert('navigate to the /deals page')
            router.push('/deals')
          }
        })
        .catch(error => console.error(error))
    }
  }

  const handleApprove = () => {
    termsAndConditions({ action: TermsAndConditionsAction.CONFIRM, dealId: dealId })
      .then(res => {
        const response = res.data.termsAndConditions
        const runtimeError = response.runtimeError
        if (runtimeError) {
          console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
          return
        }
        //alert('navigate to the /deals page')
        dispatch(setCommonLoader(true))
        router.push('/deals')
      })
      .catch(error => console.error(error))
  }

  const onKeyDown = (keyEvent) => {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
    }
  }

  const triggerFormEdit = () => {
    setApprovedMode(false)
  }

  const triggerFormSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit()
    }
  }

  const handleValueChange = (name: string, value: string, comment: string): boolean => {
    //dirty trick to set inspection date equal
    if (name == 'inspectionProgramLevel' && fields.filter(f => f.key == 'inspectionDate').length == 1) {
      if (+value == 1) {
        const inspectionDate = isSeller ? tcValues?.inspectionDate?.buyer : tcValues?.inspectionDate?.seller
        updateTcValues({ action: termsReducerActions.SET_ACCEPTED, key: 'inspectionDate', value: inspectionDate })
      }
    }
    updateTcValues({ action: termsReducerActions.SET_ACCEPTED, key: name, value: value })
    updateTcValues({ action: termsReducerActions.SET_MSG, key: name, value: comment })
    return true
  }



  const rightButtons = []
  if (isOnRenegotiation && iteration == 0 && !isAbleToFinish && !approvedModeValue) {
    rightButtons.push(
      { title: 'Cancel', onClick: handleRevert, disabled: readOnly }
    )
  }
  if (isOnRenegotiation && iteration > 0 && !approvedModeValue) {
    rightButtons.push(
      { title: isAskedToCancel ? 'Confirm' : 'Cancel', onClick: handleReject, disabled: readOnly }
    )
  }
  if (isAskedToCancel) {
    rightButtons.push(
      { title: 'Reject', onClick: () => { setAskedToCancel(false) }, disabled: readOnly }
    )
  }
  if (approvedModeValue) {
    rightButtons.push(
      { title: 'Renegotiate', onClick: triggerFormEdit },
      { title: 'Confirm', onClick: handleApprove },
    )
  } else {
    rightButtons.push(
      { title: isAbleToFinish ? (isOnRenegotiation && iteration == 0 ? 'Cancel' : 'Finish') : 'Send', onClick: triggerFormSubmit, disabled: !isAccepted || isAskedToCancel || readOnly }
    )
  }
  
  /*const termsSchema = {}
  Object.keys(tcValues).map(key => {
    const type = getCardType(key)
    if (type == 'int' || type == 'integer' || type == 'float' || type == 'number') {
      termsSchema[key] = Yup.number().min(0, 'Enter positive value')
    }
  })*/

  return (
    <DealProcessLayout title="Terms and conditions"
      noAccess={permissions.readOnly}
      links={[
        { title: 'Help', onClick: () => onHelpModal(true) },
      ]}
      leftButtons={[
        { title: "Return to Deals", onClick: () => { router.push('/deals'); dispatch(setCommonLoader(true)) } },
        { title: "Chat", onClick: handleChat }
      ]}
      rightButtons={rightButtons}
    >

      {
        isAskedToCancel ?
          <div className="">{isSeller ? 'Buyer' : 'Seller'} is asking to cancel T&amp;C renegotiation.
            <br />Click <strong>Confirm</strong> to reset T&amp;C changes and return to contracted terms.
          </div>
          :
          <>
            <Formik initialValues={getFormValues()} innerRef={formRef} onSubmit={handleSubmit} /*validationSchema={Yup.object().shape(termsSchema)}*/ enableReinitialize >
              {({ values }) => (
                <Form onKeyDown={onKeyDown} className="nothidden">
                  <div className="terms__table">
                    <Sticky mode="top" topOffset={70} >
                      <div className="terms__thead hidden">
                        <div className="terms__th terms__value">{isSeller ? 'Buyer’s offer:' : 'Seller’s offer:'}</div>
                        <div className="terms__th terms__value">{isSeller ? 'Seller’s offer:' : 'Buyer’s offer:'}</div>
                      </div>
                    </Sticky>

                    <div className="terms__tbody">
                      {
                        Object.keys(tcValues).map(key =>
                          
                          <ConditionsCard
                            readOnly={readOnly}
                            key={key}
                            isSeller={isSeller}
                            onAccept={handleValueChange}
                            isOnRenegotiation={isOnRenegotiation}
                            iteration={iteration}
                            contracted={currentTerms?.buyerTerms?.[key] ? currentTerms.buyerTerms[key] : null}
                            name={key}
                            {...tcValues[key]}
                            formatValue={getCardFormatFunction(key)}
                            onReview={setRevized}
                            type={getCardType(key)}
                            options={getCardOptions(key)}
                            className={getCardClass(key)}
                            help={getCardHelp(key)}
                            info={getCardInfo(key)}
                            noComments={noComments}
                            approvedMode={approvedModeValue}
                            isOnPreNegotiation={deal.status == AppDealStatusChoices.TCA}
                          />
                        )
                      }
                    </div>
                    {/*
                      <div className="ghidden">
                        <div>{deal.status}</div>
                        <hr />
                        <h3>fields</h3>
                        <RenderObject object={fields} />
                        <hr />
                        <h3>tcValues</h3>
                        <RenderObject object={tcValues} />
                        <hr />
                        <h3>currentTerms</h3>
                        <RenderObject object={currentTerms} />
                        <hr />
                        <h3>deal.termsAndCond</h3>
                        <RenderObject object={deal.termsAndCond} />
                        <hr />
                        <div>Iteration: {iteration}</div>
                        <div>Renegotiation: {isOnRenegotiation ? 'true' : 'false'}</div>

                        <div>{isAskedToCancel ? 'isAskedToCancel' : '-'}</div>
                      </div>
                    */}
                  </div>
                </Form>
              )}
            </Formik>
            {!isOnRenegotiation && !approvedModeValue &&
              <TermsInfo deal={deal} inspection={tcValues?.['inspectionProgramLevel']?.accepted != 1} />
            }
          </>
      }
    </DealProcessLayout>
  )
}

export default Terms
