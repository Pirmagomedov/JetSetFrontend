import React, { useState } from 'react'
import { AppUploadedFileDocTypeChoicesLabels } from 'src/types'
import { checkSigned } from 'src/helper'
import {
    AdDocuments,
    DealDocuments,
    DealFile,
    FileType,
} from 'src/generated/graphql'
import DocumentLink from 'src/components/DocumentLink/DocumentLink'
import Icon from 'src/components/Icon/Icon'
import Recover from 'src/pages/Recover/Recover'
import './AircraftDocuments.scss'

interface IAircraftDocuments {
    ad?: AdDocuments
    deal?: DealDocuments
    disabled?: boolean
    signed?: boolean
    unsigned?: boolean
    showInfo?: boolean
    title?: string
}

const docOrder = (a, b) => {
    return new Date(a.dateCreated).getTime() > new Date(b.dateCreated).getTime()
        ? 1
        : -1
}

interface IDocument {
    name?: string
    dateCreated?: string
    id: string
    document?: DealFile | FileType
    //dealDocument?: DealFile | FileType
}

const AircraftDocuments: React.FC<IAircraftDocuments> = (props) => {
    const {
        ad,
        deal,
        disabled,
        signed = true,
        unsigned = true,
        showInfo,
        title = false
    } = props
    const [documentCount, setDocumentCount] = useState<number>(0)
    const hasAd = ad ? true : false
    const hasDeal = deal ? true : false
    const preClosingDocuments =
        hasDeal && deal?.preClosing?.length
            ? deal?.preClosing.filter((c) => c.role == 'SELLER')
            : null

    const dealDocuments: IDocument[] = []

    if (hasDeal) {
        deal.documents.forEach((doc) => {
            dealDocuments.push({
                //link: doc.signedLink ? doc.signedLink : doc.link,
                id: doc.id,
                document: doc,
                dateCreated: doc.dateCreated,
            })
        })
        deal?.inspectionReports?.forEach(d => {
            if (d?.file) {
                dealDocuments.push({
                    document: d.file,
                    id: d.file.id,
                    name: 'Inspection report',
                    dateCreated: d.file.dateCreated,
                })
            }
        })
        /*if (deal?.inspectionReports?.[0]?.file) {
            dealDocuments.push({
                document: deal?.inspectionReports[0].file,
                id: deal?.inspectionReports[0].file.id,
                name: 'Inspection report',
                dateCreated: deal?.inspectionReports[0].file.dateCreated,
            })
        }*/
        deal?.discrepanciesRemoval?.files?.forEach(file => {
            if (file) {
                dealDocuments.push({
                    document: file,
                    id: file.id,
                    name: 'Inspection report',
                    dateCreated: file.dateCreated,
                })
            }
        })
        /*if (deal?.discrepanciesRemoval?.files) {
            dealDocuments.push({
                document: deal.discrepanciesRemoval.file,
                id: deal.discrepanciesRemoval.file.id,
                //dateCreated: doc.dateCreated,
                name: 'Release to service',
            })
        }*/
        if (preClosingDocuments?.[0]?.deRegistrationRequest) {
            dealDocuments.push({
                document: preClosingDocuments[0].deRegistrationRequest,
                id: preClosingDocuments[0].deRegistrationRequest.id,
                dateCreated:
                    preClosingDocuments[0].deRegistrationRequest.dateCreated,
                name: 'Deregistration request',
            })
        }
        if (preClosingDocuments?.[0]?.certificateOfAirworthiness) {
            dealDocuments.push({
                document: preClosingDocuments[0].certificateOfAirworthiness,
                id: preClosingDocuments[0].certificateOfAirworthiness.id,
                dateCreated:
                    preClosingDocuments[0].certificateOfAirworthiness
                        .dateCreated,
                name: 'Certificate of airwothiness',
            })
        }
    }

    const getMainInformationDocuments = (docs) => {
        const docTypes = {}
        if (docs?.length) {
            docs.forEach(d => {
                if (docTypes[d.docType]) {
                    docTypes[d.docType].push(d)
                } else {
                    docTypes[d.docType] = [d]
                }
            }) 
            console.log('mainInformationDocuments', docTypes, docs)
            return docTypes
        } 
        return []
    }

    const mainInformationDocuments = getMainInformationDocuments(ad?.mainInformation?.documents)

    return (
        <>
            {title &&
                <h3 className="deal-card__header">
                    {title}
                </h3>
            }
            {showInfo && (
                <div className="aircraft-documents-hint">
                    These documents will be visible only to confirmed buyers who
                    will reserve the aircraft by placing a deposit
                </div>
            )}
            {hasAd && (
                <>
                    {unsigned && (
                        <>
                            
                            { 
                                Object.keys(mainInformationDocuments).map(
                                    (docType, dti) => {
                                        const docs = mainInformationDocuments[docType]
                                        return docs.map((doc, i) => {
                                            const index = i > 0 ? i + 1 : ''
                                            return (
                                                <DocumentLink
                                                    key={doc.id + i}
                                                    disabled={disabled}
                                                    name={`${AppUploadedFileDocTypeChoicesLabels[docType]} ${index}`}
                                                    document={doc}
                                                />
                                            )
                                        })
                                    }

                                )
                            }
                            {ad?.aircraftDocuments?.proofsOfOwnership?.length &&
                                ad.aircraftDocuments.proofsOfOwnership.map(
                                    (doc, i) => {
                                        const index = i > 0 ? i + 1 : ''
                                        return (
                                            <DocumentLink
                                                key={doc.id + i}
                                                disabled={disabled}
                                                name={`Proof of ownership ${index}`}
                                                document={doc}
                                            />
                                        )
                                    },
                                )}
                        </>
                    )}

                    {/*ad?.documents?.length > 0 && signed && 
                ad.documents.sort(docOrder).map((doc, i) => 
                  <DocumentLink 
                    key={'adoc' + i} 
                    name="Public offer" 
                    link={doc.signedLink && !disabled ? doc.signedLink : '/docTemplate/PO'} 
                  />
                )*/}
                </>
            )}
            {hasDeal &&
                dealDocuments.length > 0 &&
                (signed &&
                    dealDocuments.sort(docOrder).map((doc, i) => (
                        <DocumentLink
                            key={'ddoc' + i}
                            disabled={disabled}
                            name={doc.name}
                            //link={doc.link}
                            document={doc.document}
                        />
                    )))
            }
            {/* </div > */}
        </>
    )
}

export default AircraftDocuments
