import React from 'react'
import { useHistory } from 'react-router'
import { Deal, AppDealStatusChoices} from 'src/generated/graphql'
import SignNow from 'src/components/SignNow/SignNow'
import { DealPermission } from 'src/types'

interface IAgreement {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload?: () => void
  permissions: DealPermission
}

const Agreement: React.FC<IAgreement> = React.memo(props => {
  const { deal, isSeller, onHelpModal, onReload, permissions } = props
  const currentStatus = deal.status
  const dealId = deal.id
  const router = useHistory()

  return (
    <SignNow 
      title="Aircraft Purchase Agreement"
      dealId={dealId} 
      secondSignature={currentStatus == AppDealStatusChoices.AWB}
      docType="PA"
      permissions={permissions}
      onHelpModal={onHelpModal}
      onSuccess={() => {
        if (currentStatus === AppDealStatusChoices.AWB) {
          onReload() //reload location
          //router.go(0)
        } else {
          router.push('/deals')
        }
      }}
      onBack={() => router.push('/deals')}
    />
  )
})

export default Agreement

