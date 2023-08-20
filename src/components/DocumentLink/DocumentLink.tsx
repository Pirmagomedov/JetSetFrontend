import React, { useRef, useEffect } from 'react'
import PrivateLink from 'src/components/PrivateLink/PrivateLink'
import Icon from 'src/components/Icon/Icon'
import {
    DealFile,
    AppUploadedDealFileDocTypeChoices,
    FileType,
    UploadedFileType
} from 'src/generated/graphql'
import { UploadedDealFileDocTypeTitle } from 'src/types'
import { formatDate, checkSigned } from 'src/helper'
import './DocumentLink.scss'


interface IDocumentLink {
    name?: string
    disabled?: boolean
    document: DealFile | FileType
}

const getDocumentName = (doc: DealFile): string => {
    if (doc.docType == 'AM') {
        const date = doc.dateCreated
            ? formatDate(new Date(doc.dateCreated))
            : doc.id
        return `AM ${date}`
    }
    return UploadedDealFileDocTypeTitle[doc.docType]
        ? UploadedDealFileDocTypeTitle[doc.docType]
        : doc.docType
}


const clearDocumentName = (name: string): string => {
    const res = name.replace(/[\(\)\%\/\\\[\]]/g,'')
    return res.trim()
}

const DocumentLink: React.FC<IDocumentLink> = React.memo((props) => {
    const { name, disabled, document } = props
    const ref = useRef(false)


    if (!document) {
        return null
    }
    const isDealDocument = 'buyerSign' in document
    const documentName = isDealDocument ? getDocumentName(document) : clearDocumentName(name)
    const documentKey = isDealDocument ? document.keySigned ? document.keySigned : document.key : document.key
    const unsigned = isDealDocument ? !checkSigned(document) : false
    const content = <>{documentName}</>

    if (documentName && documentKey && document.bucket && !unsigned) {
        ref.current = true
        return disabled ?
            <span className="document-link disabled">
                <span className="document-link__icon">
                    <Icon name="i-download" />
                </span>
                {content}
            </span>
            :
            <PrivateLink icon fileName={documentName} fileKey={documentKey} fileBucket={document.bucket} className="document-link">
                {content}
            </PrivateLink>
    }
    return null;
})

export default DocumentLink
