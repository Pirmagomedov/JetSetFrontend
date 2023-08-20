import {
    DealHelper,
    Deal,
    DealDocuments,
    WorkspaceView,
    UploadedFileType,
    AppPreClosingRoleChoices,
    AppWorkspaceRoleChoices,
    PreClosingType,
    DealPreClosing,
    WorkspaceKyc,
    ProfileKyc,
    WorkspaceShort,
    AppUploadedDealFileDocTypeChoices,
    DealFile,
    AppInitialDealStepStepChoices,
    FireblocksAccountType,
    Currency,
    AdCard,
    TermsAndConditionsInput,
    useTermsAndConditions,
    useMyProfile,
    TermsAndConditionsAction,
    FireblocksProfile,
    AppDealStatusChoices,
    AppPermissionsRoleChoices,
    Permission,
    DealStatus,
    DocSigns,
    DealShort,
} from './generated/graphql'
//import { useQuery } from 'urql'
import { format } from 'date-fns'
import { useHistory } from 'react-router-dom'
import { ProductStatus, AdStatus } from './types'
//import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

/**
 * Prevent default helper
 *
 * @param e - event object
 * @param fn - function to execute
 */

export const pd = (e: any, fn: any): void => {
    e.preventDefault()
    fn()
}

/**
 * Format price
 *ЗС
 * @param price - price
 * @returns formatted price
 */

export const formatPrice = (price: string | number = '', digits = 2, isPrice: boolean = false): string => {
    //return parseFloat(price?.toString()).toLocaleString('ru')
    return formatCurrency(parseFloat(price?.toString()), digits = 2, isPrice)
}

export const formatPriceNullable = (price: string | number = '', digits = 2, isPrice: boolean = false): string => {
    if (price === '' || price === null) return ''
    return formatPrice(price, digits, isPrice)
}

export const formatCurrency = (amount: number, digits: number = 2, isPrice: boolean = false): string => {
    if (isPrice) {
        // console.log('amount', amount)
        const numberFormat1 = new Intl.NumberFormat("de-DE");
        const options = numberFormat1.resolvedOptions();
        options.minimumFractionDigits = 0;
        const string = amount.toLocaleString("ru-RU", options);
        // console.log('string', string)
        return string
    }
    else {
        return (Math.round(amount * 100) / 100)
        .toFixed(2)
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
        .replace('.00', '')
    }
}

export const formatDate = (date: Date): string => {
    return format(date, 'yyyy/MM/dd')
}

/**
 * File to base64
 *
 * @param file - File to converting
 * @returns - Base64 string
 */

export const fileToBase64 = (file: File): Promise<string | ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            resolve(reader.result)
        }
        reader.onerror = (e) => {
            reject(e)
        }
    })
}

/**
 * Get chain and address from web3
 *
 * @param chains list of chains
 * @returns chain and address
 */
/*export const getWeb3 = async (): Promise<[number, string, string]> => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum)
    const chainId = await web3.eth.net.getId()
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const address = accounts[0]

    if(address === undefined) {
      return [null, null, "Metamask isn't connected"]
    }

    return [chainId, address, null]
  } else {
    return [null, null, "Metamask isn't installed"]
  }
}*/

export interface calendarArrayAction {
    name: string
    id: string
    date: Date
    expectedDate: Date
    expectedStepDate: Date
    classes: string[]
    passed: boolean
    days: number
    joinedDays: boolean
    overDue: boolean
    isFixed: boolean
    isCurrent: boolean
}

export interface calendarArrayStep {
    name: string
    id: string
    actions: calendarArrayAction[]
    expectedDate: Date
    expectedStepDate: Date
    date: Date
    isPassed: boolean
    isCurrent: boolean
    isExcluded: boolean
}

/**
 * Get calendar renderable array from deal steps
 *
 * @param deal array of Deal
 * @returns renderable array of some type
 */

