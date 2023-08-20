import React, { useState, useEffect } from 'react'
import {
  AppUploadedDealFileDocTypeChoices
} from 'src/generated/graphql'
import Text2Pdf from 'src/components/Text2Pdf/Text2Pdf'
import './DealDocumentPreviewLink.scss'
import { useQuery } from 'urql'
import {
  DealPermission,
  documentQueryList,
  UploadedDealFileDocTypeTitle
} from 'src/types'

interface IDealDocumentPreviewLink {
  dealId: string
  docType: AppUploadedDealFileDocTypeChoices
  classname?: string
}

const DealDocumentPreviewLink: React.FC<IDealDocumentPreviewLink> = React.memo(props => {
  const { dealId, docType, classname } = props
  const queryData = documentQueryList[docType]
  const title = UploadedDealFileDocTypeTitle[docType]
  const [text, setText] = useState<string>()

  const [documentResult, executeQuery] = useQuery({
    query: queryData.query,
    variables: { dealId: dealId },
    requestPolicy: 'network-only',
  })


  useEffect(() => {
    if (queryData.name && documentResult?.data?.[queryData.name]) {
      const doc = documentResult?.data?.[queryData.name]
      if (doc?.text && doc.text !== '') {
        setText(doc.text.replace(/{{[^}]*}}/g, ''))
      }
    }
  }, [documentResult])

  return (
    text
      ? <Text2Pdf fileName={title} text={text} className={classname} >View document</Text2Pdf>
      : <div>...</div>
  )
})

export default DealDocumentPreviewLink