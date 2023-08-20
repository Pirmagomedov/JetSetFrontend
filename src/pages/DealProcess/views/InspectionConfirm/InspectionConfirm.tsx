import React, { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router'
import { Form, Formik, FormikProps } from 'formik'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import { 
  Deal, 
  usePrePurchase, 
  AppDealStatusChoices 
} from 'src/generated/graphql'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch } from 'src/store'
import { useClient } from 'urql'
import { useChatButton } from 'src/hooks'
import { DealPermission } from 'src/types'
import './InspectionConfirm.scss'


interface IInspectionConfirm {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
}

const deliveryTexts = {
  title: 'Aircraft Delivery for Pre-Purchase Inspection',
  invitation: 'Confirm the delivery of Aircraft for Inspection',
  question: 'Has the aircraft been delivered?'
} 

const accomplishTexts = {
  title: 'Completion of Pre-Purchase Inspection',
  invitation: 'Confirm the completion of Aircraft Inspection',
  question: 'Has the inspection been completed?'
} 

const InspectionConfirm: React.FC<IInspectionConfirm> = props => {
  const { deal, isSeller, onHelpModal, onReload, permissions } = props
  const currentStatus = deal.status
  const dealId = deal.id
  const content = (currentStatus == AppDealStatusChoices.PDCB) ? deliveryTexts : accomplishTexts
  const [isDisabled, setIsDisabled] = useState<boolean>(true)
  const router = useHistory()
  const formRef = useRef<FormikProps<any>>(null);
  const dispatch: AppDispatch = useDispatch()
  const [, prePurchase] = usePrePurchase()
  const openChat = useChatButton()

  const handleChat = () => {
    openChat(deal.buyer.user.id, deal.seller.user.id, deal.ad)
  }

  const triggerFormSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit()
    }
  }

  const ConfirmValues = [
    {label: 'Yes', value: true},
    {label: 'No', value: false},
  ]

  const onChange = (value: any) => {
    setIsDisabled(value ? false : true)
  }

  const handleMutationResult = (result) => {
    
    const response = result.data.prePurchase
    const runtimeError = response.runtimeError
    if (runtimeError) {
      console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
      dispatch(setCommonLoader(false))
      return false
    }
   
    if (response.success === true) {
      if (currentStatus == AppDealStatusChoices.PDCB) {
        dispatch(setCommonLoader(true))
        router.push('/deals')
      } else {
        dispatch(setCommonLoader(true))
        onReload()
        //router.go(0)  
      }
    }
  }

  const handleSubmit = (values) => {
    if (values.delivered) {
      dispatch(setCommonLoader(true))
      const ppiFlags = currentStatus == AppDealStatusChoices.PDCB ? {
        dealId: dealId,
        aircraftDelivered: true
      } : {
        dealId: dealId,
        inspectionCompleted: true
      }
      prePurchase(ppiFlags).then(handleMutationResult)
    }
  }


  return (
    <DealProcessLayout title={content.title} 
      noAccess={permissions.readOnly}
      links={[
        {title: "Help", onClick: () => onHelpModal(true)}
      ]}
      leftButtons={[
        {title: "Return to Deals", onClick: () => {router.push('/deals'); dispatch(setCommonLoader(true))}},
        {title: "Chat", onClick: handleChat}
      ]}
      rightButtons={[
        {title: "Next", onClick: triggerFormSubmit, disabled: isDisabled },
      ]}
    >
      <Formik initialValues={{}} innerRef={formRef}  onSubmit={handleSubmit} enableReinitialize>
        {({ values }) => (
          <Form className="ic-form">
            <div className="ic-main">
              <div className="ic-main__text">{content.invitation}</div>
              <div className="ic-main__input flex-block">
                <div className="flex-col">{content.question}</div>
                <div className="flex-col">
                  <FormikSelect disabled={permissions.readOnly} className="select select-white" name='delivered' changeHandler={onChange} options={ConfirmValues} placeholder={'---'} />
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </DealProcessLayout>
  )
}

export default InspectionConfirm
