import React from 'react'
import { useHistory } from 'react-router-dom'
import { ITimeLeft } from 'src/types'
import Icon from 'src/components/Icon/Icon'
import Button from 'src/components/Button/Button'
import DealDocumentPreviewLink from 'src/components/DealDocumentPreviewLink/DealDocumentPreviewLink'
import {
    AppDealStatusChoices,
    AppUploadedDealFileDocTypeChoices,
} from 'src/generated/graphql'

interface IDealInfo {
    dealStateMessage: String | JSX.Element
    dealAccess: boolean
    dealPending: boolean
    dealId: string
    dealStatus: string
    timeLeft: ITimeLeft
    onTCRenegotiation: boolean
    isBuyer?: boolean
}

const DealInfo: React.FC<IDealInfo> = React.memo(props => {
    const {
        dealStateMessage,
        dealAccess,
        dealPending,
        dealId,
        timeLeft,
        onTCRenegotiation,
        dealStatus,
        isBuyer
    } = props
    const router = useHistory()
    const numRegex = /\d+/g;

    return (
        <div className="deal-card__info">
            <div className="deal-card-title">
                {
                    !dealPending &&
                    <div className="deal-card__message">
                        <Icon width={22} height={22} name={dealAccess ? 'dealAction' : 'pending'} />
                        <div className="deal-card__message--text">
                            {dealStateMessage}
                        </div>
                    </div>
                }
                {
                    dealStatus == AppDealStatusChoices.AWB || dealStatus == AppDealStatusChoices.AWS &&
                    isBuyer &&
                    <DealDocumentPreviewLink
                        dealId={dealId}
                        docType={AppUploadedDealFileDocTypeChoices.PA}
                        classname="document-link__button-alike"
                    />
                }
            </div>
            {
                dealAccess && !dealPending && !onTCRenegotiation && (
                    timeLeft.overdue ?
                        // Модификатор --overdue красит текст в красный, если превышено рекомендуемое время на подписание
                        <div className="deal-card__time deal-card__time--overdue">{timeLeft.text}</div>
                        :
                        // в ином случае, все выводить как обычно
                        <div className="deal-card__time">{timeLeft.text}</div>
                )
            }
            {dealAccess && !dealPending &&
                <div className='deal-card__dealBtn'>
                    <Button
                        className="deal-card__btn"
                        size='small'
                        onClick={() => router.push(`/deal-process/${dealId}`)}
                    >
                        {dealStatus === AppDealStatusChoices.RWB ? 'Reserve aircraft' : 'Go to deal'}
                    </Button>
                </div>
            }
            {
                dealPending &&
                <div className='deal-card__dealBtn'>
                    <Button
                        className="deal-card__btn"
                        size='small'
                        type="transparent"
                        onClick={() => window.open(`/help/terms-of-aircraft-sales-transactions/12`)}
                    >
                       Deal is pending
                    </Button>
                </div>
            }
        </div>
    )
})

export default DealInfo