export const getCalendarArray = (deal: Deal): calendarArrayStep[] => {
    const steps = deal?.steps
    const calendarArray = []

    const currentStep = deal?.currentStep
    const currentAction = deal?.currentAction
    const hasCurrentStep = currentStep ? true : false
    const hasCurrentAction = currentAction ? true : false
    let beforeCurrent = true

    const initialDate = steps?.[0]?.actions?.[0]?.initialDate
        ? steps[0]?.actions[0]?.initialDate
        : new Date()
    let dateArrow = new Date(initialDate)
    let dateExpected = new Date(initialDate)
    let lastPassed = true

    const dateAdd = (days) => {
        dateArrow?.setDate(dateArrow?.getDate() + days)
    }

    const expectedAdd = (days) => {
        dateExpected?.setDate(dateExpected?.getDate() + days)
    }

    const isStepExcluded = (step) => {
        const isInspectionSkipped =
            deal?.termsAndCond?.buyerTerms?.inspectionProgramLevel == 1 &&
            deal?.termsAndCond?.sellerTerms?.inspectionProgramLevel == 1

        switch (step) {
            case 'PPI':
                return isInspectionSkipped
            case 'TA':
                return isInspectionSkipped
            case 'DR':
                return deal?.discrepanciesRemoval === null
        }

        return false
    }

    steps?.map((step) => {
        const stepItem: calendarArrayStep = {
            name: step?.initialStep?.name,
            actions: [],
            expectedDate: null,
            expectedStepDate: null,
            date: null,
            isPassed: true,
            id: step?.id,
            isCurrent: false,
            isExcluded: isStepExcluded(step?.initialStep?.step),
        }

        if (step?.days) {
            dateAdd(step?.days)
            expectedAdd(step?.days)
        }

        step?.actions?.map((action) => {
            if (action?.actualDate) {
                dateArrow = new Date(action?.actualDate)
            } else {
                if (action?.days) dateAdd(action?.days)
            }

            expectedAdd(action?.days)

            const isPassed =
                action?.actualDate ||
                step?.initialStep?.step == AppInitialDealStepStepChoices.NR
                    ? true
                    : false
            const actionItem: calendarArrayAction = {
                name: action?.initialAction?.name,
                date: new Date(dateArrow),
                expectedDate: new Date(dateExpected),
                expectedStepDate: new Date(
                    dateArrow.getTime() + action?.days * 24 * 60 * 60 * 1000,
                ),
                classes: ['calendar-action'],
                passed: isPassed,
                id: action?.initialAction?.action,
                days: action?.days ? action?.days : step?.days,
                joinedDays: action?.days ? false : true,
                overDue: dateArrow > dateExpected,
                isFixed: action?.initialAction?.isStable,
                isCurrent: false,
            }

            stepItem.isPassed = stepItem?.isPassed && isPassed ? true : false

            if (isPassed) {
                actionItem.classes.push('passed')
            }

            if (
                !action?.days &&
                !step?.days &&
                step?.initialStep?.step !== AppInitialDealStepStepChoices.NR
            ) {
                actionItem.classes.push('probable')
            }
            stepItem.date = new Date(dateArrow)
            stepItem.expectedDate = new Date(dateExpected)
            //stepItem.expectedStepDate = new Date(dateArrow.getTime() + stepItem.days * 24 * 60 * 60 * 1000),

            if (hasCurrentAction) {
                if (action?.id == currentAction?.id) {
                    actionItem.isCurrent = true
                }
            }

            stepItem.actions.push(actionItem)
        })

        if (hasCurrentStep) {
            if (beforeCurrent) {
                if (currentStep?.id == step.id) {
                    stepItem.isCurrent = true
                    stepItem.isPassed = false
                    beforeCurrent = false
                } else {
                    stepItem.isPassed = true
                }
            } else {
                stepItem.isPassed = false
            }
        } else {
            if (stepItem?.isPassed) {
                //dirty hack for actualDate instability
                for (var i = 0; i < calendarArray.length; i++) {
                    calendarArray[i].isPassed = true
                    calendarArray[i].isCurrent = false
                }
            }

            if (stepItem?.isPassed !== lastPassed) {
                stepItem.isCurrent = true
                //dirty hack for actualDate instability
                for (var i = 0; i < calendarArray.length; i++) {
                    calendarArray[i].isCurrent = false
                }
            }
        }
        lastPassed = stepItem.isPassed
        calendarArray.push(stepItem)
    })
    return calendarArray
}

export const getCurrentCalendarStep = (
    steps: calendarArrayStep[],
): calendarArrayStep => {
    for (var s = steps?.length - 1; s >= 0; s--) {
        if (steps[s]?.isCurrent) return steps[s]
    }
    return steps[steps?.length - 1]
}

interface IJitoResult {
    status: boolean
    error_code: string
}

export const jetoWall_it = (): Promise<IJitoResult> => {
    return new Promise((resolve, reject) => {
        resolve({
            status: true,
            error_code: '0',
        })
    })
}

export const templateFilter = (html: string): string => {
    var code = html

    const filterTemplateTag = (tag) => {
        var tagFixed = tag
            .replaceAll(/<[^>]*>/g, '')
            .replaceAll('&quot;', '"')
            .replaceAll(/[\s\n]{1,}/g, ' ')
        return tagFixed
    }

    const quoteFilterTag = (tag) => {
        var tagFixed = tag.replaceAll('&quot;', "'").replace('\\n', ' ')
        if (tagFixed.match(/<br.*style="page-break/)) {
            tagFixed =
                '<div clear="all" style="page-break-before:always"></div>'
        }
        return tagFixed
    }

    code = code.replaceAll(/\{(\{|%)[^}%]*(%|\})\}/g, filterTemplateTag)
    code = code.replaceAll(/<[^>]*>/g, quoteFilterTag)

    if (window && window.document) {
        const iframe = document.createElement('iframe')
        document.body.appendChild(iframe)
        iframe.contentWindow.document.open()
        iframe.contentWindow.document.write(code)
        iframe.contentWindow.document.close()
        code = iframe.contentWindow.document.documentElement.innerHTML
        iframe.remove()
    }
    //code = code.replace(/(?<=\{([^\{\}]*))\<[^\>]*\>(?=([^\{\}]*)\})/,'')

    console.log('code', code)
    return code
}

