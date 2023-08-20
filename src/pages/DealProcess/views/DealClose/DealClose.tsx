import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import { 
  Deal, 
  useClosing, 
  AppDealStatusChoices,
} from 'src/generated/graphql'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch } from 'src/store'
import { useClient } from 'urql'
import { setNotification } from 'src/reducers/notificationReducer'
import ConfirmationComponent from 'src/components/ConfirmationComponent/ConfirmationComponent'
import Modal from 'src/components/Modal/Modal'
import { useChatButton } from 'src/hooks'
import { DealPermission } from 'src/types'



interface IDealClose {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
}

const DealClose: React.FC<IDealClose> = props => {
  const { deal, isSeller, onHelpModal, permissions } = props
  const currentStatus = deal.status
  const dealId = deal.id
  const router = useHistory()
  const dispatch: AppDispatch = useDispatch()
  const [, closingMutation] = useClosing()
  const [ confirmed, setConfirmed] = useState<boolean>(false)
  const [ modalOpen, setModalOpen] = useState<boolean>(false)
  const [ yetAnotherModalOpen, setYamOpen] = useState<boolean>(false)
  const openChat = useChatButton()

  const handleChat = () => {
    openChat(deal.buyer.user.id, deal.seller.user.id, deal.ad)
  }

  const closeDeal = () => {
    dispatch(setCommonLoader(true))
    closingMutation({ dealId })
      .then(res => {
        const response = res.data.closing
        const runtimeError = response.runtimeError
        if (runtimeError) {
          console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
          return false
        }
        if (response.success === true) {
          //router.push('/deals')
          setYamOpen(true)
        }
      })
      .catch(error => console.error(error))
      .finally(() => dispatch(setCommonLoader(false)))
  }

  const handleYamClose = () => {
    dispatch(setCommonLoader(true))
    router.push('/deals')
  }

  const handleConfirmChange = () => {
    setConfirmed(true)
  }


  const handleModalClose = (confirmed: boolean = false) => {
    setModalOpen(false)
    if (confirmed) {
      closeDeal()
    } else {
      router.push('/deals')
    }
  }

  const handleCloseDeal = () => {
    setModalOpen(true)
  }


  return (
    <DealProcessLayout title="Closing the deal"
      noAccess={permissions.readOnly}
      links={[
        {title: "Help", onClick: () => onHelpModal(true)},
      ]}
      leftButtons={[
        {title: "Return to Deals", onClick: () => {router.push('/deals'); dispatch(setCommonLoader(true))}},
        {title: "Chat", onClick: handleChat}
      ]}
      rightButtons={[
        {title: "Close ", onClick: handleCloseDeal, disabled: !confirmed},
      ]}
    >
      <>
        <ConfirmationComponent 
          name="confirmClose" 
          title="Confirm possession of the aircraft" 
          onConfirm={handleConfirmChange} 
        />
        <Modal 
          title="Closing the deal"
          modalIsOpen={modalOpen} 
          onRequestClose={handleModalClose} 
          isCloseIcon={false} 
          buttons={[
            {title: 'Cancel', onClick: () => handleModalClose(false), type: "secondary"},
            {title: 'Confirm', onClick: () => handleModalClose(true)}
          ]} 
        >
          Are you sure you want to compete the deal?
        </Modal>
        <Modal 
          title="The deal has been successfully closed"
          icon="i-success"
          modalIsOpen={yetAnotherModalOpen} 
          onRequestClose={handleYamClose} 
          isCloseIcon={false}
          buttons={[
            {title: 'Close', onClick: handleYamClose }
          ]} >
            <div className="modal__paragraph">You can view and download all related documents in your deals or vault.</div>
            <div className="modal__paragraph">The funds were transferred to the seller’s account.</div>
        </Modal>
      </>
    </DealProcessLayout>
  )
}

export default DealClose
