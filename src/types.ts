import {
    Deal,
    MainInformationType,
    StatusAdType,
    FireblocksAssetType,
    AdWorkspace,
    WorkspaceList,
    WorkspaceDetailed,
    WorkspacePartner,
    Profile,
    AppUploadedFileDocTypeChoices
} from './generated/graphql'

declare global {
    interface Window {
        ethereum: any
        jetoWallet: any
    }
}

export enum AdStatus {
    DRAFT = 1,
    MODERATION = 2,
    AWAITS_TOKENIZATION = 3,
    ON_TOKENIZATION = 4,
    TOKENIZED = 5,
    ON_PUBLISHING = 6,
    PUBLISHED = 7,
    RESERVED = 8,
    IN_TRANSACTION = 9,
    SOLD = 10,
}

export type ImageObj = {
    image: string
}

export type Options = Array<OptionType>

export type FileType = {
    file?: string
    filename?: string
    docType?: AppUploadedFileDocTypeChoices
    id?: number
}

export interface OptionType {
    label?: string
    value?: string | number | boolean
}

export interface Option {
    id: string
    name: string
}

export interface Product {
    id: number | string
    image: string
    title: string
    type: string
    year: string | number
    price?: string | number
    options?: string[]
    status?: string
    comparison?: boolean
    favorites?: boolean
    reRenderFavorites?: () => void
}

export interface MyAd {
    id: string
    status: AdStatus
    termsOfPayment?: {
        aircraftPrice?: number
    }
    mainInformation?: MainInformationType
    lists?: StatusAdType
    deals?: Deal
}

export interface ProductList extends Product {
    list: string[]
}

export interface Chats {
    id: number
    image: string
    title: string
    text: string
    messages: MessageItem[]
    unreadMessages: string
}

export interface MessageItem {
    id: number
    type: 'in' | 'out'
    image?: string
    text: string
    date: string
}

export type Step = {
    id: number
    label: string
}

export enum ProductStatus {
    DRAFT = 'Draft',
    MODERATION = 'Moderation',
    AWAITS_TOKENIZATION = 'Draft',
    ON_TOKENIZATION = 'On tokenization',
    TOKENIZED = 'Unpublished',
    ON_PUBLISHING = 'On publishing',
    PUBLISHED = 'Published',
    RESERVED = 'Reserved',
    IN_TRANSACTION = 'In transaction',
    SOLD = 'Sold',
    ACQUIRED = 'Acquired',
}

export const UploadedDealFileDocTypeTitle = {
    PA: 'Aircraft Purchase Agreement',
    TA: 'Technical Acceptance Letter',
    WA: 'Warranties Assignment',
    RL: 'Rejection Letter',
    DR: 'Delivery Receipt',
    BS: 'Bill Of Sale',
    PO: 'Public Offer',
    CF: 'Closing Instructions',
    CC: 'Closing Instructions',
}

export interface DealPermission {
    read: boolean
    sign: boolean
    edit: boolean
    creator: boolean
    buyer: boolean
    readOnly: boolean
}

export enum PermissionTitles {
    MANAGER = 'Manager',
    NOT_ASSIGNED = 'Not assigned',
    SIGNEE = 'Signee',
    VIEWER = 'Viewer',
}


export const documentQueryList = {
    PO: {
        name: 'getPublicOffer',
        query: `query getPublicOffer ($adId: UUID!) { getPublicOffer (adId: $adId) {runtimeError {exception message} text }}`,
    },
    PA: {
        name: 'getAircraftPurchaseAgreement',
        query: `query getAircraftPurchaseAgreement ($dealId: UUID!) {getAircraftPurchaseAgreement (dealId: $dealId) {runtimeError {exception message} text }}`,
    },
    TA: {
        name: 'getTechnicalAcceptance',
        query: `query getTechnicalAcceptance ($dealId: UUID!, $isWithDiscrepancies: Boolean!) {getTechnicalAcceptance (dealId: $dealId, isWithDiscrepancies: $isWithDiscrepancies) {runtimeError {exception message} text}}`,
    },
    BS: {
        name: 'getClosingDocument',
        query: `query getClosingDocument ($dealId: UUID) {getClosingDocument (dealId: $dealId) {runtimeError {exception message} text}}`,
    },
    DR: {
        name: 'getClosingDocument',
        query: `query getClosingDocument ($dealId: UUID) {getClosingDocument (dealId: $dealId) {runtimeError {exception message} text}}`,
    },
    WA: {
        name: 'getWarrantyAssignment',
        query: `query getWarrantyAssignment ($dealId: UUID) {getWarrantyAssignment (dealId: $dealId) {runtimeError {exception message} text}}`,
    },
    AM: {
        name: 'getAmendment',
        query: `query getAmendment ($dealId: UUID) {getAmendment (dealId: $dealId) {runtimeError {exception message} text}}`,
    },
    RL: {
        name: 'getRejectionLetter',
        query: `query getRejectionLetter ($dealId: UUID) {getRejectionLetter (dealId: $dealId) {runtimeError {exception message} text}}`,
    },
    CC: {
        name: 'getClosingInstruction',
        query: `query getClosingInstruction ($dealId: UUID) {getClosingInstruction (dealId: $dealId) {runtimeError {exception message} text}}`,
    },
    CF: {
        name: 'getClosingInstruction',
        query: `query getClosingInstruction ($dealId: UUID) {getClosingInstruction (dealId: $dealId) {runtimeError {exception message} text}}`,
    },
}

export interface IHelp {
    title: string
    link: string
}

export interface ITimeLeft {
    text: string
    overdue: boolean
}

export interface IActiveDeal {
    deal?: Deal
    dealProp?: Deal
    dealAccess?: boolean
    onReject?: (dealId: string) => void
    onCancelNegotiation?: (dealId: string) => void
    canReject?: boolean
    isComplete?: boolean
    isReserved?: boolean
}

export interface IWorkspaceRepresentative {
    ads: Array<AdWorkspace>
    workspace: WorkspaceList | WorkspaceDetailed
    parentWorkspace: WorkspaceList | WorkspaceDetailed
    editable: boolean
    onReloadAds: () => void
    onRemoveRepresentative?: (wid: string) => void
    updateWorkspaces: () => void
}


export interface IWorkspace {
    workspace: WorkspaceList | WorkspaceDetailed | WorkspacePartner
    readonly?: boolean
    profile?: Profile
    onSwitch?: (id: string) => void
    onDetails?: (id: string) => void
    updateWorkspaces?: () => void
    onKyc?: () => void
    kycKybState?: boolean
    full?: boolean
    short?: boolean
    authority?: boolean
  }
  

export const AppUploadedFileDocTypeChoicesLabels = {
  ADDRESS: 'Address',
  AIRCRAFT_DOCUMENTS: 'Aircraft documents',
  AVATAR: 'Avatar',
  BROCHURE: 'Brochure',
  MAINTENANCE_STATUS_REPORT: 'Maintenance status report',
  RECENT_INSPECTION_REPORT: 'Recent inspection report',
  SPEC_SHEET: 'Spec. sheet',
  AIRWORTHINESS_DIRECTIVES: 'Airworthiness directives',
  OTHER: 'Other',
  SAFETY_DIRECTIVE: 'Safety directive',
  SAFETY_INFORMATION_BULLETINS: 'Safety information bulletin',
  SERVICE_BULLETIN: 'Service bulletin',
}
