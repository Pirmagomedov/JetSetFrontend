import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { Deal, AppDealStatusChoices, AppUploadedDealFileDocTypeChoices } from 'src/generated/graphql'
import SignNow from 'src/components/SignNow/SignNow'
import { isDocumentSigned, DocumentSignedFlag } from 'src/helper'
import { DealPermission } from 'src/types'

interface IAgreement {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload?: () => void
  permissions: DealPermission
}

const Agreement: React.FC<IAgreement> = React.memo(props => {
  const { deal, isSeller, onHelpModal, permissions } = props
  const currentStatus = deal.status
  const dealId = deal.id
  const router = useHistory()
  const isWASignedFlag = isDocumentSigned(deal, isSeller, AppUploadedDealFileDocTypeChoices.WA)
  const secondSignature = isWASignedFlag === DocumentSignedFlag.companion
  const [alreadySigned, setAlreadySigned] = useState<boolean>(false)

  useEffect(() => {
    if (isWASignedFlag == DocumentSignedFlag.you) {
      setAlreadySigned(true)
    }
  }, [])

  return (
      alreadySigned ?
        <div className="alreadySigned">You already signed this document</div>
        :
        <SignNow 
          title="Amendment to Aircraft Purchase Agreement"
          dealId={dealId} 
          secondSignature={secondSignature}
          permissions={permissions}
          docType="AM"
          onHelpModal={onHelpModal}
          onSuccess={(response) => {
            /*if (response.bothSigned && !isSeller) {
              router.go(0)
            } else {*/
              router.push('/deals')
            //}
          }}
          onBack={() => router.push('/deals')}
        />
    
  )
})

export default Agreement

