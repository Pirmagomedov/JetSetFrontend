import React, { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Button from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import {
  AppDealStatusChoices,
  InspectionReportType,
  Deal,
  UploadedFileType,
  useBlockchainStatusRoute,
  AppUploadedDealFileDocTypeChoices,
  useRejectionDispute
} from 'src/generated/graphql'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import './TechnicalAcceptanceClose.scss'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import { Form, Formik, FormikProps } from 'formik'
import ErrorMsg from 'src/components/ErrorMsg/ErrorMsg'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import { Options, FileType } from 'src/types'
import { jetoWall_it } from 'src/helper'
import { setNotification } from 'src/reducers/notificationReducer'
import FileLink from 'src/components/FileLink/FileLink'
import { useChatButton } from 'src/hooks'
import { DealPermission } from 'src/types'


interface ITechnicalAcceptanceClose {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
}



const TechnicalAcceptanceClose: React.FC<ITechnicalAcceptanceClose> = React.memo(props => {
  const { deal, isSeller, onHelpModal, onReload, permissions } = props

  const dealId = deal.id
  const currentStatus = deal.status
  const inspectionReports = deal.inspectionReports
  const technicalAcceptanceLetter = deal.documents.filter((el) => el.docType === AppUploadedDealFileDocTypeChoices.TA)
  const rejectionLetter = deal?.documents?.filter((el) => el.docType === AppUploadedDealFileDocTypeChoices.RL)
  const [repairOptions, setRepairOptions] = useState(deal?.ppiDetails?.scope)
  const router = useHistory()
  const dispatch = useDispatch()
  const rejectionComments = deal?.rejectionDispute?.buyerComment
  const comments = deal?.discrepanciesRemoval?.inspectionComments
  const [, rejectionDispute] = useRejectionDispute()
  const [viewFileModal, setViewFileModal] = useState<boolean>(false)
  const [viewFile, setViewFile] = useState<UploadedFileType>()
  const [isLoading, setLoading] = useState<boolean>(false)
  const [, blockchainStatusRoute] = useBlockchainStatusRoute()
  const openChat = useChatButton()

  const handleChat = () => {
    openChat(deal.buyer.user.id, deal.seller.user.id, deal.ad)
  }


  const handleViewFile = (file: UploadedFileType) => {
    setViewFile(file)
    setViewFileModal(true)
  }

  const renderOptions = () => {

    return (
      <div>
        <div><h3>Scope of discrepancies removal</h3></div>
        <div>
          {repairOptions && repairOptions?.map((option, i) => {
            return <div className='deal__content__repairOption' key={i} >
              <p className=''>{option}</p>
            </div>
          })}
        </div>
        <div>

        </div>
      </div>)
  }

  const handleSubmit = () => {
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
        if (currentStatus == AppDealStatusChoices.FANCS) {
          dispatch(setCommonLoader(true))
          router.push('/deals')

        } else {
          onReload()
          //router.go(0)
        }

      }
    })
  }
  const handleRejection = () => {
    setLoading(true)
    rejectionDispute({ dealId, comment: null, action: null, scope: ['1', '2', '3'] }).then(res => {
      const response = res.data.rejectionDispute
      const errors = response.runtimeError
      if (errors) {
        console.error(errors.message)
        setLoading(false)
        return false
      }
      if (response.success) {
        onReload()
        //router.go(0)
      }
    })

  }

  const renderBody = () =>
    <div className="deal__content__with-sidebar sidebar-right">

      <div className="deal__content__sidebar">
        {
          (technicalAcceptanceLetter.length > 0 && currentStatus !== AppDealStatusChoices.FARS) ?
            <>
              <div className="sidebar__title">Technical Acceptance Letter (signed)</div>
              <div className="sidebar__items">
                {technicalAcceptanceLetter.map((el, i) => <FileLink key={el.filename + i} filename={el.filename} file={el} />)}
              </div>
            </> : rejectionLetter.length > 0 && <>
              <div className="sidebar__title">Rejection Letter</div>
              <div className="sidebar__items">
                {rejectionLetter.map((el, i) => <FileLink key={el.filename + i} filename={el.filename} file={el} />)}
              </div>
            </>
        }
        {
          (inspectionReports.length > 0) &&
          <>
            <div className="sidebar__title">Inspection report</div>
            <div className="sidebar__items">
              {inspectionReports.map((el, i) => <FileLink key={el.file.filename + i} file={el.file} filename={el.file.filename} />)}
            </div>
          </>
        }
      </div>
      
      <div className="deal__content__main">
        {
          currentStatus == AppDealStatusChoices.FANCS &&
          <div className="state-message state-message-good">
            <div className="state-message__icon"><Icon name="accepted" /></div>
            <div className="state-message__text">The Purchaser has uploaded the Inspection report and signed the Technical Acceptance Letter. No Discrepancies found.</div>
          </div>
        }

        {
          currentStatus == AppDealStatusChoices.FAWCS &&
          <>
            <div className="state-message state-message-bad">
              <div className="state-message__icon"><Icon className="icon-no-color" name="i-warning" /></div>
              <div className="state-message__text">The Purchaser has uploaded the Inspection report and signed the Technical Acceptance Letter with comments. <br /><br />
                Discrepancy found</div>
            </div>
            {renderOptions()}
            <div>

            </div>
            {
              !!comments &&
              <div className="deal__content-comment">
                <div className="deal__content-comment__title">Purchaser's comment</div>
                <div className="deal__content-comment__comment"><p>{comments}</p></div>
              </div>
            }

          </>
        }

        {
          currentStatus == AppDealStatusChoices.FARS &&
          <>
            <div className="state-message state-message-bad">
              <div className="state-message__icon"><Icon className="icon-no-color" name="i-warning" /></div>
              <div className="state-message__text">The Purchaser has uploaded the Inspection report and signed the Technical Acceptance Letter with comments. <br /><br />
                The aircraft is non-airworthy. The deal will be terminated.</div>
            </div>
            {
              !!rejectionComments &&
              <div className="deal__content-comment">
                <div className="deal__content-comment__title">Purchaser's comment</div>
                <div className="deal__content-comment__comment">{rejectionComments}</div>
              </div>
            }

          </>
        }
      </div>



    </div>



  return (
    <DealProcessLayout title="Technical Acceptance Letter"
      noAccess={permissions.readOnly}
      links={[
        { title: "Help", onClick: () => onHelpModal(true) }
      ]}
      leftButtons={[
        { title: "Return to Deals", onClick: () => { router.push('/deals'); dispatch(setCommonLoader(true)) } },
        { title: "Chat", onClick: handleChat },
        { title: "Dispute", onClick: handleRejection, disabled: permissions.readOnly, display: currentStatus !== AppDealStatusChoices.FANCS },
      ]}
      rightButtons={[
        // { title: "Dispute", onClick: handleRejection},
        { title: "Accept", onClick: handleSubmit, disabled: permissions.readOnly },
      ]}
    >
      {renderBody()}
    </DealProcessLayout>
  )
})

export default TechnicalAcceptanceClose
