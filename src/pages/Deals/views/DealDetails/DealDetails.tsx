import React, { useState } from 'react'
import {
    AppDealStatusChoices,
    AppPermissionsRoleChoices,
} from 'src/generated/graphql'
import {
    useTermsAndConditionsRenegotiate,
    getStateRelativeIndex,
} from 'src/helper'
import Button from 'src/components/Button/Button'
import { useCurrentWorkspace } from 'src/hooks'
import { IActiveDeal } from 'src/types'
import { useHistory } from 'react-router-dom'

const DealDetails: React.FC<IActiveDeal> = React.memo(props => {
    const {
        deal,
        dealAccess,
        onReject,
        onCancelNegotiation,
        canReject = false,
        isReserved
    } = props
    // console.debug('deal', deal)
    const [showActions, setShowActions] = useState<boolean>(false)
    const dealClosed: boolean = deal?.status == AppDealStatusChoices.DC || deal?.status == AppDealStatusChoices.DR
    const [tcRenegotiate] = useTermsAndConditionsRenegotiate()
    const currentWorkspace = useCurrentWorkspace()
    const router = useHistory()
    const isDealAdmin =
        currentWorkspace?.id == deal?.buyer?.id ||
        currentWorkspace?.id == deal?.seller?.id ||
        deal?.ad?.permission?.role == AppPermissionsRoleChoices.MANAGER ||
        deal?.ad?.permission?.role == AppPermissionsRoleChoices.SIGNEE

    const canRenegotiate =
        // Проверяем, не находятся сделка в переговорах
        !deal.isOnTermsAndConditions &&
        (
            // Тут присутствует вилка статус, при которых возможно начать переговоры
            // PPI_DETAILS_WAITING_BUYER
            getStateRelativeIndex(deal?.status) >= getStateRelativeIndex(AppDealStatusChoices.PDWB) &&
            // FINAL_PAYMENT_WAITING_BUYER
            getStateRelativeIndex(deal?.status) <= getStateRelativeIndex(AppDealStatusChoices.FPWB)
        )

    const handleReject = () => {
        setShowActions(false)
        onReject(deal?.id)
    }

    const handleCancelNegotiation = () => {
        setShowActions(false)
        onCancelNegotiation(deal?.id)
    }

    const handleRenegotiate = () => {
        setShowActions(false)
        tcRenegotiate(deal?.id)
    }

    const handleCalendar = () => {
        setShowActions(false)
        window.open(`/deal-calendar/${deal?.id}`, '_blank')
    }

    const handleOverview = () => {
        router.push(`/deals/${deal?.id}/overview`)
    }

    const toggleActions = () => {
        setShowActions(!showActions)
    }

    console.debug('canRenegotiate', canRenegotiate)
    console.debug('dealAccess', dealAccess)
    console.debug('canReject', canReject)

    return (
        <div className="deal-card__details">
            <div className="deal-card__actions">
                <div>
                    {
                        isReserved &&
                        // isReserved || 
                        // !deal?.isOnTermsAndConditions &&
                        <>
                            <Button
                                type="transparent"
                                onClick={handleOverview}
                            >
                                Overview
                            </Button>
                            {!dealClosed &&
                                <Button
                                    type="transparent"
                                    onClick={handleCalendar}
                                >
                                    Calendar
                                </Button>
                            }
                        </>
                    }
                </div>
                <div>
                    <div className="deal-card__actions--dropdown">
                        {
                            !isReserved ?
                                <Button
                                    className={`deal-card__btn deal-card__btn--${showActions ? 'open' : 'close'}`}
                                    // size="small"
                                    type="transparent"
                                    onClick={toggleActions}
                                >
                                    Actions
                                </Button>
                                :
                                <Button
                                    className={`deal-card__btn deal-card__btn--${showActions ? 'open' : 'close'}`}
                                    // size="small"
                                    type="transparent"
                                    onClick={toggleActions}
                                    disabled={((!canReject && !canRenegotiate) || !isDealAdmin || (isReserved && !dealAccess))}
                                >
                                    Actions
                                </Button>
                        }
                        <div className={`deal-card__actions--dropped ${showActions ? 'show' : 'hidden'}`}>
                            {
                                isReserved ?
                                    <>
                                        {
                                            canRenegotiate &&
                                            dealAccess &&
                                            // canReject &&
                                            <Button
                                                className="deal-card__btn"
                                                onClick={handleRenegotiate}
                                                type="transparent"
                                            >
                                                T&amp;C Renegotiate
                                            </Button>
                                        }
                                        <Button
                                            className="deal-card__btn"
                                            onClick={handleReject}
                                            disabled={!canReject}
                                            type="transparent"
                                        >
                                            Cancel Reservation
                                        </Button>


                                    </>
                                    :
                                    <Button
                                        className="deal-card__btn"
                                        onClick={handleCancelNegotiation}
                                        type="transparent"
                                    >
                                        Cancel Negotiations
                                    </Button>
                            }
                        </div>
                    </div>
                    {/* {
                        !dealClosed &&
                        <Button
                            className="deal-card__btn"
                            onClick={() => router.push(`/deal-process/${deal?.id}`)}
                            disabled={!dealAccess}
                        >
                            {deal?.status === AppDealStatusChoices.RWB ? 'Reserve aircraft' : 'Go to deal'}
                        </Button>
                    } */}
                </div>
            </div>
        </div >
    )
})

export default DealDetails