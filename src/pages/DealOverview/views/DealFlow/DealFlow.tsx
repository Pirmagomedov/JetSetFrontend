import React from 'react'
import Accordion from 'src/components/Accordion/Accordion'
import DealHeader from '../DealHeader/DealHeader'
import { LogDealType } from 'src/generated/graphql'
import { formatDate } from 'src/helper'


interface IDealFlow {
    logDeals: any[]
    currentStatus: string
}

const DealFlow: React.FC<IDealFlow> = (props) => {
    const { logDeals, currentStatus } = props

    return (
        <div className="dealOverview__content__sidebar appear">
            <Accordion
                initialState={true}
                underline={true}
            >
                <DealHeader title="Deal Flow" />
                <div className="dealOverview__content__sidebar__body">
                    <div className="dealOverview__content__sidebar__log--title"><span>Current Status:</span> {currentStatus}</div>
                    <div className="dealOverview__content__sidebar__log">
                        {
                            logDeals?.map((item, index) => {
                                console.debug('deal log', item)
                                return (
                                    <div className="dealOverview__content__sidebar__log--item">
                                        <div className="deal_Overview__log__date">{formatDate(new Date(Date.parse(item?.createdAt)))}</div>
                                        <div className="deal_Overview__log__title">{item?.title}</div>
                                        <div className="deal_Overview__log__user">{`${item?.user?.kycInfo?.firstName} ${item?.user?.kycInfo?.lastName}`}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </Accordion>
        </div>
    )
}

export default DealFlow