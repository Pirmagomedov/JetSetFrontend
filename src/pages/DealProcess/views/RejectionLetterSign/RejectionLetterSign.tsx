import React from 'react'
import { useHistory } from 'react-router'
import { Deal, AppDealStatusChoices } from 'src/generated/graphql'
import SignNow from 'src/components/SignNow/SignNow'
import { DealPermission } from 'src/types'


interface IRejectionLetterSign {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload?: () => void
  permissions: DealPermission
}

const RejectionLetterSign: React.FC<IRejectionLetterSign> = React.memo(props => {
  const { deal, isSeller, onHelpModal, permissions } = props
  const currentStatus = deal.status
  const dealId = deal.id
  const router = useHistory()
  const isWithDiscrepancies = currentStatus === AppDealStatusChoices.TSWCWB
  
  return (
    <SignNow 
      title="Rejecton Letter"
      dealId={dealId} 
      docType="RL"
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

export default RejectionLetterSign

