import React, { useState, useEffect } from 'react'
import { 
  Deal,
  DealFile,
  useClosing
} from 'src/generated/graphql'
import { useHistory } from 'react-router-dom'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import ConfirmationComponent from 'src/components/ConfirmationComponent/ConfirmationComponent'
import { useDispatch } from 'react-redux'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { 
  useChatButton,
  useDownloadDocument,
  useDownloadLink
} from 'src/hooks'
import { DealPermission } from 'src/types'
import SignNow from 'src/components/SignNow/SignNow'
import './Closing.scss'



interface ISignableConfirmation {
  file: DealFile
  confirmed: boolean
  name: string 
  title: string
  disabled: boolean
  dealId: string
  onConfirm: (name: string) => void
}

const SignableConfirmation: React.FC<ISignableConfirmation> = props => {
  const { file, confirmed, name, title, disabled, dealId, onConfirm } = props
  const { downloading, download } = useDownloadLink(file?.keySigned, file?.bucket, file?.filename)
  const { loading, downloadDocument } = useDownloadDocument(name, name, {dealId})

  const handleDownload = (doc: string) => {
    downloadDocument()
    //window.open(`/docTemplate/${doc}`, '_blank')
  }

  const handleOpen = (doc: string) => {
    if (confirmed) {
      download()
    } else {
      onConfirm(doc)      
    }
  }

  return (
    <ConfirmationComponent 
      confirmed={confirmed} 
      name={name} 
      title={title} 
      onConfirm={handleOpen} 
      onDownload={handleDownload}
      signable
      disabled={disabled}
    />
  )
}




interface IClosing {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload?: () => void
  permissions: DealPermission
}

/*
const closingInit = {
  id: '',
  role: null,
  confirmDelivery: false,
  confirmFullPayment: false,
  confirmWarrantiesAndRecipients: false,
  deRegistrationRequest: null,
  certificateOfAirworthiness: null
}*/


const docs = {
  'WA': 'Warranty Assignment',
  'DR': 'Delivery Receipt',
  'BS': 'Warranty Bill Of Sale',
  'CC': 'Closing Instructions',
  'CF': 'Closing Instructions'
}





interface docKeys {
  WA: boolean
  DR: boolean
  BS: boolean
  CC: boolean
  CF: boolean
}

const initialKeys: docKeys = {WA: false, DR: false, BS: false, CC: false, CF: false}

const getSignedDocuments = (isSeller: boolean, documentsToSign:string[], dealDocuments: DealFile[]):docKeys => {
  const signedDocuments: docKeys = initialKeys
  if (dealDocuments?.length) {
    documentsToSign.forEach(docKey => {
      const doc = dealDocuments.filter(d => d.docType == docKey)
      if (doc.length > 0) {
        signedDocuments[docKey] = ((isSeller && doc[0].sellerSign) || (!isSeller && doc[0].buyerSign))
      }
    })
  }
  return signedDocuments
}

const getAllSignedState = (signed:docKeys, documentsToSign:string[]):boolean => {
  var allSigned = true;
  documentsToSign.forEach(docKey => {
    allSigned = allSigned && signed[docKey]
  })
  return allSigned
}


const Closing: React.FC<IClosing> = props => {
  const { deal, isSeller, onHelpModal, onReload, permissions } = props
  const dealId = deal.id
  const router = useHistory()
  const [ dealDocuments, setDealDocuments ] = useState<DealFile[]>(deal?.documents) 
  const openChat = useChatButton()
  const dispatch = useDispatch()
  const [ , closingMutation ] = useClosing()
  const [ mode, setMode ] = useState<string>(null)
  
  const documentsToSign = 
    isSeller ? 
      ['BS', 'WA', deal?.ad?.termsOfPayment?.currency?.isCrypto ? 'CC' : 'CF']
    :
      ['DR', 'WA', deal?.ad?.termsOfPayment?.currency?.isCrypto ? 'CC' : 'CF']
  const [ signed, setSigned ] = useState<docKeys>(getSignedDocuments(isSeller, documentsToSign, deal?.documents))
  const allSigned = getAllSignedState(signed, documentsToSign)


  useEffect(() => {
    if (dealDocuments?.length) {
      const signedDocuments: docKeys = getSignedDocuments(isSeller, documentsToSign, deal.documents)
      setSigned(signedDocuments)
      setDealDocuments(deal.documents)
    }
  }, [deal?.documents])

  const handleSubmit = () => {
    closingMutation({ dealId }).then(res => {
      if (res.data.closing.success) {
        dispatch(setCommonLoader(true))
        router.push('/deals')
      } else {
        onReload()
      }
    })
    //check if other (!!!, that's why it's ~isSeller) side filled everything
    /*if (preClosingFilled(deal, !isSeller)) {
      //router.go(0)
      onReload()
    } else {
      dispatch(setCommonLoader(true))
      router.push('/deals')
    }*/
  }

  /*const handleMutationResult = (result) => {
    const response = result.data.preClosing
    dispatch(setCommonLoader(false))
    const runtimeError = response.runtimeError
    if (runtimeError) {
      console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
      return false
    }
  }*/

  

  const handleChat = () => {
    openChat(deal.buyer.user.id, deal.seller.user.id, deal.ad)
  }

  const handleReturn = () => {
    dispatch(setCommonLoader(false))
    setMode(null)
  }

  const handleSigned = (response) => {
    //dispatch(setCommonLoader(false))
    onReload()
    setSigned({...signed, [mode]: true})
    setMode(null)
  }

  const handleOpen = (doc: string) => {
      setMode(doc)      
  }


  return (
    mode ?
      <SignNow 
        title={docs[mode]}
        dealId={dealId} 
        secondSignature={!(isSeller || mode == 'DR')}
        docType={mode}
        permissions={permissions}
        onHelpModal={() => {console.log('help me please!')}}
        onSuccess={handleSigned}
        onBack={handleReturn}
      />
    :
      <DealProcessLayout title="Closing documents" 
        noAccess={permissions.readOnly}
        links={[
          {title: "Help", onClick: () => onHelpModal(true)}
        ]}
        leftButtons={[
          {title: "Return to Deals", onClick: () => {router.push('/deals'); dispatch(setCommonLoader(true))}},
          {title: "Chat", onClick: handleChat}
        ]}
        rightButtons={[
          {title: "Next", onClick: handleSubmit, disabled: permissions.readOnly || !allSigned},
        ]}
      >

        <div className="pre-closing__items">
          {
            documentsToSign.map(docKey => 
              <SignableConfirmation 
                file={dealDocuments.filter(d => d.docType == docKey)[0]}
                key={docKey}
                confirmed={signed[docKey]} 
                name={docKey} 
                title={docs[docKey]} 
                onConfirm={handleOpen} 
                dealId={dealId}
                disabled={permissions.readOnly}
              />
            )
          }
        </div>
      </DealProcessLayout>
  )
}

export default Closing