export const getProductStatus = (
    adStatus: AdStatus,
    isBuyer: boolean = false,
): ProductStatus => {
    switch (adStatus) {
        case AdStatus.DRAFT:
            return ProductStatus.DRAFT
        case AdStatus.MODERATION:
            return ProductStatus.MODERATION
        case AdStatus.AWAITS_TOKENIZATION:
            return ProductStatus.AWAITS_TOKENIZATION
        case AdStatus.ON_TOKENIZATION:
            return ProductStatus.ON_TOKENIZATION
        case AdStatus.TOKENIZED:
            return ProductStatus.TOKENIZED
        case AdStatus.ON_PUBLISHING:
            return ProductStatus.ON_PUBLISHING
        case AdStatus.PUBLISHED:
            return ProductStatus.PUBLISHED
        case AdStatus.RESERVED:
            return ProductStatus.RESERVED
        case AdStatus.IN_TRANSACTION:
            return ProductStatus.IN_TRANSACTION
        case AdStatus.SOLD:
            return isBuyer ? ProductStatus.ACQUIRED : ProductStatus.SOLD
    }

    return ProductStatus.IN_TRANSACTION
}

export const isEmpty = (value: any): boolean => {
    return (
        value === undefined /*|| isNaN(value)*/ ||
        value === '' ||
        value === null ||
        (typeof value == 'string' && value.trim() === '')
    )
}

export const areEqual = (value1: any, value2: any) => {
    if (
        value1?.constructor?.name == 'Date' ||
        value2?.constructor?.name == 'Date'
    ) {
        if (formatDate(new Date(value1)) == formatDate(new Date(value2)))
            return true
    }
    return value1 == value2 || +value1 == +value2
}

export const isNumeric = (value) => {
    return /^-?\d+$/.test(value)
}

export const preClosingFilled = (
    deal: DealDocuments,
    isSeller: boolean,
): boolean => {
    let pcd: DealPreClosing
    deal.preClosing.forEach((d) => {
        if (
            (isSeller && d.role == AppPreClosingRoleChoices.SELLER) ||
            (!isSeller && d.role == AppPreClosingRoleChoices.BUYER)
        ) {
            pcd = d
        }
    })
    if (isSeller) {
        return (
            pcd.confirmDelivery &&
            pcd.confirmFullPayment &&
            pcd.confirmWarrantiesAndRecipients &&
            pcd.deRegistrationRequest !== null &&
            pcd.certificateOfAirworthiness !== null
        )
    } else {
        return (
            pcd.confirmDelivery &&
            pcd.confirmFullPayment &&
            pcd.confirmWarrantiesAndRecipients
        )
    }
    return false
}

export const unique = (array: any[]): any[] => {
    return array.filter((value, index, self) => self.indexOf(value) === index)
}

export const getMyPreClosing = (
    deal: DealDocuments,
    isSeller: boolean,
): DealPreClosing | null => {
    if (deal?.preClosing?.length) {
        const preClosing = deal.preClosing.filter(
            (p) => p.role == (isSeller ? 'SELLER' : 'BUYER'),
        )
        if (preClosing?.length == 1) {
            return preClosing[0]
        }
    }
    return null
}

export const hasDealAccess = (
    deal: DealHelper,
    isSeller: boolean,
    strict: boolean = false,
): boolean => {
    if (!strict) {
        if (deal?.isOnTermsAndConditions || deal?.status == AppDealStatusChoices.TCA) {
            if (deal?.termsAndCond?.isOnDocument) {
                const isSigned = isDocumentSigned(
                    deal,
                    isSeller,
                    AppUploadedDealFileDocTypeChoices.AM,
                )
                return (
                    isSigned == DocumentSignedFlag.companion ||
                    isSigned == DocumentSignedFlag.none ||
                    isSigned == DocumentSignedFlag.both
                )
            }
            if (deal?.termsAndCond?.turn == 'SELLER') {
                return isSeller
            } else {
                return !isSeller
            }
        }
    }

    switch (deal?.status) {
        case AppDealStatusChoices.RWB:
            return !isSeller
            break
        case AppDealStatusChoices.BWR:
            return false
            break
        case AppDealStatusChoices.BWRT:
            return false
            break
        case AppDealStatusChoices.TCWB:
            return !isSeller
            break
        case AppDealStatusChoices.TCWS:
            return isSeller
            break
        case AppDealStatusChoices.AWS:
            return isSeller
            break
        case AppDealStatusChoices.AWB:
            return !isSeller
            break
        case AppDealStatusChoices.PDWB:
            return !isSeller
            break
        case AppDealStatusChoices.FARS:
            return isSeller
            break
        case AppDealStatusChoices.PDWS:
            return isSeller
            break
        case AppDealStatusChoices.PDCB:
        case AppDealStatusChoices.PCB:
        case AppDealStatusChoices.PUWB:
            return !isSeller
            break
        case AppDealStatusChoices.RWSB:
            return !isSeller
            break
        case AppDealStatusChoices.TSNCWB:
        case AppDealStatusChoices.TSWCWB:
            return !isSeller
            break
        case AppDealStatusChoices.FAWCS:
        case AppDealStatusChoices.FANCS:
            return isSeller
            break
        case AppDealStatusChoices.RDS:
            return isSeller
            break
        case AppDealStatusChoices.RDB:
            return !isSeller
            break
        case AppDealStatusChoices.BWAWC:
            return false
            break
        case AppDealStatusChoices.BWANC:
            return false
            break
        /*case AppDealStatusChoices.DRTCWS:
      return isSeller
      break*/
        /*case AppDealStatusChoices.DRTCWB:
      return !isSeller
      break*/
    case AppDealStatusChoices.DRWS:
      return isSeller
      break
    case AppDealStatusChoices.DRAB:
      return !isSeller
      break
    case AppDealStatusChoices.FPWB:
      return !isSeller
      break
    case AppDealStatusChoices.BWFP:
      return false
      break
    case AppDealStatusChoices.CDWS:
      return isSeller
      break
    case AppDealStatusChoices.CDWB:
      return !isSeller
      break
    case AppDealStatusChoices.PCWP:
      return !preClosingFilled(deal, isSeller)
      break
    /*case AppDealStatusChoices.CDWP:
      if (isSeller) {
        return isDocumentSigned(deal, isSeller, AppUploadedDealFileDocTypeChoices.BS) != DocumentSignedFlag.you 
      } else {
        return isDocumentSigned(deal, isSeller, AppUploadedDealFileDocTypeChoices.DR) != DocumentSignedFlag.you
      }
      break
    case AppDealStatusChoices.CWWP:
      return isDocumentSigned(deal, isSeller, AppUploadedDealFileDocTypeChoices.WA) != DocumentSignedFlag.you
      break*/
        /*case AppDealStatusChoices.CCWB:
      return !isSeller
      break*/
        /*case AppDealStatusChoices.CIWP:
      if (deal.ad.termsOfPayment.currency.isCrypto) {
        return isDocumentSigned(deal, isSeller, AppUploadedDealFileDocTypeChoices.CC) != DocumentSignedFlag.you
      } else {
        return isDocumentSigned(deal, isSeller, AppUploadedDealFileDocTypeChoices.CF) != DocumentSignedFlag.you
      }
      
      break*/
        case AppDealStatusChoices.CCWA:
            return false
            break
        case AppDealStatusChoices.DC:
            return false
            break
        case AppDealStatusChoices.DR:
            return false
            break
        case AppDealStatusChoices.BWIT:
            return false
            break
    }
    return false
}

