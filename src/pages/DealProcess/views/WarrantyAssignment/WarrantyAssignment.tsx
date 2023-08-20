import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { 
  Deal, 
  AppDealStatusChoices,
  AppUploadedDealFileDocTypeChoices
} from 'src/generated/graphql'

import SignNow from 'src/components/SignNow/SignNow'
import { isDocumentSigned, DocumentSignedFlag } from 'src/helper'
import { DealPermission } from 'src/types'

interface IWarrantyAssignment {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
}


const WarrantyAssignment: React.FC<IWarrantyAssignment> = React.memo(props => {
  const { deal, isSeller, onHelpModal, onReload, permissions } = props
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
    <>
    {
      alreadySigned ?
        <div className="alreadySigned">You already signed this document</div>
        :
        <SignNow 
          title="Warranty Assignment"
          dealId={dealId} 
          secondSignature={secondSignature}
          docType="WA"
          permissions={permissions}
          onHelpModal={onHelpModal}
          onSuccess={(response) => {
            if (response.bothSigned && !isSeller) {
              onReload()
              //router.go(0)
            } else {
              router.push('/deals')
            }
          }}
          onBack={() => router.push('/deals')}
        />
    }
    </>
  )
})

export default WarrantyAssignment
