import React, { useEffect, useState, useRef } from 'react'
import {
    DealType,
    FireblocksAccountType,
    FireblocksAsset,
    FiatAssetMain,
    FiatAsset,
    useUserAssets,
    useDealAssets,
    useGetUserNfts,
    NftFull,
    FireblocksTransactionType,
    FireblocksProfile,
    AppFireblocksTransactionDirectionChoices,
    useFireblocksRefreshBalance,
    Currency,
    AppDealStatusChoices,
    AppNftStatusChoices,
    useAddFiats,
    useRemoveFiats,
    useMyProfileFull,
    BankDetails,
    AppWorkspaceRoleChoices,
    DealAssetsSet
} from 'src/generated/graphql'
import { useHistory } from 'react-router-dom'
import Icon from 'src/components/Icon/Icon'
import NFTView from 'src/components/NFTView/NFTView'
import BankData from '../BankData/BankData'
import AddressView from 'src/components/AddressView/AddressView'
import DocumentLink from 'src/components/DocumentLink/DocumentLink'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import Button from 'src/components/Button/Button'
import { format } from 'date-fns'
import {
    formatPrice,
    getStateRelativeIndex,
    getLastDeal,
    getProductStatus,
    getImageLink,
    ImageStyles,
    currencySort,
    responsibleWorkspaceId,
} from 'src/helper'
import LoaderView from 'src/components/LoaderView/LoaderView'
import AircraftDocuments from 'src/components/AircraftDocuments/AircraftDocuments'
import Modal from 'src/components/Modal/Modal'
import KycKybBlocker from 'src/components/KycKybBlocker/KycKybBlocker'
import { QRCodeSVG } from 'qrcode.react'
import { useCurrentWorkspace } from 'src/hooks'
import { AdStatus } from 'src/types'
import './Vault.scss'
import PaymentInvite from '../PaymentInvite/PaymentInvite'

const getCurrentAsset = (
    assetId: number,
    assets: VaultAsset[] | null,
): VaultAsset => {
    const assetFound = assets?.length
        ? assets.filter((a) => a.id == assetId)
        : []
    if (assetFound.length == 1) {
        return assetFound[0]
    }
    return null
}

interface TEscrowListItem {
    dealId: string
    status: AppDealStatusChoices
    fireblocksAssets: FireblocksAsset[]
    fiatAssets: FiatAssetMain[]
    isSeller: boolean
}

interface ITransactionRecord {
    transaction: FireblocksTransactionType
}

const TransactionRecord: React.FC<ITransactionRecord> = (props) => {
    const {
        transaction: {
            amount,
            direction,
            createdAt,
            destinationAsset,
            sourceAsset,
        },
    } = props
    console.log('TransactionRecord', {
        amount,
        direction,
        createdAt,
        destinationAsset,
        sourceAsset,
    }
    )
    const buy = direction == AppFireblocksTransactionDirectionChoices.OUTBOUND
    const directionClass = buy ? 'spent' : 'received'
    const printedDate = format(new Date(createdAt), 'dd.MM.yy HH:mm')
    const title = destinationAsset?.fireblocksAccount?.deal?.id
        ? 'To escrow account'
        : buy
            ? 'Withdrawal'
            : 'Deposit'
    const destination = buy ? destinationAsset?.address : sourceAsset?.address

    return (
        <div className={`tab-activity__activity ${directionClass}`}>
            <div className="tab-activity__activity-title">
                <div className="tab-activity__activity-name">{title}</div>
                <AddressView address={destination} />
            </div>
            <div className="tab-activity__activity-amout">
                <div className="tab-activity__activity-amout__amount">
                    {buy ? '-' : '+'}
                    {formatPrice(amount)}
                </div>
                <div className="tab-activity__activity-amout__date">
                    {printedDate}
                </div>
            </div>
        </div>
    )
}

interface IVaultBalance {
    active?: boolean
    onClick?: (id: number) => void
    loading?: boolean
    asset?: VaultAsset
    reload?: () => void
}

const VaultBalance: React.FC<IVaultBalance> = (props) => {
    const { active, onClick, loading, asset, reload } = props
    const amount = +asset.total /* + +asset.locked*/
    const title = asset?.currency?.label
    const icon = 'i-' + asset?.currency?.label.replace('_', '-').toLowerCase()
    const classNames = ['balance balance-' + title]
    if (amount == null || loading) classNames.push('loading')
    if (active) classNames.push('active')
    const visibleValue =
        loading || amount == null ? <LoaderView ring /> : formatPrice(amount)

    return (
        <div
            className={classNames.join(' ')}
            onClick={() => {
                if (onClick) onClick(asset.id)
            }}
        >
            <div className="balance__icon">
                <Icon name={icon} />
            </div>
            <div className="balance__title">{title}</div>
            <div className="balance__amount">{visibleValue}</div>
            {!loading && reload && (
                <div className="balance__update">
                    <Icon
                        name="i-reload"
                        onClick={(e) => {
                            e.preventDefault()
                            reload()
                        }}
                    />
                </div>
            )}
        </div>
    )
}



