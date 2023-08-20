import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router'
import Avatar from 'src/components/Avatar/Avatar'
import Icon from 'src/components/Icon/Icon'
import LoaderView from 'src/components/LoaderView/LoaderView'
import DealInfo from '../DealInfo/DealInfo'
import DealDetails from '../DealDetails/DealDetails'
import {
  AppDealStatusChoices,
  AppUploadedDealFileDocTypeChoices,
  Deal,
  useGetDeal,
  useGetDealStatus,

} from 'src/generated/graphql'
import { AppDispatch } from 'src/store'
import DealSteps from 'src/components/DealSteps/DealSteps'
import { setNotification } from 'src/reducers/notificationReducer'
import {
  hasDealAccess,
  preClosingFilled,
  formatPrice,
  getCalendarArray,
  getCurrentCalendarStep,
  calendarArrayStep,
  getStateRelativeIndex,
  isDocumentSigned,
  DocumentSignedFlag,
  isBlockchainHoldingTheDeal,
  getLastDealDocument,
  adminAction,
  getImageLink,
  getImageRatio,
  ImageStyles,
  responsibleWorkspaceId,
  getDealStateMessage,
} from 'src/helper'
import { id } from 'date-fns/locale'
import './ActiveDeal.scss'
import DealOptions from 'src/components/DealOptions/DealOptions'
import { useProfile } from 'src/hooks'
import CardImage from 'src/components/CardImage/CardImage'
import { ITimeLeft, IActiveDeal } from 'src/types'

