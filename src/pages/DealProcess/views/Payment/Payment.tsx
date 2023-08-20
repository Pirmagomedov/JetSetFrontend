import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import Button from 'src/components/Button/Button'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { setNotification } from 'src/reducers/notificationReducer'
import {
  useGlobalPrefs,
  useAddFiats,
  AppWorkspaceRoleChoices
} from 'src/generated/graphql'
import { RootState } from 'src/store'
import { 
  Deal, 
  useBlockchainStatusRoute 
} from 'src/generated/graphql'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import Wallet from 'src/components/Vault/Vault'
import PaymentInvite from 'src/components/PaymentInvite/PaymentInvite'
import LoaderView from 'src/components/LoaderView/LoaderView'
import { useChatButton } from 'src/hooks'
import {
  useProfile,
  useCurrentWorkspace
} from 'src/hooks'
import { adminAction } from 'src/helper'
import { DealPermission } from 'src/types'


interface IPayment {
  deal: Deal
  isSeller: boolean
  onReload: () => void
  permissions: DealPermission
  //onReject: (setLoadng: (isLoading: boolean) => void) => Promise<boolean>
}

const Payment: React.FC<IPayment> = props => {
  const { deal, isSeller, onReload, permissions } = props
  const [isLoading, setLoading] = useState<boolean>(false)
  const [, globalPrefs] = useGlobalPrefs()
  const dealId = deal.id;
  const currency = deal.ad.termsOfPayment.currency
  const isCrypto = currency.isCrypto
  const buyerPrice = deal?.termsAndCond?.buyerTerms?.aircraftPrice
  const aircraftPrice = buyerPrice ? +buyerPrice : 0
  const [fee, setFee] = useState<number>()
  const commission = +deal?.termsAndCond?.buyerTerms?.termsOfPayment?.sideFeeAmount
  const depositAmount = +deal?.termsAndCond?.buyerTerms?.termsOfPayment?.depositAmount
  const [onWallet, setOnWallet] = useState<boolean>(false)
  const payment = aircraftPrice - depositAmount + commission
  const currentWorkspace = useCurrentWorkspace()
  const readOnly = currentWorkspace.role == AppWorkspaceRoleChoices.REPRESENTATIVE
  const dispatch = useDispatch()
  const router = useHistory()
  const [, blockchainStatusRoute] = useBlockchainStatusRoute()
  const profile = useProfile()
  const [, addFiats] = useAddFiats()
  const openChat = useChatButton()

  const handleChat = () => {
    openChat(deal.buyer.user.id, deal.seller.user.id, deal.ad)
  }

  useEffect(() => {
    globalPrefs().then(res => {
      if (res?.data?.preferences?.platformDealFee) {
        setFee(res.data.preferences.platformDealFee)
      }
    })
  }, [])

  const handleStatusRoute = (call: () => void = null) => {
    setLoading(true)
    blockchainStatusRoute({ dealId }).then(res => {
      const response = res.data.blockchainStatusRoute
      const errors = response.runtimeError
      if (errors) {
        console.error(errors.message)
        setLoading(false)
        return false
      }
      if (response) {
        if (call) call()
        dispatch(setCommonLoader(true))
        router.push('/deals')
        //onReload()
        //router.go(0)
      }
    })
  }

  const handleMakePayment = async () => {
    dispatch(setCommonLoader(true))
    if (profile.isDemo && !currency.isCrypto) {
      addFiats({
        amount: payment,
        currency: currency.value
      }).then(res => {
        handleStatusRoute(() => adminAction('accept-final-payment', dealId, null))
      })
    } else {
      handleStatusRoute()
    }
  }

  return (
    <DealProcessLayout title="Final Payment"
      noAccess={permissions.readOnly}
      links={[
        { title: "Help", onClick: () => console.log('Ffadsfasdgs') },
      ]}
      leftButtons={[
        { title: "Return to Deals", onClick: () => { router.push('/deals'); dispatch(setCommonLoader(true)) } },
        { title: "Chat", onClick: handleChat }
      ]}
      /*rightButtons={[
        {title: "Pay", onClick: () => setOnWallet(true), display: !onWallet },
      ]}*/
      center={!onWallet}
    >
      {
        onWallet ?
          <Wallet
            pay={payment}
            onPay={handleMakePayment}
            onCancel={() => {
              router.push('/deals'); dispatch(setCommonLoader(true))
            }}
            currency={currency}
            text='Please confirm that you want to send the final payment for the aircraft to the escrow account.' />
          :
          fee && currency !== null ?
            <PaymentInvite
              pay={payment}
              showBank={!currency.isCrypto}
              readOnly={readOnly}
              buttonTitle={currency.isCrypto ? "Next" : "Confirm"}
              //ignoreBalance={true}
              calculation={[
                { title: 'Aircraft price', value: aircraftPrice },
                { title: 'Deposit', value: -depositAmount },
                { title: 'Administration fee', value: commission }
              ]}
              onPay={handleMakePayment}
              onWallet={() => setOnWallet(true)}
              currency={currency}
              message={currency.isCrypto ?
                [<>You are about to make the final payment for the Aircraft. These funds will be kept in the escrow account until the deal is closed. </>,]
                :
                [<>You have enough funds in your account with AIC Global Inc. Please confirm the final payment.</>]
              }
              insufficientFundsMessage={
                currency.isCrypto ?
                  [<>You are about to make the final payment for the Aircraft. These funds will be kept in the escrow account until the deal is closed. </>,]
                  :
                  [<>You need to make a payment by wire transfer to the closings provider AIC Global Limited. After the payment, you can check the amount transferred in your Vault. If necessary, you can contact AIC Global Limited team directly for payment arrangements. </>]
              }
            />
            :
            <LoaderView ring />
      }
    </DealProcessLayout>
  )
}

export default Payment


