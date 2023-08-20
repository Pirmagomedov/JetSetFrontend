import React from 'react'
import { useHistory } from 'react-router'
import { Deal, AppDealStatusChoices } from 'src/generated/graphql'
import SignNow from 'src/components/SignNow/SignNow'
import { DealPermission } from 'src/types'

interface IClosingDocument {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
}

const ClosingDocument: React.FC<IClosingDocument> = React.memo(props => {
  const { deal, isSeller, onHelpModal, onReload, permissions } = props
  const currentStatus = deal.status
  const dealId = deal.id
  const router = useHistory()
  const docType = isSeller ? 'BS' : 'DR'

  return (
    <SignNow 
      title={ isSeller ? "Warranty Bill Of Sale" : "Delivery Receipt" }
      dealId={dealId} 
      docType={docType}
      onHelpModal={onHelpModal}
      permissions={permissions}
      onSuccess={(response) => {
        if (response.bothSigned) {
          //router.go(0)
          onReload()
        } else {
          router.push('/deals')
        }
      }}
      onBack={() => router.push('/deals')}
    />
  )
})

export default ClosingDocument

