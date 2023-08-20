import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AdStatus } from 'src/types'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch, RootState } from 'src/store'
import { useProfile } from 'src/hooks'
import { setNotification } from 'src/reducers/notificationReducer'
import Layout from 'src/hoc/Layout'
import { setConfirm } from 'src/reducers/confirmReducer'
import LoaderView from 'src/components/LoaderView/LoaderView'
import { useCurrentWorkspace } from 'src/hooks'
import { 
  //useCreateDeal, 
  useMakeReserve,
  useGetAd,
  Currency,
  useAddFiats,
  AppWorkspaceRoleChoices,
  Deal, 
  //useBlockchainStatusRoute 
} from 'src/generated/graphql'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import Wallet from 'src/components/Vault/Vault'
import PaymentInvite from 'src/components/PaymentInvite/PaymentInvite'
import { DealPermission } from 'src/types'

interface IPrepayment {
  deal: Deal
  isSeller: boolean
  onReload: () => void
  permissions: DealPermission
  onHelpModal?: (n: boolean) => void
  //onReject: (setLoadng: (isLoading: boolean) => void) => Promise<boolean>
}

const Prepayment: React.FC<IPrepayment> = props => {
  const {
    deal,
    isSeller,
    permissions,
    onReload,
    onHelpModal
  } = props
  const router = useHistory()
  const [deposit, setDeposit] = useState<any>()
  const [currency, setCurrency] = useState<Currency>()
  const [item, setItem] = useState<number>()
  const [ adStatus, setAdStatus ] = useState<AdStatus>(null)
  const dispatch: AppDispatch = useDispatch()
  const [onWallet, setOnWallet]=useState<boolean>(false)
  //const [, createDeal] = useCreateDeal()
  const [, reserve] = useMakeReserve()
  //const { id: adId } = useParams<{ id: string }>()
  const adId = deal.ad.id
  const [isPaying, setIsPaying] = useState<boolean>(false)
  const currentWorkspace = useCurrentWorkspace()
  const readOnly = currentWorkspace.role == AppWorkspaceRoleChoices.REPRESENTATIVE
  const [, getAd] = useGetAd()
  const profile = useProfile()
  const [, addFiats] = useAddFiats()

  useEffect(() => {
    dispatch(setCommonLoader(true))

    getAd({ adId: adId })
      .then(res => {
        const response = res.data.getAd
        const runtimeError = response.runtimeError
        const ad = response.ad
        if (runtimeError) {
          console.error(`[${runtimeError.message}]: ${runtimeError.message}`)
          return false
        }

        const update = () => {
          setItem(response.ad.itemId)
          setAdStatus(response.ad.status)
          setDeposit((ad.termsOfPayment.aircraftPrice * ad.termsOfPayment.depositPercent) / 100)
          setCurrency(ad.termsOfPayment.currency)
        }
        
        update()

      })
      .catch(error => console.error(error))
      .finally(() => dispatch(setCommonLoader(false)))
  }, [adId])

  const handlePay = async () => {
    if (!isPaying) {
      setIsPaying(true)
      dispatch(setCommonLoader(true))

      /*const cd = () => createDeal({ adId: adId }).then(res => {
        //dispatch(setCommonLoader(false)) 
        setIsPaying(false)
        const response = res?.data?.createDeal
        const runtimeError = response?.runtimeError
        if (runtimeError) {
          console.error(`${runtimeError.exception}: ${runtimeError.message}`)
          return false
        }
        //router.push(`/deal-process/${response.deal.id}`)
        router.push(`/deals`)
      })*/

      const cd = () => reserve({ dealId: deal.id }).then(res => {
        //dispatch(setCommonLoader(false)) 
        setIsPaying(false)
        const response = res?.data?.reserve
        const runtimeError = response?.runtimeError
        if (runtimeError) {
          console.error(`${runtimeError.exception}: ${runtimeError.message}`)
          return false
        }
        //router.push(`/deal-process/${response.deal.id}`)
        router.push(`/deals`)
      })

      if (profile.isDemo && !currency.isCrypto) {
        addFiats({
          amount: deposit, 
          currency: currency.value
        }).then(res => {
          cd()
        })
      } else {
        cd()
      }
    }
  }

  return (
    <DealProcessLayout title="Aircraft reservation" 
      noAccess={readOnly}
      links={[
        {title: "Help", onClick: () => console.log('Help')},
      ]}
      leftButtons={[
        { title: adStatus == AdStatus.PUBLISHED ? "Back" : "Home", onClick: () => router.push(adStatus == AdStatus.PUBLISHED ? `/product/${adId}` : '/') },
      ]}
      center={!onWallet}
      // /*rightButtons={[
      //   {title: "Pay", onClick: () => setOnWallet(true), display: !onWallet },
      // ]}*/
    >
      {
        adStatus == AdStatus.PUBLISHED && currency ?
        (
          onWallet ?
          <Wallet amountTitle={'Reservation deposit'} onPay={handlePay} onCancel={() => router.push('/')} pay={deposit} currency={currency} text='Please confirm the reservation of the aicraft. The following amount will be blocked in the escrow account unless you cancel the reservation.'/>
          :
          currency !== null &&
          <PaymentInvite 
            showBank={!currency.isCrypto}
            buttonTitle={currency.isCrypto ? "Next" : "Reserve aircraft"}
            pay={deposit} 
            readOnly={readOnly}
            onPay={handlePay}
            onWallet={() => setOnWallet(true)}
            title={'Deposit amount'}
            currency={currency} 
            message={
              currency.isCrypto ? [<>By reserving the aircraft (along with its corresponding NFT), you acquire the right to initiate the aircraft purchase transaction. To do this, you must transfer a reservation deposit into a segregated escrow account. This deposit is entirely refundable unless you enter into a legally binding agreement with the Seller. If the transaction proceeds, the deposit will be treated as a down payment for the aircraft.</>]
                : 
              [<>Please confirm the reservation  of the Aircraft. Funds are totally refundable until an Aircraft Purchase Agreement is signed. If the transaction proceeds, the deposit will be treated as a down payment for the Aircraft.  </> ]
            } 
            insufficientFundsMessage={
              currency.isCrypto ? [<>By reserving the aircraft (along with its corresponding NFT), you acquire the right to initiate the aircraft purchase transaction. To do this, you must transfer a reservation deposit into a segregated escrow account. This deposit is entirely refundable unless you enter into a legally binding agreement with the Seller. If the transaction proceeds, the deposit will be treated as a down payment for the aircraft.</>]
                : 
              [<>To reserve the Aircraft, you need to make a deposit by wire transfer to the closings provider AIC Global Limited. Funds are totally refundable until an Aircraft Purchase Agreement is signed. If the transaction proceeds, the deposit will be treated as a down payment for the Aircraft. As soon as funds are deposited, you will be able to reserve the Aircraft.  You can check the deposit in your Vault. If necessary, you can contact AIC Global Limited team directly for payment arrangements. </> ]
            } 
          />
        ) :
        <div className="ad-not-available">{adStatus === null ? <LoaderView ring /> : 'Sorry, this ad is not published'}</div>
      }
    </DealProcessLayout>

  )
}

export default Prepayment
