import React, { useEffect, useState } from 'react'
import PriceTag from 'src/components/PriceTag/PriceTag'
import Button from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import BankData from '../BankData/BankData'
import { useHistory } from 'react-router-dom'
import {
    Currency,
    FireblocksProfile,
    useUserAssets,
    FireblocksAsset,
    FiatAsset,
} from 'src/generated/graphql'
import { getBalance, formatPrice } from 'src/helper'
import { useProfile } from 'src/hooks'
import { useMutation } from 'urql'
import { setNotification } from 'src/reducers/notificationReducer'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'src/store'
import {
    useCreateDeal,
    useFireblocksRefreshBalance,
    useProfileAssetsBalance,
    useMailPaymentInstructions,
} from 'src/generated/graphql'

import LoaderView from 'src/components/LoaderView/LoaderView'
import './PaymentInvite.scss'

type VaultAsset = FireblocksAsset | FiatAsset

interface IPayCalculationItem {
    title: string
    value: number
}

enum ICanPay {
    CHECKING = 'Checking',
    CANPAY = 'Can pay',
    CANTPAY = "Can't pay",
}

interface IPaymentInvite {
    pay: number
    buttonTitle: string
    currency: Currency
    message: Array<JSX.Element>
    insufficientFundsMessage: Array<JSX.Element>
    calculation?: Array<IPayCalculationItem>
    title?: string
    showBank?: boolean
    onPay: () => void
    onWallet: () => void
    ignoreBalance?: boolean
    readOnly?: boolean
}

const PaymentInvite: React.FC<IPaymentInvite> = (props) => {
    const {
        readOnly,
        pay,
        buttonTitle,
        currency,
        message,
        insufficientFundsMessage,
        onPay,
        onWallet,
        calculation,
        showBank,
        title = 'Payment',
        ignoreBalance = false,
    } = props
    const router = useHistory()
    const [updatedBalance, reloadUpdatedBalance] = useFireblocksRefreshBalance()
    const [profileBalance, updateProfileBalance] = useProfileAssetsBalance()
    const [, mailPaymentInstructions] = useMailPaymentInstructions()
    const [balance, setBalance] = useState<number | null>(null)
    const [canPay, setCanPay] = useState<ICanPay>(ICanPay.CHECKING)
    const profile = useProfile()
    const [paymentMessage, setPaymentMessage] = useState<JSX.Element[]>([<></>])
    const [userAssetsResult, reloadAssets] = useUserAssets({
        requestPolicy: 'network-only',
    })
    const [assets, setAssets] = useState<VaultAsset[]>(null)
    const [instructionsSent, setInstructionsSent] = useState<boolean>(false)
    const dispatch: AppDispatch = useDispatch()
    const canDeposit = profile.isDemo ? true : canPay == ICanPay.CANTPAY

    console.log('PaymentInvite', {
        canPay,
        canDeposit,
        isDemo: profile.isDemo,
        pay,
    })

    const mailInstructions = () => {
        mailPaymentInstructions({ currency: currency.value }).then((res) => {
            console.log('mailPaymentInstructions', res)
            if (res?.data?.sendCurrencyRequisites?.success) {
                dispatch(
                    setNotification({
                        text: 'Check your email for payment instructions.',
                    }),
                )
                setInstructionsSent(true)
            }
        })
    }

    useEffect(() => {
        reloadUpdatedBalance().then((res) => {
            reloadAssets()
        })
    }, [])

    useEffect(() => {
        if (!userAssetsResult.fetching) {
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

            assetsNew.forEach((asset) => {
                if (
                    asset?.currency?.label &&
                    asset.currency.label == currency?.label
                ) {
                    setBalance(asset.available)
                }
            })
        }
    }, [userAssetsResult])

    useEffect(() => {
        if (profile.isDemo) {
            setCanPay(ICanPay.CANTPAY)
            setPaymentMessage(insufficientFundsMessage)
        } else {
            if (balance !== null && pay) {
                if (pay * 1 <= balance * 1 || ignoreBalance) {
                    setCanPay(ICanPay.CANPAY)
                    setPaymentMessage(message)
                } else {
                    setCanPay(ICanPay.CANTPAY)
                    setPaymentMessage(insufficientFundsMessage)
                }
            }
        }
    }, [balance])

    return (
        <div className="payment">
            {Array.isArray(paymentMessage) ? (
                paymentMessage.map((m, i) => (
                    <div
                        className="payment__text"
                        key={i}
                    >
                        {m}
                    </div>
                ))
            ) : (
                <div className="payment__text">{paymentMessage}</div>
            )}
            {!currency.isCrypto && showBank && canDeposit && (
                <BankData currency={currency} />
            )}
            <div className="payment__items">
                {calculation ? (
                    <div className="payment__block">
                        <div className="payment__label">Calculation</div>
                        <div className="payment__calculation-table">
                            {calculation.map((c, i) => (
                                <div
                                    className="payment__calculation"
                                    key={`pi${i}`}
                                >
                                    <div className="payment__calculation-title">
                                        {c.title}
                                    </div>
                                    <div className="payment__calculation-value">
                                        {formatPrice(c.value)}
                                    </div>
                                    <div className="payment__calculation-currency">
                                        {currency?.label}
                                    </div>
                                </div>
                            ))}
                            <div className="payment__calculation-total">
                                <div className="payment__calculation-title"></div>
                                <div className="payment__calculation-value">
                                    {formatPrice(pay)}
                                </div>
                                <div className="payment__calculation-currency">
                                    {currency?.label}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="payment__item">
                        <div className="payment__label">{title}</div>
                        <PriceTag
                            amount={pay}
                            currency={currency?.label}
                            icon={false}
                        />
                    </div>
                )}
                {canPay == ICanPay.CHECKING && (
                    <div className="payment__loader">
                        <LoaderView ring />
                    </div>
                )}
                {canPay == ICanPay.CANPAY && (
                    <div className="payment__action">
                        <Button
                            onClick={currency.isCrypto ? onWallet : onPay}
                            disabled={readOnly}
                        >
                            {buttonTitle}
                        </Button>
                    </div>
                )}
                {canDeposit && (
                    <>
                        {currency.isCrypto && (
                            <div className="payment__message">
                                <div className="payment__message-title">
                                    Insufficient funds
                                </div>
                                <div className="payment__message-text">
                                    You need to deposit funds into your account
                                    to reserve Aircraft Token
                                </div>
                            </div>
                        )}
                        <div className="payment__action">
                            <Button
                                type="secondary"
                                onClick={() => router.push('/vault')}
                                disabled={readOnly}
                            >
                                My vault
                            </Button>
                            {currency.isCrypto ? (
                                <Button
                                    onClick={() => router.push('/vault')}
                                    disabled={readOnly}
                                >
                                    Deposit
                                </Button>
                            ) : (
                                !instructionsSent && (
                                    <Button onClick={mailInstructions}>
                                        Send instructions to email
                                    </Button>
                                )
                            )}
                        </div>
                        {profile.isDemo && (
                            <div className="payment__action">
                                <Button
                                    onClick={onPay}
                                    disabled={readOnly}
                                >
                                    Demo pay
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default PaymentInvite