const useInterval = (callback, delay) => {
  const savedCallback = useRef<any>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


const getTimeLeft = (step: calendarArrayStep): ITimeLeft => {
  return { text: '', overdue: false }
  const aDay = 24 * 60 * 60 * 1000
  const now = new Date()
  const pluralDays = (t: number): string => {
    return t !== 1 ? 'days' : 'day'
  }
  var left = 0
  if (step?.actions?.length && step.actions.length > 0) {
    if (step.actions[0].joinedDays) {
      left = Math.round((step.expectedDate.getTime() - now.getTime()) / aDay)
    } else {
      step.actions.forEach(action => {
        if (action.isCurrent) {
          left = Math.round((action.expectedDate.getTime() - now.getTime()) / aDay)
        }
      })
    }
    if (left) {
      if (left > 0) {
        return { text: `You have ${left} ${pluralDays(left)} to complete this step`, overdue: false }
      } else {
        return { text: `You are not meeting your recommended timeframes. This step is ${-left} ${pluralDays(-left)} overdue.`, overdue: true }
      }
    }
  }
  return { text: '', overdue: false }
}

const getDepositAmount = (deal: Deal): number => {
  if (deal?.fireblocksAccount?.fireblocksAssets?.length > 0) {
    let deposit: number = null
    deal.fireblocksAccount.fireblocksAssets.forEach(asset => {
      if (asset?.fireblocksDestinationTransactions.length > 0) {
        deposit = asset.fireblocksDestinationTransactions[0].amount
      }
    })
    return deposit
  }
  return null
}

const ActiveDeal: React.FC<IActiveDeal> = React.memo((props) => {
  const [deal, setDeal] = useState<Deal>(props?.deal)
  const {
    id: dealId,
    isOnTermsAndConditions,
    status,
    ad: { id: adId, mainInformation, owner, aircraftDocuments },
    discrepanciesRemoval,
    documents,
    termsAndCond,
  } = props?.deal
  // console.log('active deal status', status)

  const adDocuments = deal?.ad?.documents

  const title = mainInformation?.manufacturer?.label + ' ' + mainInformation?.model?.label + ' ' + status;

  const { name, images } = mainInformation
  const profile = useProfile()
  const workspaceId = profile.currentWorkspace.id
  const [isBuyer, setBuyer] = useState<boolean>(deal.buyer.id == profile.currentWorkspace?.id || responsibleWorkspaceId(profile.currentWorkspace) == deal?.buyer?.id)
  const [isSeller, setSeller] = useState<boolean>(deal.seller.id == profile.currentWorkspace?.id || responsibleWorkspaceId(profile.currentWorkspace) == deal?.seller?.id)
  const dealAccess = hasDealAccess(deal, isSeller)
  const dealPending = deal?.isPending
  const [dealLoader, setDealLoader] = useState<boolean>(false)
  const dealStateMessageText = getDealStateMessage(deal, dealAccess, isSeller, dealLoader)
  const [, getDeal] = useGetDeal()
  const [, getDealStatus] = useGetDealStatus()
  const router = useHistory()
  const dispatch: AppDispatch = useDispatch()
  const participant = isSeller ? deal?.buyer : owner
  const dealCardClass = ["deal-card"]
  const dealClosed: boolean = deal?.status == AppDealStatusChoices.DC || deal?.status == AppDealStatusChoices.DR
  const cardLabel = isBuyer ? 'buy' : 'sell'
  //const deposit = 0//deal?.ad?.termsOfPayment?.depositAmount ? formatCurrency(deal.ad.termsOfPayment.depositAmount) : 0
  const deposit = formatPrice(getDepositAmount(deal))
  const currency = deal.ad.termsOfPayment.currency.label
  const dealSteps = getCalendarArray(deal)
  const currentStep = getCurrentCalendarStep(dealSteps)
  const timeLeft = getTimeLeft(currentStep)
  const onTCRenegotiation = +deal.isOnTermsAndConditions && getStateRelativeIndex(deal.status) >= getStateRelativeIndex(AppDealStatusChoices.PDWB)
  const canReject = new Date().getTime() - new Date(deal.dateCreated).getTime() > 3 * 60 * 1000 && getStateRelativeIndex(deal.status) <= getStateRelativeIndex(AppDealStatusChoices.AWB) && !isBlockchainHoldingTheDeal(deal.status)
  const isReserved = getStateRelativeIndex(deal?.status) >= 4
  // console.log('isReserved', isReserved)
  // console.log('status', deal?.status)
  // console.log('status', getStateRelativeIndex(deal?.status))

  if (dealClosed) dealCardClass.push('deal-closed')
  if (dealAccess) dealCardClass.push('deal-attantion')
  if (dealPending) dealCardClass.push('deal-pending')

  const handleReject = (dealId: string) => {
    setDealLoader(true)
    if (props.onReject) props.onReject(dealId)
  }

  const handleCancelNegotiation = (dealId: string) => {
    setDealLoader(true)
    if (props.onCancelNegotiation) props.onCancelNegotiation(dealId)
  }

  useEffect(() => {
    if (profile?.isDemo) {
      if (deal?.status == AppDealStatusChoices.CCWA) {
        adminAction('complete-deal', dealId, null)
      }
    }
  }, [deal.status, profile?.isDemo])

  useInterval(() => {
    getDealStatus({ dealId: dealId }).then((res) => {
      if (res?.data?.getDeal?.deal?.status) {
        const dealRefresh = res.data.getDeal.deal
        const lastDocument = getLastDealDocument(deal)
        const lastNewDocument = getLastDealDocument(dealRefresh)
        if (dealRefresh.status !== status ||
          dealRefresh.isOnTermsAndConditions !== isOnTermsAndConditions ||
          dealRefresh?.termsAndCond?.turn !== deal?.termsAndCond?.turn ||
          lastDocument?.buyerSign !== lastNewDocument?.buyerSign ||
          lastDocument?.sellerSign !== lastNewDocument?.sellerSign ||
          dealRefresh?.termsAndCond?.isOnDocument !== deal?.termsAndCond?.isOnDocument) {
          getDeal({ dealId: dealId }).then((res) => {
            setDeal(res.data.getDeal.deal)
          })
        }
      }
    })
  }, 5000)

  return (
    <div
      className={dealCardClass.join(' ')}
      id={`deal-${dealId}-ad-${adId}`}
    >
      <div className="deal-card__wrapper">
        <div
          className="deal-card__image"
          style={{ aspectRatio: `${getImageRatio(ImageStyles.ACTIVE_DEAL)} / 1` }}
        >
          <CardImage
            ratio={getImageRatio(ImageStyles.ACTIVE_DEAL)}
            src={getImageLink(images.sort((a, b) => a.order > b.order ? 1 : -1)?.[0], ImageStyles.ACTIVE_DEAL)}
            onClick={
              () => {
                return (
                  router.push(`/product/${adId}`)
                )
              }
            }
            title={title}
          />
          <Avatar
            className="deal-card__avatar"
            workspace={participant}
            isBlurred={getStateRelativeIndex(deal.status) <= getStateRelativeIndex(AppDealStatusChoices.TCA)}
          />
        </div>
        <div className={`deal-card__body ${dealClosed ? 'deal-card__closed' : ''}`}>
          <div className="deal-card__content">
            <div className="deal-card__title">
              <div className="deal-card__title__main">
                <div className={`deal-card__label deal-card-label--${cardLabel}`}>
                  {cardLabel}
                </div>
                <div className="deal-card__ad-title">
                  {title}
                </div>
              </div>
              {dealClosed &&
                <div className="deal-card__title__state">
                  {deal.status == AppDealStatusChoices.DC ?
                    <>
                      Completed <Icon name="check" />
                    </>
                    :
                    <>
                      Rejected <Icon name="i-reject" />
                    </>
                  }
                </div>
              }
            </div>
            {
              dealClosed ?
                <DealDetails
                  deal={deal}
                  isReserved={isReserved}
                />
                :
                <>{
                  deal.status !== AppDealStatusChoices.BWR &&
                  <DealSteps /*isWithTitles={false} */ deal={deal} steps={dealSteps} />
                }
                  {
                    deal?.dateDeposit &&
                    <div className="deal-card__deposit">
                      Deposit amount paid:&nbsp;
                      <span>{currency} </span>
                      &nbsp;
                      <span className="deal-card__deposit-amount">{deposit}</span>
                    </div>
                  }
                </>
            }
          </div>
          {!dealClosed &&
            <DealInfo
              dealStateMessage={dealStateMessageText}
              onTCRenegotiation={onTCRenegotiation}
              timeLeft={timeLeft}
              dealAccess={dealAccess}
              dealPending={dealPending}
              dealId={dealId}
              dealStatus={deal.status}
              isBuyer={isBuyer}
            />}
        </div>
      </div>
      {
        !dealClosed ?
          <DealDetails
            deal={deal}
            dealAccess={dealAccess && !dealPending}
            onReject={handleReject}
            onCancelNegotiation={handleCancelNegotiation}
            canReject={canReject}
            isReserved={isReserved}
          />
          :
          null
      }
    </div>
  )
})

export default ActiveDeal
