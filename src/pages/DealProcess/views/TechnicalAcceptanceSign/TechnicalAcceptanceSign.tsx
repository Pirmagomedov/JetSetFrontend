import React from 'react'
import { useHistory } from 'react-router'
import { Deal, AppDealStatusChoices } from 'src/generated/graphql'
import SignNow from 'src/components/SignNow/SignNow'
import { DealPermission } from 'src/types'

interface ITechnicalAcceptanceSign {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload?: () => void
  permissions: DealPermission
}

const TechnicalAcceptanceSign: React.FC<ITechnicalAcceptanceSign> = React.memo(props => {
  const { deal, isSeller, onHelpModal, permissions } = props
  const currentStatus = deal.status
  const dealId = deal.id
  const router = useHistory()
  const isWithDiscrepancies = currentStatus === AppDealStatusChoices.TSWCWB
  
  return (
    <SignNow 
      title="Technical Acceptance Letter"
      dealId={dealId} 
      docType="TA"
      permissions={permissions}
      onHelpModal={onHelpModal}
      parameters={{isWithDiscrepancies}}
      onSuccess={() => {
        console.log('SUCCESS!') 
        router.push('/deals')
      }}
      onBack={() => router.push('/deals')}
    />
  )
})

export default TechnicalAcceptanceSign