interface IVaultDemoBalance {
    label: string
    onClick: () => void
}

const VaultDemoBalance: React.FC<IVaultDemoBalance> = (props) => {
    const { label, onClick } = props
    const icon = 'i-' + label.replace('_', '-').toLowerCase()
    const classNames = ['balance balance-demo balance-' + label]

    return (
        <div
            className={classNames.join(' ')}
            onClick={onClick}
        >
            <div className="balance__icon">
                <Icon name={icon} />
            </div>
            <div className="balance__title">{label}</div>
            <div className="balance__amount">-</div>
        </div>
    )
}


interface IVaultNFTs {
    active?: boolean
    onClick?: (id: number) => void
    loading?: boolean
    nfts?: number
    reload?: () => void
}

const VaultNFTs: React.FC<IVaultNFTs> = (props) => {
    const { active, onClick, loading, nfts, reload } = props
    const classNames = ['balance balance-nfts']
    if (nfts == null || loading) classNames.push('loading')
    if (active) classNames.push('active')
    const visibleValue = loading || nfts == null ? <LoaderView ring /> : nfts

    return (
        <div
            className={classNames.join(' ')}
            onClick={() => {
                if (onClick) onClick(-1)
            }}
        >
            <div className="balance__icon">
                <Icon name={'i-nft'} />
            </div>
            <div className="balance__title">Aircraft</div>
            <div className="balance__amount">{visibleValue}</div>
            {!loading && reload && (
                <div className="balance__update">
                    <Icon
                        name="i-reload"
                        onClick={(e) => {
                            e.preventDefault()
                            reload()
                        }}
                    />
                </div>
            )}
        </div>
    )
}

const getEscrowTitle = (status: AppDealStatusChoices): string => {
    switch (status) {
        case AppDealStatusChoices.BWR:
            return 'Reserving funds'
        case AppDealStatusChoices.TCWB:
        case AppDealStatusChoices.TCWS:
        case AppDealStatusChoices.AWS:
        case AppDealStatusChoices.AWB:
            return 'Funds reserved'
        case AppDealStatusChoices.PDWB:
        case AppDealStatusChoices.PDWS:
        case AppDealStatusChoices.PDCB:
        case AppDealStatusChoices.PCB:
        case AppDealStatusChoices.PUWB:
        case AppDealStatusChoices.RWSB:
        case AppDealStatusChoices.TSNCWB:
        case AppDealStatusChoices.TSWCWB:
        case AppDealStatusChoices.FAWCS:
        case AppDealStatusChoices.FANCS:
        case AppDealStatusChoices.BWAWC:
        case AppDealStatusChoices.BWANC:
        case AppDealStatusChoices.DRWS:
        case AppDealStatusChoices.DRAB:
        case AppDealStatusChoices.FPWB:
        case AppDealStatusChoices.BWFP:
        case AppDealStatusChoices.PCWP:
        //case AppDealStatusChoices.CWWP:
        //case AppDealStatusChoices.CDWP:
        //case AppDealStatusChoices.CIWP:
        case AppDealStatusChoices.FFPPWA:
            return 'Funds in escrow'
        case AppDealStatusChoices.DC:
            return 'Funds in escrow'
        default:
            return 'Funds in escrow'
    }
    return ''
}

interface IEscrowBalances {
    escrows: TEscrowListItem[]
    isFiat: boolean
    asset: VaultAsset
}

