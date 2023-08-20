import React, { ReactNode, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import {
  AdType,
  DealTermsType,
  Deal,
  InspectionReportType,
  //useGetAd,
  useGetDeal,
  useRejectDealWithoutDeposit,                          
  AppDealStatusChoices,
  AppPermissionsRoleChoices,
} from 'src/generated/graphql'
import { 
  hasDealAccess, 
  permNone, 
  permView, 
  permEdit, 
  permSign, 
  responsibleWorkspaceId 
} from 'src/helper'
import Layout from 'src/hoc/Layout'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch } from 'src/store'
import ModalHelp from './views/ModalHelp/ModalHelp'
import Payment from './views/Payment/Payment'
import Prepayment from './views/Prepayment/Prepayment'
import Terms from './views/Terms/Terms'
import DealSteps from 'src/components/DealSteps/DealSteps'
import Jdun from './views/Jdun/Jdun'
import Agreement from './views/Agreement/Agreement'
import PreClosing from './views/PreClosing/PreClosing'
import Closing from './views/Closing/Closing'
import DiscrepanciesRemoval from './views/DiscrepanciesRemoval/DiscrepanciesRemoval'
import DiscrepanciesRemovalAccept from './views/DiscrepanciesRemovalAccept/DiscrepanciesRemovalAccept'
import InspectionReport from './views/InspectionReport/InspectionReport'
import PrePurchaseInspection from './views/PrePurchaseInspection/PrePurchaseInspection'
import InspectionConfirm from './views/InspectionConfirm/InspectionConfirm'
import TechnicalAcceptanceSign from './views/TechnicalAcceptanceSign/TechnicalAcceptanceSign'
import TechnicalAcceptanceClose from './views/TechnicalAcceptanceClose/TechnicalAcceptanceClose'
import ClosingDocuments from './views/ClosingDocuments/ClosingDocuments'
import WarrantyAssignment from './views/WarrantyAssignment/WarrantyAssignment'
import ClosingInstructions from './views/ClosingInstructions/ClosingInstructions'
import Amendment from './views/Amendment/Amendment'
//import DealClose from './views/DealClose/DealClose'
import RejectionLetterSign from './views/RejectionLetterSign/RejectionLetterSign'
import Dispute from './views/Dispute/Dispute'
import Icon from 'src/components/Icon/Icon'
import { useCurrentWorkspace } from 'src/hooks'
import LoaderView from 'src/components/LoaderView/LoaderView'
import { DealPermission } from 'src/types'
import './DealProcess.scss'




const DealNoPermission: React.FC = props => {
  return <div>You don’t have permissions to view this deal</div>
}


enum AppDealStatusExtra {
  TCR = 'TCR'
}

type AppDealStatusFE = AppDealStatusChoices | AppDealStatusExtra


