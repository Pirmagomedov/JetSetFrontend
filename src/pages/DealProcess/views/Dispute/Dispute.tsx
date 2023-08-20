import React, { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import ReactSelect, { OptionTypeBase, components, IndicatorProps, OptionsType } from 'react-select'
import Button from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import { 
  InspectionReportType, 
  Deal, 
  UploadedFileType, 
  useBlockchainStatusRoute, 
  useRejectionDispute,
  AppUploadedDealFileDocTypeChoices,
  PrePurchaseAction,
  AppDealStatusChoices
} from 'src/generated/graphql'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import './Dispute.scss'
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



const Dispute: React.FC<ITechnicalAcceptanceClose> = React.memo(props => {
  const { deal, isSeller, onHelpModal, onReload, permissions } = props
  const actionOptions = [{ label: 'Accept without comments', value: PrePurchaseAction.NO_COMMENTS}, { label: 'Accept with comments', value: PrePurchaseAction.WITH_COMMENTS }, { label: 'Aircraft is non airworthy', value: PrePurchaseAction.REJECTION }]
  const [action, setAction] = useState<PrePurchaseAction>()
  const dealId = deal.id
  const currentStatus = deal.status
  const inspectionReports = deal.inspectionReports
  const [, rejectionDispute] = useRejectionDispute()
  const technicalAcceptanceLetter = deal.documents.filter((el) => el.docType === AppUploadedDealFileDocTypeChoices.TA)
  const rejectionLetter = deal?.documents?.filter((el) => el.docType === AppUploadedDealFileDocTypeChoices.RL)
  const router = useHistory()
  const [sellerComment, setSellerComment] = useState('')
  const dispatch = useDispatch()
  const [newOption, setNewOption] = useState<string>('')
  const [buyerNewComment, setBuyerNewComment] = useState('')

  const buyerComment = deal?.rejectionDispute?.buyerComment
  const sellerCommentSaved = deal?.rejectionDispute?.sellerComment
  const [repairOptions, setRepairOptions] = useState(deal?.ppiDetails?.scope || [])

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
      <div className='deal__content__repairBlock'><div><h3>Scope of discrepancies removal</h3></div>

        <div>
          {repairOptions[0] && repairOptions?.map((option) => {
            return <div className='deal__content__repairOption'>
              <text className=''>{option}</text>
              {!isSeller && <button
                disabled={permissions.readOnly}
                type="button"
                className="deal__content__repairDeleteButton"
                onClick={() => setRepairOptions(repairOptions.filter(el => el !== option))}
              >
                <Icon name="i-trash" />
              </button>}
            </div>
          })}
        </div>
        {!isSeller &&
          <div className='deal__content__repairOption'>
            <input value={newOption} onChange={(el) => setNewOption(el.target.value)} className='deal__content__repairInput' placeholder='Add a specific discrepancy to be removed' />
          </div>}
        {!isSeller &&
          <div className='deal__content__addButton'>

            <button
              type="button"
              className="deal__content__repairDeleteButton"
              disabled={!newOption || permissions.readOnly}
              onClick={(e) => {
                e.preventDefault()
                setRepairOptions([...repairOptions, newOption])
                setNewOption('')
              }}
            >
              + Add item
            </button>
          </div>}
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
          dispatch(setCommonLoader(true))
          onReload()
          //router.go(0)
        }

      }
    })
  }

  const renderBody = () => isSeller ?
    (<div className="deal__content__with-sidebar sidebar-right"> 

      <div className="deal__content__main">

        <div className="deal__content__main">
        </div>
        <div className="deal__content-comment">
        <div>{renderOptions()}</div>

          <div className="deal__content-comment__title">Purchaser's comment</div>
          <div className="deal__content-comment__comment">{buyerComment}</div>
        </div>
        <div className="deal__content-comment">
          <div className="deal__content-comment__title">Your Comment</div>
          <label className='field'>
            <textarea
              value={sellerComment}
              placeholder={''}
              onChange={(e) => setSellerComment(e.target.value)}
              disabled={permissions.readOnly}
            />
          </label>
        </div>

      </div>
      <div className="deal__content__sidebar">
        {
          (technicalAcceptanceLetter.length > 0 && rejectionLetter.length < 1) ?
            <>
              <div className="sidebar__title">Technical Acceptance Letter (signed)</div>
              <div className="sidebar__subTitle">The buyer suggested corrections and attached an inspection report. Check the attachments and buyer's comment carefully.</div>

              <div className="sidebar__items">
                {technicalAcceptanceLetter.map((el, i) => <FileLink key={el.filename + i} filename={el.filename} file={el}  />)}
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

    </div>) :

    (<div className="deal__content__with-sidebar sidebar-left">
      <div className="deal__content__sidebar">
      {
          (inspectionReports.length > 0) &&
          <>
            <div className="sidebar__title">Technical Acceptance Letter</div>
            <div className="sidebar__subTitle">The seller suggested corrections and attached an inspection report. Check the attachments and seller's comment carefully.</div>

            <div className="sidebar__items">
            {technicalAcceptanceLetter.map((el, i) => <FileLink key={el.filename + i} filename={el.filename} file={el} onView={handleViewFile} />)}
            </div>
          </>
        }
        {
          (inspectionReports.length > 0) &&
          <>
            <div className="sidebar__title">Inspection report</div>
            <div className="sidebar__items">
              {inspectionReports.map((el, i) => <FileLink key={el.file.filename + i} file={el.file} filename={el.file.filename} onView={handleViewFile} />)}
            </div>
          </>
        }
        {rejectionLetter.length > 0 && <>
          <div className="sidebar__items" >
            <ReactSelect
              options={actionOptions}
              onChange={(v) => setAction(v.value)}
              placeholder={'Non airworthy'}
              isSearchable={true}
              classNamePrefix='select select-white'
              isLoading={isLoading}
              disabled={permissions.readOnly}
            />
          </div>
        </>
        }

      </div>
      <div className="deal__content__main">
      <div>{renderOptions()}</div>
        <div className="deal__content-comment__title">Seller's comment</div>
        <div className="deal__content-comment__comment">{sellerCommentSaved}</div>
        <div className="deal__content-comment__title">Your Comment</div>
        <label className='field'>
          <textarea
            className="deal__content-comment__comment"
            placeholder={'Write your objections to the Rejection...'}
            onChange={(e) => setBuyerNewComment(e.target.value)}
            disabled={permissions.readOnly}
          />
        </label>
      </div>

    </div>)

  const sellerButtons = [
    { 
      title: "Send", 
      onClick: () => rejectionDispute(
        { 
          dealId, 
          comment: sellerComment, 
          action: PrePurchaseAction.RECOMMIT, 
          scope: repairOptions
        }
      ).then((res) => router.push('/deals')), 
      disabled: !sellerComment || permissions.readOnly
    }
  ]
  const buyerButtons = !repairOptions[0] 
    ?
      [
        { 
          title: action === PrePurchaseAction.REJECTION ? "Answer" : "Confirm", 
          onClick: () => rejectionDispute(
            { 
              dealId, 
              comment: buyerNewComment, 
              action: action === PrePurchaseAction.REJECTION ? PrePurchaseAction.REJECTION : action
            }
          ).then((res) => router.push('/deals')), 
          disabled: permissions.readOnly || (action === PrePurchaseAction.REJECTION ? !buyerNewComment : action ? false : true)
        }
      ]
    : 
      [
        { 
          title: "Answer" , 
          onClick: () => rejectionDispute(
            { 
              dealId, 
              comment: buyerNewComment, 
              action: PrePurchaseAction.RECOMMIT, 
              scope: repairOptions
            }
          ).then((res) => router.push('/deals')), 
          disabled: !buyerNewComment || permissions.readOnly
        },
        { 
          title: "Confirm" , 
          onClick: () => rejectionDispute(
            { 
              dealId, 
              comment: buyerNewComment, 
              action: PrePurchaseAction.WITH_COMMENTS, 
              scope: repairOptions
            }
          ).then((res) => router.push('/deals')), 
          disabled: permissions.readOnly  
        }
      ]



  return (
    <DealProcessLayout title={rejectionLetter.length < 1 ? "Technical Acceptance Letter Dispute" : 'Rejection Letter Dispute'}
      noAccess={permissions.readOnly}
      links={[
        { title: "Help", onClick: () => onHelpModal(true) }
      ]}
      leftButtons={[
        {title: "Return to Deals", onClick: () => {router.push('/deals'); dispatch(setCommonLoader(true))}},
        {title: "Chat", onClick: handleChat}
      ]}
      rightButtons={isSeller ? sellerButtons : buyerButtons}
    >
      {renderBody()}
    </DealProcessLayout>
  )
})

export default Dispute