export const getStateRelativeIndex = (state: AppDealStatusChoices) => {
    switch (state) {
        case AppDealStatusChoices.TCWB:
            return 1
        case AppDealStatusChoices.TCWS:
            return 2        
        case AppDealStatusChoices.RWB:
            return 3
        // Вступаем в сделку с этого этапа (BLOCKCHAIN_WAITING_RESERVE)
        case AppDealStatusChoices.BWR:
            return 4
        case AppDealStatusChoices.TCA:
            return 8
        case AppDealStatusChoices.AWS:
            return 10
        case AppDealStatusChoices.AWB:
            return 11
        case AppDealStatusChoices.PDWB:
            return 15
        case AppDealStatusChoices.RDS:
            return 16
        case AppDealStatusChoices.PDWS:
            return 17
        case AppDealStatusChoices.PDCB:
            return 18
        case AppDealStatusChoices.PCB:
            return 19
        case AppDealStatusChoices.PUWB:
            return 20
        case AppDealStatusChoices.RWSB:
            return 25
        case AppDealStatusChoices.TSNCWB:
            return 40
        case AppDealStatusChoices.TSWCWB:
            return 41
        case AppDealStatusChoices.FAWCS:
            return 45
        case AppDealStatusChoices.FANCS:
            return 46
        case AppDealStatusChoices.BWAWC:
            return 50
        case AppDealStatusChoices.BWANC:
            return 51
        //case AppDealStatusChoices.DRTCWS: return 55
        //case AppDealStatusChoices.DRTCWB: return 56
        case AppDealStatusChoices.DRWS:
            return 60
        case AppDealStatusChoices.DRAB:
            return 61
        case AppDealStatusChoices.FPWB:
            return 65
        case AppDealStatusChoices.BWFP:
            return 70
        case AppDealStatusChoices.PCWP:
            return 75
        /*case AppDealStatusChoices.CDWP: return 80
    case AppDealStatusChoices.CWWP: return 90*/
        //case AppDealStatusChoices.CCWB: return 100
        //case AppDealStatusChoices.CIWP: return 105
        case AppDealStatusChoices.CCWA:
            return 106
        case AppDealStatusChoices.DR:
            return 110
        case AppDealStatusChoices.DC:
            return 111
        case AppDealStatusChoices.BWIT:
            return 777
            return 1000
    }
}

export const isBlockchainHoldingTheDeal = (status: AppDealStatusChoices) => {
    return (
        status == AppDealStatusChoices.BWR ||
        status == AppDealStatusChoices.BWANC ||
        status == AppDealStatusChoices.BWFP ||
        status == AppDealStatusChoices.BWIT ||
        status == AppDealStatusChoices.BWRT ||
        status == AppDealStatusChoices.BWAWC
    )
}

//export const getWorkspaceProperties(workspace)

export const getBalance = (
    account: FireblocksProfile,
    currency: string,
): number => {
    var balance = 0
    if (account.fireblocksAssets) {
        account.fireblocksAssets.forEach((asset) => {
            if (asset.currency.fullName == currency) {
                balance = asset.total
            }
        })
    }
    return balance
}

