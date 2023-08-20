import React, { ReactNode, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import DealCalendar from 'src/components/DealCalendar/DealCalendar'
import Sticky from 'react-sticky-el'
import Button from 'src/components/Button/Button'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import { useCurrentWorkspace } from 'src/hooks'

import {
  useGetDeal,
  Deal
} from 'src/generated/graphql'
import Layout from 'src/hoc/Layout'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch, RootState } from 'src/store'


import './DealCalendarPage.scss'



const DealCalendarPage: React.FC = props => {

  const [isSeller, setSeller] = useState<boolean>()
  const currentWorkspace = useCurrentWorkspace()
  const [currentStatus, setCurrentStatus] = useState<string>()
  const [deal, setDeal] = useState<Deal>()
  const { dealId } = useParams<{ dealId: string }>()
  const dispatch: AppDispatch = useDispatch()
  const router = useHistory()
  const [, getDeal] = useGetDeal()

  useEffect(() => {
    dispatch(setCommonLoader(true))
    getDeal({ dealId: dealId })
      .then(res => {
        const response = res.data.getDeal
        
        const runtimeError = response.runtimeError
        if (runtimeError) {
          console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
          return false
        }
        const isSeller = response.deal.buyer.id !== currentWorkspace?.id
        setSeller(isSeller)
        setDeal(response.deal)
        setCurrentStatus(response.deal.status)

      })
      .catch(error => console.error(error))
      .finally( () => dispatch(setCommonLoader(false)))

  }, [currentStatus])
    

  return (
    <Layout>
      <div className="deal-calendar-page calendar-container container">
        <DealProcessLayout title="Deal Schedule"
          leftButtons={[
            {title: "Return to Deals", onClick: () => router.push('/deals')},
          ]}
        >
          {deal &&
            <DealCalendar deal={deal} />
          }
        </DealProcessLayout>
      </div>
    </Layout>
  )
}

export default DealCalendarPage