const EscrowsList: React.FC<IEscrowBalances> = (props) => {
    const { escrows, isFiat, asset } = props

    const escrow = escrows?.length
        ? escrows.filter((e) =>
            isFiat
                ? e?.fiatAssets?.length &&
                e.fiatAssets.filter(
                    (a) =>
                        a?.currency?.fullName == asset.currency?.fullName &&
                        a.total > 0,
                ).length
                : e?.fireblocksAssets?.length &&
                e.fireblocksAssets.filter(
                    (a) =>
                        a?.currency?.fullName == asset.currency?.fullName &&
                        a.total > 0,
                ).length,
        )
        : []

    return (
        <>
            {escrow.map((a) => {
                const title = getEscrowTitle(a.status)
                if (a.isSeller) {
                    //прячем у продавца эскроу
                    return null
                }
                return (
                    <div
                        className={`tab-assets__escrow__item ${title
                            .toLowerCase()
                            .replace(' ', '-')}`}
                        key={a.dealId}
                    >
                        <div className="tab-assets__escrow__item-addr">
                            {!isFiat && a.fireblocksAssets?.[0]?.address ? (
                                <AddressView
                                    address={a.fireblocksAssets[0].address}
                                />
                            ) : (
                                title
                            )}
                        </div>
                        <div className="tab-assets__escrow__item-amout">
                            <span className="asset-bra">(</span>
                            {formatPrice(
                                isFiat
                                    ? a.fiatAssets.filter(
                                        (b) =>
                                            b.currency.fullName ==
                                            asset.currency.fullName &&
                                            b.total > 0,
                                    )[0].total
                                    : a.fireblocksAssets.filter(
                                        (b) =>
                                            b.currency.fullName ==
                                            asset.currency.fullName &&
                                            b.total > 0,
                                    )[0].total,
                            )}
                            <span className="asset-bra">)</span>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

interface IMyBank {
    currency: Currency
}

const MyBank: React.FC<IMyBank> = (props) => {
    const { currency } = props
    const [, myProfile] = useMyProfileFull()
    const [bankDetails, setBankDetails] = useState<BankDetails>(null)

    useEffect(() => {
        myProfile().then((res) => {
            console.log(
                'myProfile',
                res?.data?.myProfile?.profile?.currentWorkspace?.bankDetails,
            )
            if (res?.data?.myProfile?.profile?.currentWorkspace?.bankDetails) {
                setBankDetails(
                    res.data.myProfile.profile.currentWorkspace.bankDetails,
                )
            }
        })
    }, [])

    if (!bankDetails) return null

    return (
        <div className="myBank">
            <div className="myBank__row">
                <span>Bank name:</span> <span>{bankDetails.name}</span>
            </div>
            <div className="myBank__row">
                <span>Bank address:</span> <span>{bankDetails.address}</span>
            </div>
            <div className="myBank__row">
                <span>Account:</span> <span>{bankDetails.accountNumber}</span>
            </div>
            <div className="myBank__row">
                <span>SWIFT:</span> <span>{bankDetails.swiftCode}</span>
            </div>
            <div className="myBank__row">
                <span>IBAN:</span> <span>{bankDetails.iban}</span>
            </div>
            <div className="myBank__row">
                <span>Sort code:</span> <span>{bankDetails.sortCode}</span>
            </div>
        </div>
    )
}

interface IVaultViewBalance {
    //transactions?: Array<TransactionType>
    onDeposit?: (address: string) => void
    assetId?: number
    assets: VaultAsset[] | null
    escrows?: TEscrowListItem[]
    reload?: () => void
    readOnly: boolean
}

const VaultViewBalance: React.FC<IVaultViewBalance> = (props) => {
    const { assetId, assets, onDeposit, escrows, reload, readOnly } = props
    const asset = getCurrentAsset(assetId, assets)
    const isFiat = !asset?.currency?.isCrypto

    const [tab, setTab] = useState<boolean>(true)
    const [, addFiats] = useAddFiats()
    const [, remFiats] = useRemoveFiats()
    const [magick, setMagick] = useState<number>(0)
    const [depositModal, setDepositModal] = useState<boolean>(false)
    const [depositModalHelp, setDepositModalHelp] = useState<boolean>(false)
    const [withdrawModal, setWithdrawModal] = useState<boolean>(false)
    const [depositValue, setDepositValue] = useState<number>(0)

    if (!asset) return null

    const handleDepositChange = (e) => {
        setDepositValue(e.target.value)
    }

    const handleDeposit = () => {
        if (asset?.currency) {
            if (!asset.currency.isCrypto) {
                if (depositValue > 0) {
                    addFiats({
                        amount: depositValue,
                        currency: asset.currency.value,
                    }).then((res) => {
                        setDepositModal(false)
                        setDepositValue(0)
                        reload()
                    })
                } else {
                    remFiats({
                        amount: -depositValue,
                        currency: asset.currency.value,
                    }).then((res) => {
                        setDepositModal(false)
                        setDepositValue(0)
                        reload()
                    })
                }
            }
        }
    }

    const handleWithdraw = () => {
        if (asset?.currency) {
            if (!asset.currency.isCrypto) {
                setWithdrawModal(true)
            } else {
            }
        }
    }

    const escrow = escrows?.length
        ? escrows.filter((e) =>
            isFiat
                ? e?.fiatAssets?.length &&
                e.fiatAssets.filter(
                    (a) =>
                        a?.currency?.fullName ==
                        asset?.currency?.fullName && a.total > 0,
                ).length
                : e?.fireblocksAssets?.length &&
                e.fireblocksAssets.filter(
                    (a) =>
                        a?.currency?.fullName ==
                        asset?.currency?.fullName && a.total > 0,
                ).length,
        )
        : []

    const totalValue = formatPrice(+asset.available)
    let transactions = []
    if (isFiat) {
        if ('fiatSourceTransactions' in asset) {
            if (asset?.fiatSourceTransactions?.length > 0)
                transactions = [...asset.fiatSourceTransactions]
            if (asset?.fiatDestinationTransactions?.length > 0)
                transactions = [
                    ...transactions,
                    ...asset.fiatDestinationTransactions,
                ]
        }
    } else {
        if ('fireblocksSourceTransactions' in asset) {
            if (asset?.fireblocksSourceTransactions?.length > 0)
                transactions = [...asset.fireblocksSourceTransactions]
            if (asset?.fireblocksDestinationTransactions?.length > 0)
                transactions = [
                    ...transactions,
                    ...asset.fireblocksDestinationTransactions,
                ]
        }
    }

    transactions.sort((t1, t2) => {
        return t1.createdAt == t2.createdAt
            ? 0
            : t1.createdAt < t2.createdAt
                ? 1
                : -1
    })

    //return null

    return (
        <div className="balance-view">
            <KycKybBlocker>
                <div
                    className="balance-view__total"
                    onClick={() => setMagick(magick + 1)}
                >
                    <VaultBalance
                        asset={asset}
                        reload={reload}
                    />
                </div>
                <div className="balance-view__tabs">
                    <div className="balance-view__tabs__header">
                        <div
                            className={
                                'balance-view__tabs__header-tab ' +
                                (tab ? 'active' : 'inactive')
                            }
                            onClick={() => setTab(true)}
                        >
                            Assets
                        </div>
                        <div
                            className={
                                'balance-view__tabs__header-tab ' +
                                (tab ? 'inactive' : 'active')
                            }
                            onClick={() => setTab(false)}
                        >
                            Activity
                        </div>
                    </div>
                    {tab ? (
                        <div className="balance-view__tabs__tab tab-assets">
                            <div className="tab-assets__asset  tab-assets__available">
                                <div className="tab-assets__asset-title">
                                    Available balance
                                    <div className="tab-assets__asset-addr">
                                        {'address' in asset && (
                                            <AddressView
                                                address={asset.address}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="tab-assets__asset-amout">
                                    {totalValue}
                                </div>
                            </div>
                            {escrow.length > 0 && (
                                <div className="tab-assets__escrow">
                                    <EscrowsList
                                        escrows={escrows}
                                        asset={asset}
                                        isFiat={isFiat}
                                    />
                                </div>
                            )}
                            {!readOnly && (
                                <div className="tab-assets__asset-actions">
                                    <Button
                                        type={Number(totalValue) <= 0 ? 'secondary' : 'blue'}
                                        onClick={handleWithdraw}
                                        disabled={Number(totalValue) <= 0}
                                    >
                                        Withdraw
                                    </Button>
                                    {'address' in asset ? (
                                        // JUSDT Deposit Button
                                        <Button
                                            type="blue"
                                            onClick={() => {
                                                if (onDeposit)
                                                    onDeposit(asset.address)
                                            }}
                                        >
                                            Deposit
                                        </Button>
                                    ) : (
                                        // Fiat Deposit Button
                                        <Button
                                            type={magick < 5 ? 'secondary' : 'blue'}
                                            onClick={
                                                magick < 5 ?
                                                    () => {
                                                        setDepositModalHelp(true)
                                                    }
                                                    :
                                                    () => {
                                                        setDepositModal(true)
                                                    }
                                            }
                                        >
                                            Deposit
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="balance-view__tabs__tab tab-activity">
                            {transactions.length > 0 &&
                                transactions.map((t) => (
                                    <TransactionRecord
                                        transaction={t}
                                        key={t.id}
                                    />
                                ))}
                        </div>
                    )}
                </div>
                <Modal
                    title="Deposit Fiat"
                    modalIsOpen={!!depositModal}
                    onRequestClose={() => {
                        setDepositModal(false)
                    }}
                    isCloseIcon={true}
                    buttons={[
                        {
                            title: 'Close',
                            onClick: () => {
                                setDepositModal(false)
                            },
                        },
                        { title: 'Deposit', onClick: handleDeposit },
                    ]}
                >
                    <input
                        type="text"
                        onChange={handleDepositChange}
                    />
                </Modal>
                <Modal
                    title="Withdraw"
                    modalIsOpen={!!withdrawModal}
                    onRequestClose={() => {
                        setWithdrawModal(false)
                    }}
                    isCloseIcon={true}
                    buttons={[
                        {
                            title: 'Close',
                            onClick: () => {
                                setWithdrawModal(false)
                            },
                        },
                        {
                            title: 'Request withdrawal',
                            onClick: () => {
                                setWithdrawModal(false)
                            },
                        },
                    ]}
                >
                    <>
                        <VaultBalance
                            asset={asset}
                            reload={reload}
                        />
                        <div>
                            Confirm your request to withdraw funds from your
                            custodial account to the following bank details:
                        </div>
                        <MyBank currency={asset?.currency} />
                        <div>Funds will we transferred in 2 working days. </div>
                    </>
                </Modal>

                <Modal
                    title="Deposit "
                    modalIsOpen={!!depositModalHelp}
                    onRequestClose={() => {
                        setDepositModalHelp(false)
                    }}
                    isCloseIcon={true}
                    buttons={[
                        {
                            title: 'Close',
                            onClick: () => {
                                setDepositModalHelp(false)
                            },
                        },
                    ]}
                >
                    <BankData currency={asset.currency} />
                </Modal>
            </KycKybBlocker >
        </div >
    )
}

interface INFTAdProp {
    title: string
    value?: any
}

const NFTAdProp: React.FC<INFTAdProp> = React.memo((props) => {
    const { title, value } = props

    if (!value) return null

    return (
        <div className="NFTAd__props-props">
            <div className="title">{title}</div>
            <div className="value">{value}</div>
        </div>
    )
})

interface INFTAd {
    nft: NftFull
}

const NFTAd: React.FC<INFTAd> = (props) => {
    const {
        ad: {
            status,
            mainInformation: {
                images,
                manufacturer,
                model,
                year,
            },
            aircraftDocuments,
            documents,
            deals,
        },
        id,
        txHash,
    } = props.nft

    const image = getImageLink(images?.[0], ImageStyles.AD)
    const deal = deals && deals.length > 0 ? getLastDeal(deals) : null
    const dealDocuments =
        deal?.documents && deal.documents.length > 0 ? deal.documents : null
    const adDocuments = documents && documents.length > 0 ? documents : null
    const currentWorkspace = useCurrentWorkspace()
    //const isSeller = currentWorkspace?.id == deal?.seller?.id
    const isSeller = (deal?.seller?.id == currentWorkspace?.id || responsibleWorkspaceId(currentWorkspace) == deal?.seller?.id)

    return (
        <div className="NFTAd">
            <div className="NFTAd__image">{image && <img src={image} />}</div>
            <div className="NFTAd__main">
                <div className="NFTAd__state">
                    {getProductStatus(status, !isSeller)}
                </div>
                <div className="NFTAd__id">TokenID: {id}</div>
            </div>
            <NFTView nft={props.nft} />
            <div className="NFTAd__props">
                <NFTAdProp
                    title="Manufacturer"
                    value={manufacturer.label}
                />
                <NFTAdProp
                    title="Model"
                    value={model.label}
                />
                <NFTAdProp
                    title="Year"
                    value={year}
                />

                <div className="NFTAd__documents">
                    <div className="title">Documents</div>
                    <AircraftDocuments
                        ad={props?.nft?.ad}
                        deal={deal}
                    />
                </div>
            </div>
        </div>
    )
}

interface IVaultViewNFTListItem {
    nft: NftFull
    active: boolean
    onClick: (event: any) => void
}

const VaultViewNFTListItem: React.FC<IVaultViewNFTListItem> = React.memo(
    (props) => {
        const currentWorkspace = useCurrentWorkspace()

        if (!props?.nft?.ad) return null

        const { active, onClick } = props
        const {
            ad: {
                mainInformation: { images, manufacturer, model },
                deals,
                status,
            },
            id,
        } = props.nft

        const deal = deals && deals.length > 0 ? deals[0] : null
        const title = manufacturer.label + ' ' + model.label
        const image = getImageLink(images?.[0], ImageStyles.AD)
        //const isSeller = currentWorkspace?.id == deal?.seller?.id
        const isSeller = (deal?.seller?.id == currentWorkspace?.id || responsibleWorkspaceId(currentWorkspace) == deal?.seller?.id)

        if (props?.nft?.status == AppNftStatusChoices.INITED) return null

        return (
            <div
                className={'NFT ' + (active ? 'active' : 'inactive')}
                onClick={onClick}
            >
                <div className="NFT__image">
                    {image && (
                        <img
                            src={image}
                            alt={title}
                        />
                    )}
                </div>
                <div className="NFT__props">
                    <div className="NFT__title">{title}</div>
                    <div className="NFT__id">TokenID: {id}</div>
                    <div className="NFT__state">
                        {getProductStatus(status, !isSeller)}
                    </div>
                </div>
            </div>
        )
    },
)

interface IVaultViewNFTList {
    nftList: Array<NftFull>
}

const VaultViewNFTList: React.FC<IVaultViewNFTList> = React.memo((props) => {
    const { nftList } = props
    const [item, setItem] = useState<NftFull | null>(null)
    const ref = useRef(null)

    const nftListSort = (a: NftFull, b: NftFull) => {
        return a.id === b.createdAt ? 0 : a.createdAt > b.createdAt ? -1 : 1
    }

    return (
        <div className="NFTs">
            <div className="NFTs__list">
                {nftList.length > 0 ? (
                    nftList &&
                    nftList.sort(nftListSort).map((nft) => {
                        return (
                            <VaultViewNFTListItem
                                active={item && nft.id == item.id}
                                key={nft.id}
                                nft={nft}
                                onClick={() => {
                                    setItem(nft)
                                    window.innerWidth < 992
                                        ? ref.current.scrollIntoView({
                                            behavior: 'smooth',
                                        })
                                        : null
                                }}
                            />
                        )
                    })
                ) : (
                    <div className="minor">
                        You don’t have any Aircraft Tokens
                    </div>
                )}
            </div>
            <div
                className="NFTs__nft"
                ref={ref}
            >
                {item && <NFTAd nft={item} />}
            </div>
        </div>
    )
})

interface IVaultPay {
    pay: number
    currency: Currency
    assets: VaultAsset[] | null
    escrows?: TEscrowListItem[]
    icon: string
    amountTitle: string
    title?: string
    onPay: () => void
    onCancel: () => void
    loading: boolean
}

const VaultPay: React.FC<IVaultPay> = (props) => {
    const {
        pay,
        assets,
        escrows,
        icon,
        currency,
        amountTitle,
        title = 'Please, confirm payment',
        loading,
        onPay,
        onCancel,
    } = props
    const [tab, setTab] = useState<boolean>(true)

    const payValue = formatPrice(pay)
    let escrow: number = 0
    if (escrows?.length) {
        escrows.forEach((e) => {
            const list = e.fireblocksAssets
                ? e.fireblocksAssets.filter(
                    (a) => a.currency.value == currency.value,
                )
                : []
            if (list?.length) {
                list.forEach((l) => (escrow += parseFloat('' + l.total)))
            }
        })
    }

    const asset = assets?.length
        ? assets.filter((a) => a.currency.value == currency.value)
        : []
    const amount = asset.length == 1 ? asset[0].available : 0
    const assetAddress =
        asset.length == 1 && 'address' in asset[0] ? asset[0].address : ''
    const escrowValue = formatPrice(escrow)
    const amountValue = formatPrice(amount)
    const totalValue = formatPrice(+amount + escrow)
    const visibleValue =
        loading || amount == null ? <LoaderView ring /> : amountValue
    const paymentDisabled = loading || !amount || amount < pay

    return (
        <div className="balance-view balance-view-pay">
            <div className="balance-view__total">
                {/*<VaultBalance name="balance" icon={icon} title={currency} amount={totalValue}  />*/}
            </div>
            <div className="balance-view__tabs">
                <div className="balance-view__tabs__tab tab-assets">
                    <div className="tab-assets__asset">
                        <div className="tab-assets__asset-title">
                            Available balance
                            <div className="tab-assets__asset-addr">
                                <AddressView address={assetAddress} />
                            </div>
                        </div>
                        <div className="tab-assets__asset-amout">
                            {visibleValue}
                        </div>
                    </div>
                    {escrow !== 0 && (
                        <div className="tab-assets__asset tab-assets__asset-escrow">
                            <div className="tab-assets__asset-title">
                                Funds on escrow account
                            </div>
                            <div className="tab-assets__asset-amout">
                                ({escrowValue})
                            </div>
                        </div>
                    )}

                    <div className="balance-pay">
                        <div className="balance-pay__title">{title}</div>
                        <div className="balance-pay__amount">
                            <div className="balance-pay__amount-title">
                                {amountTitle}
                            </div>
                            <div className="balance-pay__amount-value">
                                {payValue}
                            </div>
                        </div>
                        <div className="balance-pay__actions">
                            <Button
                                type="secondary"
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onPay}
                                disabled={paymentDisabled}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

type VaultAsset = FireblocksAsset | FiatAsset

interface IWalletMode {
    pay?: number
    currency?: Currency
    text?: string
    amountTitle?: string
    onPay?: () => void
    onCancel?: () => void
}

const Vault: React.FC<IWalletMode> = (props) => {
    const { pay, currency, onPay, text, onCancel, amountTitle } = props
    const payMode = pay ? true : false
    const [isLoading, setLoading] = useState<boolean>(false)
    const [view, setView] = useState<number>(null)
    const { choices } = useSelector((state: RootState) => state.choices)
    const [updatedBalance, reloadUpdatedBalance] = useFireblocksRefreshBalance()
    const router = useHistory()
    const [userAssetsResult, reloadAssets] = useUserAssets({
        requestPolicy: 'network-only',
        pause: true
    })
    const [demoModal, setDemoModal] = useState<boolean>(false)
    const [escrowListResult, reloadEscrowList] = useDealAssets()
    const [escrows, setEscrows] = useState<TEscrowListItem[]>([])
    const [assets, setAssets] = useState<VaultAsset[]>(null)
    //const [ assetsFt, setFtAssets ] = useState<FiatAsset[]>(null)
    const [depositModal, setDepositModal] = useState<string>(null)
    const [vaultId, setVaultId] = useState<string>('')
    const [userNFTsResult, reloadNFTs] = useGetUserNfts({
        requestPolicy: 'network-only',
        pause: true
    })
    const currentWorkspace = useCurrentWorkspace()

    const noAccess = currentWorkspace?.role == AppWorkspaceRoleChoices.REPRESENTATIVE && escrows?.length == 0
    //const [footerClick, setFooterClick] = useState<number>(0)
    //const [hiddenSide, setHiddenSide] = useState<boolean>(false)

    const refresh = () => {
        reloadAssets()
        reloadNFTs()
    }

    useEffect(() => {
        reloadUpdatedBalance()
        reloadEscrowList({ isActive: true })
        reloadAssets()
        reloadNFTs()
    }, [])

    useEffect(() => {
        refresh()
    }, [currentWorkspace?.id])

    useEffect(() => {
        if (!userAssetsResult.fetching) {
            if (
                userAssetsResult?.data?.getWorkspaceAssets
                    ?.fireblocksAssets?.[0]?.fireblocksAccount?.name
            ) {
                setVaultId(
                    userAssetsResult?.data?.getWorkspaceAssets
                        ?.fireblocksAssets[0].fireblocksAccount.name,
                )
            }
            const assetsFb =
                userAssetsResult?.data?.getWorkspaceAssets?.fireblocksAssets
            const assetsFt =
                userAssetsResult?.data?.getWorkspaceAssets?.systemAssets
            const assetsNew: VaultAsset[] = []
            if (assetsFb?.length) {
                assetsNew.push(...assetsFb)
            }
            if (assetsFt?.length) {
                assetsNew.push(...assetsFt)
            }
            setAssets(
                assetsNew /*.sort((a, b) => a.id == b.id ? 0 : a.id > b.id ? 1 : -1)*/,
            )
        }
    }, [userAssetsResult])

    useEffect(() => {
        if (!escrowListResult.fetching) {
            const deals = escrowListResult?.data?.myDeals?.deals?.edges
            if (deals?.length) {
                const escrowList: TEscrowListItem[] = []
                deals.forEach((deal) => {
                    escrowList.push({
                        dealId: deal?.node?.id,
                        fireblocksAssets:
                            deal?.node?.fireblocksAccount?.fireblocksAssets,
                        fiatAssets: deal?.node?.fiatAccount?.fiatAssets,
                        status: deal?.node?.status,
                        isSeller: (deal?.node?.seller?.id == currentWorkspace?.id || responsibleWorkspaceId(currentWorkspace) == deal?.node?.seller?.id)

                    })
                })
                setEscrows(escrowList)
            }
        }
    }, [escrowListResult])

    useEffect(() => {
        reloadAssets()
    }, [updatedBalance])

    const reloadBalance = () => {
        if (!updatedBalance.fetching) {
            reloadUpdatedBalance()
        }
    }

    /*useEffect(() => {
    if (footerClick > 9) {
      setHiddenSide(true)
      setFooterClick(0)
    }
  }, [footerClick])*/

    const handleTemporatyPay = () => { }

    const updateFiatBalance = () => {
        console.log('updateFiatBalance')
    }

    const handleDemoModal = () => {
        setDemoModal(true)
    }

    /*const handleFooterClick = () => {
    setFooterClick(footerClick+1)
  }*/

    //const assets = userAssetsResult.fetching /*|| userVaultResult.error*/ ? null : userAssetsResult?.data?.myProfile?.profile?.fireblocksAccount?.fireblocksAssets
    const reservedNFTs =
        !userNFTsResult.fetching && userNFTsResult?.data?.getNfts?.reservedNfts
            ? userNFTsResult.data.getNfts.reservedNfts
            : []
    const myNFTs =
        !userNFTsResult.fetching && userNFTsResult?.data?.getNfts?.myNfts
            ? userNFTsResult.data.getNfts.myNfts
            : []
    const userNFTs = [...reservedNFTs, ...myNFTs]
    const className = ['vault-page']
    if (payMode) className.push('vault-page-pay')

    //console.log('currentWorkspace', currentWorkspace)


    return (
        <div className={className.join(' ')}>
            <div className="vault-page__vault">
                <div className="vault-items">
                    <div className="vault-page__id hidden">
                        <AddressView address={vaultId} />
                    </div>
                    {
                        assets && !noAccess &&
                        assets.length > 0 &&
                        assets.sort((a, b) => currencySort(a.currency, b.currency)).map((asset) => {
                            return (
                                <>
                                    <VaultBalance
                                        key={asset.id}
                                        asset={asset}
                                        active={view == asset.id}
                                        onClick={setView}
                                        loading={userAssetsResult.fetching}
                                        reload={reloadBalance}
                                    />
                                </>

                            )
                        })
                    }
                    {
                        assets && assets.length == 0 &&
                        choices.currencies.map(c =>
                            <VaultDemoBalance
                                label={c.label}
                                onClick={handleDemoModal}
                            />
                        )

                    }
                    <VaultNFTs
                        active={view == -1}
                        onClick={setView}
                        nfts={
                            userNFTs.filter(
                                (n) => n.status !== AppNftStatusChoices.INITED,
                            ).length
                        }
                        loading={userAssetsResult.fetching}
                        reload={reloadBalance}
                    />
                </div>
                <div className="vault-footer" /*onClick={handleFooterClick}*/>
                    <div className="secured hidden">
                        Secured by{' '}
                        <div>
                            <img
                                width="100"
                                src={require('assets/images/firebloks.svg')}
                                alt="Fireblocks Service"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {payMode ? (
                <VaultPay
                    pay={pay}
                    currency={currency}
                    title={text}
                    icon={'i-usdt'}
                    amountTitle={
                        amountTitle ? amountTitle : 'Amount to be sent'
                    }
                    assets={assets}
                    escrows={escrows}
                    onPay={() =>
                        onPay ? onPay() : console.log('nothing to do')
                    }
                    onCancel={() =>
                        onCancel ? onCancel() : console.log('nothing to do')
                    }
                    loading={userAssetsResult.fetching}
                />
            ) : (
                <>
                    <VaultViewBalance
                        onDeposit={(address) => setDepositModal(address)}
                        assetId={view}
                        assets={assets}
                        escrows={escrows}
                        reload={reloadBalance}
                        readOnly={
                            currentWorkspace?.role ==
                            AppWorkspaceRoleChoices.REPRESENTATIVE
                        }
                    />

                    {view == -1 && <VaultViewNFTList nftList={userNFTs} />}
                </>
            )}

            <Modal
                title="Deposit USDT"
                modalIsOpen={!!depositModal}
                onRequestClose={() => {
                    setDepositModal(null)
                }}
                isCloseIcon={true}
                buttons={[
                    {
                        title: 'Close',
                        onClick: () => {
                            setDepositModal(null)
                        },
                    },
                ]}
            >
                <div className="modal__paragraph center">
                    <QRCodeSVG value={depositModal} />
                </div>
                <div className="modal__paragraph">
                    Send <strong>only USDT</strong> to this deposit address. Use
                    only the indicated network. Otherwise your funds will be
                    lost.
                </div>
                <div className="modal__title">USDT deposit address:</div>
                <AddressView address={depositModal} />
                <div className="modal__title">Network</div>
                <div className="modal__paragraph">Ethereum (ERC20)</div>
            </Modal>
            <Modal
                title="This is demo vault"
                modalIsOpen={demoModal}
                isCloseIcon={false}
                onRequestClose={() => setDemoModal(false)}
                buttons={[
                    {
                        title: 'Got it',
                        type: 'secondary',
                        onClick: () => setDemoModal(false),
                    },
                    {
                        title: 'To workspaces',
                        onClick: () => router.push('/profile')
                    },
                ]}
            >
                To use the vault, you need to create a workspace and/or undergo the compliance check.
            </Modal>
        </div>
    )
}

export default Vault