export const templateTagValidator = (text: string): string[] => {
    const tags = [...text.matchAll(/\{\% [^%]*\%\}/g)]
    var elifError = false
    var elseError = false
    var result = []
    var ifOpen = 0

    tags.forEach((tagFound) => {
        const tag = tagFound[0]
        if (tag.match(/{%\s*(if|IF)/)) {
            ifOpen++
        }
        if (tag.match(/{%\s*(endif|ENDIF)/)) {
            ifOpen--
        }
        if (tag.match(/{%\s*(elif|ELIF)/)) {
            if (ifOpen <= 0) elifError = true
        }
        if (tag.match(/{%\s*(else|ELSE)/)) {
            if (ifOpen <= 0) elseError = true
        }
    })
    if (ifOpen > 0) result.push('Missing {% endif %} tag')
    if (ifOpen < 0) result.push('Missing {% if... %} tag')
    if (elifError) result.push('Redundand {% elif %} tag')
    if (elseError) result.push('Redundand {% else %} tag')

    return result
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, _) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const result = reader.result
            if (result instanceof ArrayBuffer) {
                const stringResult = String.fromCharCode.apply(
                    null,
                    new Uint16Array(result),
                )
                resolve(stringResult)
            } else if (typeof result === 'string') {
                resolve(result)
            }
        }
        reader.readAsDataURL(blob)
    })
}

export const useTermsAndConditionsRenegotiate = () => {
    const [, termsAndConditions] = useTermsAndConditions()
    const router = useHistory()

    const callback = (dealId: string) => {
        termsAndConditions({
            dealId: dealId,
            action: TermsAndConditionsAction.INITIAL,
        })
            .then((res) => {
                router.push(`/deal-process/${dealId}`)
            })
            .catch((error) => console.error(error))
    }
    return [callback]
}

export const getLastDealDocument = (deal: DealStatus): DocSigns => {
    const documents = deal.documents

    if (documents?.length) {
        const sorted = documents.sort((a, b) =>
            new Date(a.dateCreated) > new Date(b.dateCreated) ? 1 : -1,
        )
        return sorted[0]
    }
    return null
}

export enum DocumentSignedFlag {
    none = 'NONE',
    companion = 'COMPANION',
    you = 'YOU',
    both = 'BOTH',
}

export const isDocumentSigned = (
    deal: DealDocuments,
    isSeller: boolean,
    docType: AppUploadedDealFileDocTypeChoices,
): DocumentSignedFlag => {
    const d = deal.documents
        .sort((a, b) =>
            new Date(a.dateCreated) > new Date(b.dateCreated) ? 1 : -1,
        )
        .filter((d) => d.docType == docType)
    if (d.length) {
        const latest = d[d.length - 1]
        if (latest.buyerSign && latest.sellerSign) {
            return DocumentSignedFlag.both
        }
        if (latest.buyerSign || latest.sellerSign) {
            if (
                (latest.buyerSign && isSeller) ||
                (latest.sellerSign && !isSeller)
            ) {
                return DocumentSignedFlag.companion as DocumentSignedFlag
            }
            return DocumentSignedFlag.you as DocumentSignedFlag
        }
    }
    return DocumentSignedFlag.none as DocumentSignedFlag
}

export enum KycKybState {
    SUCCESS = 'Success',
    FAILED = 'Failed',
    PENDING = 'Pending',
    UPDATE = 'Update info',
    NONE = 'None',
}

export const getWorkspaceKycKybState = (
    workspace: WorkspaceKyc,
    profile?: ProfileKyc,
): KycKybState => {
    if (workspace || profile) {
        const data = workspace
            ? workspace.role == AppWorkspaceRoleChoices.CORPORATE
                ? workspace?.company?.kyb
                : workspace?.user?.kycInfo?.kyc
            : profile?.kycInfo?.kyc
        if (data) {
            if (data.reviewAnswer) {
                return KycKybState.SUCCESS
            } else {
                switch (data.reviewStatus) {
                    case 'completed':
                        if (data.reviewRejectType == 'FINAL') {
                            return KycKybState.FAILED
                        } else {
                            return KycKybState.UPDATE
                        }
                    case 'init':
                        return KycKybState.PENDING
                    case 'pending':
                        return KycKybState.PENDING
                    case 'onHold':
                        return KycKybState.PENDING
                    default:
                        return KycKybState.PENDING
                }
            }
        }
        /*if (workspace.role == AppWorkspaceRoleChoices.CORPORATE) {
      if (workspace?.company?.kyb?.reviewAnswer) {
        return workspace.company.kyb.reviewAnswer 
      } 
    } else {
      if (workspace?.user?.kycInfo?.kyc?.reviewAnswer) {
        return workspace.user.kycInfo.kyc.reviewAnswer
      }
    }*/
    }

    return KycKybState.NONE
}

