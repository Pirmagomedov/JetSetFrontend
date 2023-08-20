import React from 'react'
import { useHistory } from 'react-router'
import { Deal, AppDealStatusChoices } from 'src/generated/graphql'
import SignNow from 'src/components/SignNow/SignNow'
import { DealPermission } from 'src/types'

interface IClosingInstructions {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
}

const ClosingInstructions: React.FC<IClosingInstructions> = React.memo(props => {
  const { deal, isSeller, onHelpModal, onReload, permissions } = props
  const currentStatus = deal.status
  const dealId = deal.id
  const router = useHistory()
  const docType = deal?.ad?.termsOfPayment?.currency?.isCrypto ? 'CC' : 'CF'

  return (
    <SignNow 
      title={"Closing instructions"}
      dealId={dealId} 
      docType={docType}
      permissions={permissions}
      onHelpModal={onHelpModal}
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

export default ClosingInstructions

