import React, { ReactNode, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import DealCalendar from 'src/components/DealCalendar/DealCalendar'
import Sticky from 'react-sticky-el'
import Button from 'src/components/Button/Button'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import {
  useGetDeal,
  Deal,
  AppDealStatusChoices
} from 'src/generated/graphql'
import Layout from 'src/hoc/Layout'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch, RootState } from 'src/store'
import './TermsAndConditions.scss'



const TermsAndConditions: React.FC = props => {

  const [isSeller, setSeller] = useState<boolean>()
  const profileId = useSelector((state: RootState) => state.user.profile.currentWorkspace.id)
  const [currentStatus, setCurrentStatus] = useState<AppDealStatusChoices>()
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
        const isSeller = response.deal.buyer.id !== profileId
        setSeller(isSeller)
        setDeal(response.deal)
        setCurrentStatus(response.deal.status)

      })
      .catch(error => console.error(error))
      .finally( () => dispatch(setCommonLoader(false)))

  }, [currentStatus])


  return (
    <Layout>
      <div className="deal-calendar-page calendar-container">
        <DealProcessLayout title="Deal Schedule"
          leftButtons={[
            {title: "Return to Deals", onClick: () => router.push('/deals')},
          ]}
        >
          <span>111</span>
        </DealProcessLayout>
      </div>
    </Layout>
  )
}

export default TermsAndConditions