export const getWorkspaceTitle = (
    workspace: WorkspaceView,
    ignoreRepresentative: boolean = false,
): string => {
    const text = []
    //console.log('getWorkspaceTitle', workspace?.role, ignoreRepresentative)
    if (workspace) {
        if (
            workspace.role == AppWorkspaceRoleChoices.INDIVIDUAL ||
            (workspace.role == AppWorkspaceRoleChoices.REPRESENTATIVE &&
                workspace?.user?.id &&
                ignoreRepresentative)
        ) {
            if (
                workspace?.user?.kycInfo?.firstName &&
                workspace.user.kycInfo.firstName !== ''
            ) {
                text.push(workspace.user.kycInfo.firstName)
            }
            if (
                workspace?.user?.kycInfo?.lastName &&
                workspace.user.kycInfo.lastName !== ''
            ) {
                text.push(workspace.user.kycInfo.lastName)
            }
            if (text.length == 0) {
                if (
                    workspace?.user?.firstName &&
                    workspace.user.firstName !== ''
                ) {
                    text.push(workspace.user.firstName)
                }
                if (
                    workspace?.user?.lastName &&
                    workspace.user.lastName !== ''
                ) {
                    text.push(workspace.user.lastName)
                }
            }
            if (
                text.length == 0 &&
                workspace?.user?.username &&
                workspace?.user?.username !== ''
            ) {
                text.push(workspace.user.username)
            }
            if (text.length == 0) {
                text.push(workspace.user.id)
            }
        }

        if (
            workspace.role == AppWorkspaceRoleChoices.CORPORATE ||
            (workspace.role == AppWorkspaceRoleChoices.REPRESENTATIVE &&
                workspace?.company?.id &&
                !ignoreRepresentative)
        ) {
            if (workspace?.company?.name && workspace?.company?.name !== '') {
                text.push(workspace.company.name)
            }
            if (text.length == 0) {
                text.push('New company')
            }
        }

        if (
            workspace.role == AppWorkspaceRoleChoices.REPRESENTATIVE &&
            workspace?.individual?.user?.id &&
            !ignoreRepresentative
        ) {
            if (
                workspace?.individual?.user?.kycInfo?.firstName &&
                workspace.individual.user.kycInfo.firstName !== ''
            ) {
                text.push(workspace.individual.user.kycInfo.firstName)
            }
            if (
                workspace?.individual?.user?.kycInfo?.lastName &&
                workspace.individual.user.kycInfo.lastName !== ''
            ) {
                text.push(workspace.individual.user.kycInfo.lastName)
            }
        }

        if (
            text.length == 0 &&
            workspace?.user?.username &&
            workspace?.user?.username !== ''
        ) {
            text.push(workspace.user.username)
        }
        if (text.length == 0) {
            text.push(workspace.user.id)
        }

        return text.join(' ')
    }
    return null
}

export const getWorkspaceIcon = (
    workspace: WorkspaceShort,
    style?: ImageStyles,
): string => {
    if (workspace) {
        const userAvatar = workspace?.user?.avatar
            ? getImageLink(
                  workspace.user.avatar,
                  style ? style : ImageStyles.AVATAR,
              )
            : null
        if (workspace?.company?.id) {
            return workspace?.company?.logo
                ? getImageLink(
                      workspace.company.logo,
                      style ? style : ImageStyles.LOGO,
                  )
                : userAvatar
        } else {
            if (workspace.role == AppWorkspaceRoleChoices.REPRESENTATIVE) {
                return workspace?.individual?.user?.avatar
                    ? getImageLink(
                          workspace.individual.user.avatar,
                          style ? style : ImageStyles.AVATAR,
                      )
                    : userAvatar
            } else {
                return userAvatar !== '' ? userAvatar : null
            }
        }
    }
    return null
}

export const stringArrayToOptions = (array: String[]) => {
    const options = []
    array.forEach((s) =>
        options.push({
            label: s,
            value: s,
        }),
    )
    return options
}

export const adminAction = (action: string, key: string, param: any) => {
    const host = process.env.BACKEND_URL
        ? process.env.BACKEND_URL
        : window.location.host
    return axios.post(`https://${host}/api/deals/${key}/${action}/`, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    })
}

export const getLastDeal = (deals: DealDocuments[]) => {
    if (deals?.length) {
        return deals.sort((a, b) =>
            new Date(a.dateCreated) > new Date(b.dateCreated) ? -1 : 1,
        )[0]
    }
    return null
}

export const getWorkspaceRoleTitle = (role: AppWorkspaceRoleChoices) => {
    switch (role) {
        case AppWorkspaceRoleChoices.CORPORATE:
            return 'Corporate'
        case AppWorkspaceRoleChoices.INDIVIDUAL:
            return 'Individual'
        case AppWorkspaceRoleChoices.REPRESENTATIVE:
            return 'Representative'
    }
    return null
}

export const getProductTitle = (ad: AdCard): string => {
    const title = []
    if (ad?.mainInformation?.manufacturer?.label) {
        title.push(ad.mainInformation.manufacturer.label)
    }
    if (ad?.mainInformation?.model?.label) {
        title.push(ad.mainInformation.model.label)
    }
    return title.join(' ')
}

export const permView = (p: Permission): boolean => {
    if (!p) return false
    return (
        p.role === AppPermissionsRoleChoices.VIEWER
    ) /*|| p.role === AppPermissionsRoleChoices.MANAGER*/
}

export const permEdit = (p: Permission): boolean => {
    if (!p) return false
    return p.role === AppPermissionsRoleChoices.MANAGER
}

export const permSign = (p: Permission): boolean => {
    if (!p) return false
    return p.role === AppPermissionsRoleChoices.SIGNEE
}

export const permNone = (p: Permission): boolean => {
    if (!p) return false
    return p.role === AppPermissionsRoleChoices.NOT_ASSIGNED
}

export const responsibleWorkspaceId = (workspace: WorkspaceShort): string => {
    if (workspace?.role == AppWorkspaceRoleChoices.REPRESENTATIVE) {
        if (workspace?.company?.workspace?.id) {
            return workspace.company.workspace.id
        }
        if (workspace?.individual?.workspace?.id) {
            return workspace.individual.workspace.id
        }
    } else {
        return workspace?.id
    }
}

export type ImageStyle = {
    width?: number
    height?: number
    crop?: boolean
    inset?: boolean
    watermark?: boolean
    format?: string
}