const DealProcess: React.FC = props => {

  const [isSeller, setIsSeller] = useState<boolean>()
  const [dealPermissions, setDealPermissions] = useState<DealPermission>()
  const [currentStatus, setCurrentStatus] = useState<AppDealStatusChoices>()
  const [helpModal, setHelpModal] = useState<boolean>(false)
  const [deal, setDeal] = useState<Deal>()
  const [marketContractAddress, setMarketContractAddress] = useState<string>()
  const { adId, dealId } = useParams<{ adId: string; dealId: string }>()
  const router = useHistory()
  const dispatch: AppDispatch = useDispatch()

  //const [, getAd] = useGetAd()
  const [, rejectDealWithoutDeposit] = useRejectDealWithoutDeposit()
  const currentWorkspace = useCurrentWorkspace()
  const [, getDeal] = useGetDeal()

  const [access, setAccess] = useState<boolean>()

  useEffect(() => {
    //if (currentStatus && currentStatus !== deal.status) {
      getDealData()
    //}
  }, [/*currentStatus, */currentWorkspace?.id])

  const getDealData = () => {
    dispatch(setCommonLoader(true))
    getDeal({ dealId: dealId })
      .then(res => {
        dispatch(setCommonLoader(false))
        const response = res.data.getDeal
        const runtimeError = response.runtimeError
        if (runtimeError) {
          console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
          return false
        }
        const perm = response?.deal?.ad?.permission
        const seller = (response?.deal?.seller?.id == currentWorkspace?.id || responsibleWorkspaceId(currentWorkspace) == response?.deal?.seller?.id)
        console.log('seller', seller)
        const creator = response?.deal?.seller?.id == currentWorkspace?.id
        const finalBuyer = response?.deal?.buyer?.id == currentWorkspace?.id
        const dealPerm = {
          read: creator || finalBuyer || permView(perm) || permSign(perm) || permEdit(perm),
          sign: creator || finalBuyer || permSign(perm),
          edit: creator || finalBuyer || permEdit(perm) || permSign(perm),
          creator: creator,
          buyer: !seller,
          readOnly: creator || finalBuyer ? false : !perm || permView(perm) 
        }

        console.log('dealPerm',dealPerm)

        setDealPermissions(dealPerm)
        setIsSeller(seller)
        setDeal(response.deal);
        setCurrentStatus(response.deal.status)
      })
      .catch(error => console.error(error))
      .finally(() => dispatch(setCommonLoader(false)))
  }

  const checkTermsAndConditions = (deal: Deal, status: AppDealStatusChoices): AppDealStatusFE => {
    if (deal?.isOnTermsAndConditions) {
      if (deal?.termsAndCond?.isOnDocument) {
        return AppDealStatusExtra.TCR
      } else {
        if (deal?.termsAndCond?.turn == 'SELLER') {
          return AppDealStatusChoices.TCWS
        } else {
          return AppDealStatusChoices.TCWB
        }
      }
    }
    return status
  }


  const renderBody = (): ReactNode => {
    if (!deal?.id) {
      return <LoaderView ring />
    }
    console.log('deal', deal)
    //проверяем, кому можно открыть сделку
    const currentStatusChecked = checkTermsAndConditions(deal, currentStatus)

    if (permNone(deal?.ad?.permission)) {
      return <DealNoPermission />
    }

    if (hasDealAccess(deal, isSeller)) {
      switch (currentStatusChecked) {
        case AppDealStatusChoices.BWFP:
        case AppDealStatusChoices.BWAWC:
        case AppDealStatusChoices.BWANC:
        //case AppDealStatusChoices.BWIT:
        case AppDealStatusChoices.BWR:
          return <Jdun onReload={getDealData} />

        case AppDealStatusChoices.RWB: 
          return (
            <Prepayment 
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )
        case AppDealStatusChoices.TCA:
        case AppDealStatusChoices.TCWB:
        case AppDealStatusChoices.TCWS:
          return (
            <Terms
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
              approvedMode={deal.status === AppDealStatusChoices.TCA}
            />
          )

        case AppDealStatusChoices.AWS:
        case AppDealStatusChoices.AWB:
          return (
            <Agreement
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )


        case AppDealStatusChoices.PDWS:
        case AppDealStatusChoices.PDWB:
          return (
            <PrePurchaseInspection
              deal={deal}
              permissions={dealPermissions}
              isSeller={isSeller}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )

        case AppDealStatusChoices.PDCB:
        case AppDealStatusChoices.PCB:
          return (
            <InspectionConfirm
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )

        case AppDealStatusChoices.PUWB:
          return (
            <InspectionReport
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )

        case AppDealStatusChoices.RWSB:
          return (
            <RejectionLetterSign
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )

        case AppDealStatusChoices.TSNCWB:
        case AppDealStatusChoices.TSWCWB:
          return (
            <TechnicalAcceptanceSign
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )

        case AppDealStatusChoices.FARS:
        case AppDealStatusChoices.FANCS:
        case AppDealStatusChoices.FAWCS:
          return (
            <TechnicalAcceptanceClose
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )

        case AppDealStatusChoices.RDB:
          return (
            <Dispute
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )
        case AppDealStatusChoices.RDS:
          return (
            <Dispute
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )
        case AppDealStatusChoices.FPWB:
          return (
            <Payment
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onReload={getDealData}
            //onHelpModal={setHelpModal}
            />
          )

        case AppDealStatusChoices.PCWP:
          return (
            <PreClosing
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )

        /*case AppDealStatusChoices.CDWP:
          return (
            <ClosingDocuments
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )
        case AppDealStatusChoices.CWWP:
          return (
            <WarrantyAssignment
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )*/

        /*case AppDealStatusChoices.CCWB:
          return (
            <DealClose
              deal={deal}
              isSeller={isSeller}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )*/
        case AppDealStatusChoices.CDWB:
        case AppDealStatusChoices.CDWS:
          return (
            <Closing
              deal={deal}
              isSeller={isSeller}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )

        case AppDealStatusChoices.DRWS:
          return (
            <DiscrepanciesRemoval
              deal={deal}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )

        case AppDealStatusChoices.DRAB:
          return (
            <DiscrepanciesRemovalAccept
              deal={deal}
              permissions={dealPermissions}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )

        case AppDealStatusExtra.TCR:
          return (
            <Amendment
              deal={deal}
              permissions={dealPermissions}
              isSeller={isSeller}
              onHelpModal={setHelpModal}
              onReload={getDealData}
            />
          )
      }
    }

    //сообщение для стороны, которой нельзя сейчас в сделку
    return <Jdun onReload={getDealData} />
  }

  return (
    <Layout>
      <div className="deal-process">
        <div className="deal-process__container">
          <div className="deal-process__inner">
            <div className="deal-process__back" onClick={() => router.goBack()}>
              <Icon name="back" />
              <span className='deal-process__backText'>Return to Deals</span>
            </div>
            <div className={"deal-process__steps step-" + currentStatus}>
              {deal?.steps && deal?.id &&
                <DealSteps full deal={deal} />
              }
            </div>
            <div className={`deal-process__body deal-state-${deal?.status ? deal.status : 'und'}`}>{renderBody()}</div>
          </div>
        </div>
      </div>
      <ModalHelp modalIsOpen={helpModal} closeModal={() => setHelpModal(false)} />
    </Layout>
  )
}

export default DealProcess
