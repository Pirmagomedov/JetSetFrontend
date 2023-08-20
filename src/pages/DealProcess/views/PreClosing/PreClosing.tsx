import React, { useState, useEffect } from 'react'
import { 
  Deal, 
  PreClosingType, 
  DealPreClosing,
  AppPreClosingRoleChoices, 
  usePreClosing 
} from 'src/generated/graphql'
import { useHistory } from 'react-router-dom'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import ConfirmationComponent from 'src/components/ConfirmationComponent/ConfirmationComponent'
import FileUploadComponent from 'src/components/FileUploadComponent/FileUploadComponent'
import { preClosingFilled } from 'src/helper'
import { useDispatch } from 'react-redux'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { useChatButton } from 'src/hooks'
import './PreClosing.scss'
import { DealPermission } from 'src/types'

interface IPreClosing {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload?: () => void
  permissions: DealPermission
}


const preClosingInit = {
  id: '',
  role: null,
  confirmDelivery: false,
  confirmFullPayment: false,
  confirmWarrantiesAndRecipients: false,
  deRegistrationRequest: null,
  certificateOfAirworthiness: null
}


const PreClosing: React.FC<IPreClosing> = React.memo(props => {
  const { deal, isSeller, onHelpModal, onReload, permissions } = props
  const dealId = deal.id
  const [preClosingValues, setPreClosingValues] = useState<DealPreClosing>(preClosingInit)
  const router = useHistory()
  const [, preClosingMutation] = usePreClosing()
  const openChat = useChatButton()
  const dispatch = useDispatch()

  useEffect(() => {
    if (deal?.preClosing.length) {
      deal.preClosing.forEach(d => {
        if (isSeller && d.role == AppPreClosingRoleChoices.SELLER || !isSeller && d.role == AppPreClosingRoleChoices.BUYER ) {
          setPreClosingValues(d)
        } 
      })
    }

  }, [deal])

  const handleSubmit = () => {
    //check if other (!!!, that's why it's ~isSeller) side filled everything
    if (preClosingFilled(deal, !isSeller) && isSeller) {
      //router.go(0)
      onReload()
    } else {
      dispatch(setCommonLoader(true))
      router.push('/deals')
    }
  }

  const handleMutationResult = (result) => {
    const response = result.data.preClosing
    dispatch(setCommonLoader(false))
    const runtimeError = response.runtimeError
    if (runtimeError) {
      console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
      return false
    }
  }

  const handleConfirmChange = (name: string, value: boolean) => {
    const preClosingData = {
      dealId: dealId,
      preClosing: {}
    } 
    preClosingData.preClosing[name] = value;
    preClosingMutation(preClosingData).then(handleMutationResult)
  }

  const handleFileChange = (name: string, fileId: number) => {
    const preClosingData = {
      dealId: dealId,
      preClosing: {}
    } 
    preClosingData.preClosing[name] = fileId;
    dispatch(setCommonLoader(true))
    preClosingMutation(preClosingData).then(handleMutationResult)
  }

  const handleChat = () => {
    openChat(deal.buyer.user.id, deal.seller.user.id, deal.ad)
  }

  return (
    <DealProcessLayout title="Pre-Closing obligations" 
      noAccess={permissions.readOnly}
      links={[
        {title: "Help", onClick: () => onHelpModal(true)}
      ]}
      leftButtons={[
        {title: "Return to Deals", onClick: () => {router.push('/deals'); dispatch(setCommonLoader(true))}},
        {title: "Chat", onClick: handleChat}
      ]}
      rightButtons={[
        {title: "Next", onClick: handleSubmit, disabled: permissions.readOnly},
      ]}
    >
      {
        isSeller ? (
          <div className="pre-closing__items">
            <ConfirmationComponent 
              confirmed={preClosingValues.confirmDelivery} 
              name="confirmDelivery" 
              title="Confirm the delivery of the Aircraft to Delivery location" 
              onConfirm={handleConfirmChange} 
              disabled={permissions.readOnly}
            />
            <FileUploadComponent 
              file={preClosingValues?.deRegistrationRequest}
              name="deRegistrationRequestId" 
              title="Upload a signed de-registration request" 
              onConfirm={handleFileChange} 
              disabled={permissions.readOnly}
            />
            <FileUploadComponent 
              file={preClosingValues?.certificateOfAirworthiness}
              name="certificateOfAirworthinessId" 
              title="Upload Certificate of Airworthiness" 
              onConfirm={handleFileChange} 
              disabled={permissions.readOnly}
            />
            <ConfirmationComponent 
              confirmed={preClosingValues.confirmWarrantiesAndRecipients} 
              name="confirmWarrantiesAndRecipients" 
              title="Confirm Seller's Warranties and Representations" 
              onConfirm={handleConfirmChange} 
              disabled={permissions.readOnly}
            />
            <ConfirmationComponent 
              confirmed={preClosingValues.confirmFullPayment} 
              name="confirmFullPayment" 
              title="Purchaser has paid all the costs due by it in accordance with the Aircraft Purchase agreement" 
              onConfirm={handleConfirmChange} 
              disabled={permissions.readOnly}
            />
          </div>
        )
        :
        (
          <div className="pre-closing__items">
            <ConfirmationComponent 
              confirmed={preClosingValues.confirmDelivery} 
              name="confirmDelivery" 
              title="Confirm the delivery of the Aircraft to Delivery location" 
              onConfirm={handleConfirmChange} 
              disabled={permissions.readOnly}
            />
            <ConfirmationComponent 
              confirmed={preClosingValues.confirmWarrantiesAndRecipients} 
              name="confirmWarrantiesAndRecipients" 
              title="Confirm Purchaser's Warranties and Representations" 
              onConfirm={handleConfirmChange} 
              disabled={permissions.readOnly}
            />
            <ConfirmationComponent 
              confirmed={preClosingValues.confirmFullPayment} 
              name="confirmFullPayment" 
              title="Seller has paid all the costs due by it in accordance with the Aircraft Purchase agreement" 
              onConfirm={handleConfirmChange} 
              disabled={permissions.readOnly}
            />
          </div>
        )
      }
    </DealProcessLayout>
  )
})

export default PreClosing