export type FileChunk = {
    links?: string
    bucket?: string
    key?: string
    link?: string
}

export enum ImageStyles {
    AVATAR = 'AVATAR',
    LOGO = 'LOGO',
    AD = 'AD',
    AD_VIEW = 'AD_VIEW',
    AD_CHAT = 'AD_CHAT',
    AVATAR_NANO = 'AVATAR_NANO',
    LOGO_NANO = 'LOGO_NANO',
    W1280 = 'W1280',
    ACTIVE_DEAL = 'ACTIVE_DEAL',
    DEAL_OVERVIEW = 'DEAL_OVERVIEW'
}

const ImageStyleFormats = {
    AVATAR: { width: 190, height: 190, crop: true },
    LOGO: { width: 190, height: 190, inset: true, crop: false },
    AD: { width: 332, height: 187, crop: true },
    AD_VIEW: { width: 919, height: 517, crop: true, watermark: true },
    AD_CHAT: { width: 48, height: 48, inset: true, crop: false },
    AVATAR_NANO: { width: 50, height: 50, crop: true },
    LOGO_NANO: { width: 50, height: 50, inset: true, crop: false },
    W1280: { width: 1280 },
    ACTIVE_DEAL: { width: 664, height: 374, crop: true },
    DEAL_OVERVIEW: {width: 150, height: 97, crop: true },
}


export const getImageRatio = (style?: ImageStyles): number => {
  const imageFormat: ImageStyle = ImageStyleFormats[style]
  return imageFormat.width / imageFormat.height
}

export const getImageLink = (file: FileChunk, style?: ImageStyles): string => {
    const quality = 97;
    if (file) {
        if (file?.links) {
            const imageFormat: ImageStyle = ImageStyleFormats[style]
            const { width, height, crop, inset, format, watermark } =
                imageFormat
            const linksArray = JSON.parse(file.links)

            const host = process.env.BACKEND_URL
                ? process.env.BACKEND_URL
                : window.location.host
            const url = [`quality=${quality}`]
            const ruleParts = [
                `${width ? width : ''}x${height ? height : ''}`,
                quality,
            ]
            if (width) {
                url.push(`width=${width}`)
            }
            if (height) {
                url.push(`height=${height}`)
            }
            if (format) {
                url.push(`file_format=${format}`)
            }
            if (watermark) {
                url.push(`has_water_mark=${watermark}`)
                ruleParts.push('wm')
            }
            if (inset) {
                url.push(`inset=${inset}`)
                ruleParts.push('inset')
            }
            if (crop) {
                url.push(`crop=${crop}`)
                ruleParts.push('crop')
            }

            const rule = `${ruleParts.join('_')}.${format ? format : 'webp'}`

            const linkFound = []
            linksArray.custom.forEach((l) => {
                if (l.rule == rule) {
                    linkFound.push(l.link)
                }
            })

            if (linkFound.length) {
                return linkFound[0]
            }

            if (style) {
                return `https://${host}/api/files/${file.bucket}/${
                    file.key
                }?${url.join('&')}`
            } else {
                return linksArray?.original?.link
            }
        }
        return file.link
    }
    return null
}



export const fileAccept = (images: boolean, documents: boolean): string => {
  const imageTypes = [
    'image/png', 
    'image/jpeg',
    'image/heic',
    'image/heif',
    'image/webp'
  ]

  const documentTypes = [
    'application/pdf',
    'application/xml',

    'text/csv',

    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
    
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',

    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.presentation'
  ]

  const archive = [
    'application/zip',
    'application/gzip',
    'application/x-gzip',
    'application/x-xz',
    'application/x-tar'
  ]


  const types = []
  if (images) {
    types.push(imageTypes)
  }
  if (documents) {
    types.push(documentTypes)
  }

  return types.join(', ')
}

export const checkSigned = (doc: DealFile): boolean => {
    switch (doc.docType) {
        case 'PA':
        case 'WA':
        case 'CF':
        case 'CC':
        case 'AM':
            return doc.sellerSign && doc.buyerSign
        default:
            return doc.sellerSign || doc.buyerSign
    }
    return false
}

interface IBankAccount {
    accName: string
    account: string
    currency: string
    bank: string
    address: string
    iban: string
    sort?: string
    attn: string
    swift: string
    cover?: string
}

export const getBankAccount = (currency: Currency): IBankAccount => {
    if (currency.label == 'GBP') {
        return {
            accName: 'AIC Global Limited',
            account: '85874123',
            currency: 'GBP',
            bank: 'Bank of America N.A., London Branch',
            address:
                '2 King Edward Street \nLondon, EC1A 1HQ \nUnited Kingdom\n',
            iban: 'GB35 BOFA 1650 5085 8741 23',
            swift: 'BOFAGB22',
            sort: '16-50-50',
            attn: 'Michele Kysar',
        }
    }

    if (currency.label == 'EUR') {
        return {
            accName: 'AIC Global Limited',
            account: '85874058',
            currency: 'EUR',
            bank: 'Bank of America N.A., London Branch',
            address:
                '2 King Edward Street \nLondon, EC1A 1HQ \nUnited Kingdom\n',
            iban: 'GB44 BOFA 1650 5085 8740 58',
            swift: 'BOFAGB22',
            attn: 'Michele Kysar',
        }
    }

    return {
        accName: 'AIC Global Limited',
        account: '85874024',
        currency: 'USD',
        bank: 'Bank of America N.A., London Branch',
        address: '2 King Edward Street \nLondon, EC1A 1HQ \nUnited Kingdom\n',
        iban: 'GB89 BOFA 1650 5085 8740 24',
        swift: 'BOFAGB22',
        cover: 'BOFAUS3N',
        attn: 'Michele Kysar',
    }
}


