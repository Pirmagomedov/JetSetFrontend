import React, { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Icon from 'src/components/Icon/Icon'
import { Deal, useDiscrepanciesRemoval, AppDealStatusChoices } from 'src/generated/graphql'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import FileLink from 'src/components/FileLink/FileLink'
import { useChatButton } from 'src/hooks'
import { DealPermission } from 'src/types'
import './DiscrepanciesRemovalAccept.scss'

interface IDiscrepanciesRemovalAccept {
  deal: Deal
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
}


const DiscrepanciesRemovalAccept: React.FC<IDiscrepanciesRemovalAccept> = React.memo(props => {
  const { deal, onHelpModal, onReload, permissions } = props
  const dealId = deal.id

  const router = useHistory()
  const dispatch = useDispatch()
  const releaseToServiceReport = deal?.discrepanciesRemoval?.files
  const comments = deal?.discrepanciesRemoval?.discrepanciesComments
  const openChat = useChatButton()

  const handleChat = () => {
    openChat(deal.buyer.user.id, deal.seller.user.id, deal.ad)
  }

  const [, discrepanciesRemoval] = useDiscrepanciesRemoval()

  const handleAccept = async () => {
    dispatch(setCommonLoader(true))
    discrepanciesRemoval({dealId: dealId}).then(res => {
      if (res?.data?.discrepanciesRemoval.success) {
        router.push('/deals')
        //onReload()
        //router.go(0)
      }
    })
  }


  return (
    <DealProcessLayout title="Discrepancies removal" 
      noAccess={permissions.readOnly}
      links={[
        {title: "Help", onClick: () => onHelpModal(true)}
      ]}
      leftButtons={[
        {title: "Return to Deals", onClick: () => {router.push('/deals'); dispatch(setCommonLoader(true))}},
        {title: "Chat", onClick: handleChat}
      ]}
      rightButtons={[
        {title: "Accept", disabled: permissions.readOnly , onClick: () => {handleAccept()}},
      ]}
    >
      <div className="deal__content__with-sidebar sidebar-right">
        <div className="deal__content__main">
          <div className="state-message state-message-good">
            <div className="state-message__icon"><Icon name="accepted" /></div>
            <div className="state-message__text">The Seller has uploaded the Release To Service report.</div>
          </div>
          {
            !!comments &&
            <div className="deal__content-comment">
              <div className="deal__content-comment__title">Seller's comment</div>
              <div className="deal__content-comment__comment">{comments}</div>
            </div>
          }
        </div>
        <div className="deal__content__sidebar">  
          <div className="sidebar__title">Release To Service Report</div>
          <div className="sidebar__items">
            {releaseToServiceReport &&
              releaseToServiceReport.map(file =>
                <FileLink key={file.filename} onView={() => console.log('view file')} filename={file.filename} file={file}  />
              )
            }
          </div>
        </div>
      </div>
    </DealProcessLayout>
  )
})

export default DiscrepanciesRemovalAccept