export const currencySort = (a: Currency, b: Currency): number => {
  if (a.isCrypto === b.isCrypto) {
    return a.label[0] == b.label[0] ? 0 : a.label[0] > b.label[0] ? -1 : 1
  } else {
    return a.isCrypto ? 1 : -1
  } 
}


export const getDealStateMessage = (deal: Deal, dealAccess: boolean, isSeller: boolean, isLoading: boolean) => {
    var text = ''
  
    /*if (deal.status ==AppDealStatusChoices.PDWS) {
      console.log('getDealStateMessage', {status: deal.status, dealAccess, isSeller})
      console.log('getDealStateMessage',deal.status, deal.currentAction, deal.currentStep)
    }*/
  
    // if (isLoading) {
    //   return <>Please wait <LoaderView ring /></>
    // }
  
    if (isBlockchainHoldingTheDeal(deal?.status)) {
      return 'Blockchain processing, please wait'
    }
  
    if (deal?.currentAction?.initialAction) {
      // console.log('deal.currentAction ' + deal.id, deal.currentAction)
      if (isSeller) {
        if (dealAccess) {
          if (deal?.status == AppDealStatusChoices.RDS) {
            return 'Revise the scope of Discrepancies removal'
          }
          if (deal?.currentAction?.initialAction?.sellerActionText) text = deal?.currentAction?.initialAction?.sellerActionText
        } else {
          if (deal?.status == AppDealStatusChoices.RDB) {
            return 'Waiting for the Buyer to revise the scope of Discrepancies removal'
          }
          if (deal?.status == AppDealStatusChoices.TSWCWB) {
            return 'Waiting for the Buyer to Sign Technical Acceptance Letter'
          }
          if (deal?.currentAction?.initialAction?.sellerInfoText) text = deal?.currentAction?.initialAction?.sellerInfoText
        }
      } else {
        if (dealAccess) {
          if (deal?.status == AppDealStatusChoices.RDB) {
            return 'Revise the scope of Discrepancies removal'
          }
          if (deal?.status == AppDealStatusChoices.TSWCWB) {
            return 'Sign Technical Acceptance Letter'
          }
          if (deal?.currentAction?.initialAction?.buyerActionText) text = deal?.currentAction?.initialAction?.buyerActionText
        } else {
          if (deal?.status == AppDealStatusChoices.RDS) {
            return 'Waiting for the Seller to revise the scope of Discrepancies removal'
          }
          if (deal?.currentAction?.initialAction?.buyerInfoText) text = deal?.currentAction?.initialAction?.buyerInfoText
        }
      }
    } else {
      //No deal state text, use default one
    }
  
    if (deal?.isOnTermsAndConditions) {
      if (deal?.termsAndCond?.isOnDocument) {
        if (isDocumentSigned(deal, isSeller, AppUploadedDealFileDocTypeChoices.AM) == DocumentSignedFlag.you) {
          return 'Waiting for counterparty to sign the Amendment to Aircraft Purchase Agreement'
        } else {
            return 'Sign the Amendment to Aircraft Purchase Agreement'
        }               
      } else {
        if (deal?.termsAndCond?.iterator == 0) {
          if ((deal?.termsAndCond?.turn == 'BUYER' && isSeller) || (deal?.termsAndCond?.turn == 'SELLER' && !isSeller)) {
            return 'Waiting for Seller/Purchaser to offer new T&C'
          } else {
            return 'Make your offer on T&C'
          }
        } else {
          if (deal?.termsAndCond?.turn == 'BUYER') {
            if (isSeller) {
              return 'Waiting for Purchaser to revise your suggestions on T&C'
            } else {
              return 'Revise Seller\'s suggestions on T&C'
            }
          } else {
            if (isSeller) {
              return 'Revise Purchaser\'s suggestions on T&C'
            } else {
              return 'Waiting for Seller to revise your suggestions on T&C'
            }
          }
        }
      }
    }
  
  
    if (text && text !== '') {
      const message = JSON.parse(text)
      if (deal?.status == AppDealStatusChoices.TCWB) {
        if (deal?.termsAndCond?.isWithComments && message?.seller_not_agree) {
          return message?.seller_not_agree
        }
      }
      if (deal?.status == AppDealStatusChoices.TCWS) {
        if (deal?.termsAndCond?.isWithComments && message?.buyer_not_agree) {
          return message?.buyer_not_agree
        }
      }
      if (deal?.status == AppDealStatusChoices.PDWB) {
      if (deal?.ppiDetails?.sellerComment && message?.seller_not_agree) {
          return message?.seller_not_agree
        }
      }
      if (deal?.status == AppDealStatusChoices.PCWP) {
        if (preClosingFilled(deal, isSeller) && message?.finished) {
          return message?.finished
        }
      }
      if (message?.default) return message?.default
      if (message?.seller_not_agree) return message?.seller_not_agree
    }
  
    if (dealAccess) {
      return 'Action required'
    } else {
      return 'Waiting for other party to complete the action'
    }
}