import React, {
  useEffect,
  useState,
  useRef
} from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Button from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import {
  useAddFile,
  useUploadFiles,
  Deal,
  AppDealStatusChoices
} from 'src/generated/graphql'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { useClient } from 'urql'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import { FileWithPath } from 'file-selector'
import {
  Form,
  Formik,
  FormikProps
} from 'formik'
import Dropzone from 'react-dropzone'
import ErrorMsg from 'src/components/ErrorMsg/ErrorMsg'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import {
  Options,
  FileType
} from 'src/types'
import {
  fileToBase64,
  fileAccept
} from 'src/helper'
import { useChatButton } from 'src/hooks'
import { DealPermission } from 'src/types'
import './InspectionReport.scss'


interface IInspectionReport {
  deal: Deal
  isSeller: boolean
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
}

type ReportType = 'withoutComments' | 'isWithDiscrepancies' | 'isNonAirworty'

interface Values {
  report: ReportType
  files: FileWithPath[]
  message?: string
}

type AcceptOptions = {
  isWithDiscrepancies?: boolean
  isNonAirworty?: boolean
}


const InspectionReport: React.FC<IInspectionReport> = React.memo(props => {
  const { deal, isSeller, onHelpModal, onReload, permissions } = props
  const dealId = deal.id
  const currentStatus = deal.status
  const inspectionComments = deal?.discrepanciesRemoval?.inspectionComments
  const [repairOptions, setRepairOptions] = useState(deal?.ppiDetails?.scope)
  const router = useHistory()
  const client = useClient();
  const dispatch = useDispatch()

  const initialValues: Values = { report: 'withoutComments', files: null, message: '' }
  const [files, setFiles] = useState<File[]>([])
  const [newOption, setNewOption] = useState<string>('')
  const [reportState, setReportState] = useState<ReportType>('withoutComments')
  const [isLoading, setLoading] = useState<boolean>(false)
  const [isFilesUploaded, setIsFilesUploaded] = useState<boolean>(false)
  const [reportMessage, setReportMessage] = useState<string>('')
  const formRef = useRef<FormikProps<any>>(null);
  const [error, setError] = useState<string>('')
  const [, addFile] = useAddFile()
  const [, uploadFiles] = useUploadFiles()
  const [commentOptions, setCommentOptions] = useState<Options>([
    { label: 'Accept without comments', value: 'withoutComments' },
    { label: 'Accept with discrepancies', value: 'isWithDiscrepancies' },
    { label: 'Reject as non-airworthy', value: 'isNonAirworty' },
  ])
  const openChat = useChatButton()

  const handleChat = () => {
    openChat(deal.buyer.user.id, deal.seller.user.id, deal.ad)
  }

  const handleSubmit = (values: Values) => {

    handleAccept(files, values.report, values.message)
    /*setReportState(values.report)
    setReportMessage(values.message)*/
  }

  const handleKeys = (event) => {
    if (event.keyCode == 13) {
      event.preventDefault()
      setRepairOptions([...repairOptions, newOption])
      setNewOption('')
    }
  }

  const triggerFormSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit()
    }
  }

  const handleFormChange = (value: any, name: string) => {
    if (name == 'report') {
      setReportState(value)
    }
    if (name == 'message') {
      setReportMessage(value)
    }
  }

  const handleAccept = async (files: File[], state: ReportType, message?: string) => {

    const options: AcceptOptions = {}
    let newFiles: FileType[] = []

    if (state === 'isWithDiscrepancies') {
      options.isWithDiscrepancies = true
    }

    if (state === 'isNonAirworty') {
      options.isNonAirworty = true
    }

    await Promise.all(
      files.map(async file => {
        await fileToBase64(file).then(el => {
          newFiles.push({ file: el as string, filename: file.name })
        })
      }),
    )

    const fileIds = await uploadFiles({ files: newFiles })
    const discrepancies = repairOptions
    if (newOption !== '') discrepancies.push(newOption)
    addFile({ dealId, inputFiles: fileIds.data.uploadFiles.files.map(el => el.id), inspectionComments: message, ...options, scope: discrepancies })
      .then(res => {
        const response = res.data.addFile
        const runtimeError = response.runtimeError
        if (runtimeError) {
          setError(runtimeError.message)
          console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
          return false
        }
        onReload()
        //router.go(0)
      })
      .catch(error => console.error(error))
  }

  const renderOptions = () => {

    const handleChange = (event) => {
      setNewOption(event.target.value)
      console.log('handled')
    }

    return (
      <div>
        <div><h3>Scope of discrepancies removal</h3></div>
        <div>
          {repairOptions && repairOptions?.map(
            (option, i) => {
              return (

                <div className='deal__content__repairOption' key={i}>
                  <p className=''>{option}</p>
                  <button
                    type="button"
                    className="deal__content__repairDeleteButton"
                    onClick={() => setRepairOptions(repairOptions.filter(el => el !== option))}
                  >
                    <Icon name="i-trash" />
                  </button>
                </div>
              )
            }
          )}
        </div>
        <div className='deal__content__repairOption'>
          <input onKeyDown={handleKeys} value={newOption} onChange={handleChange} className='deal__content__repairInput' placeholder='Add a specific discrepancy to be removed' />
        </div>
        <div className='deal__content__addButton'>

          <button
            type="button"
            className="deal__content__repairDeleteButton"
            disabled={!newOption}
            onClick={(event) => {
              event.preventDefault()
              setRepairOptions([...repairOptions, newOption])
              setNewOption('')
            }}
          >
            + Add item
          </button>
        </div>
        <div>
        </div>
      </div>)
  }




  return (
    <DealProcessLayout title="Pre-purchase Inspection Report"
      noAccess={permissions.readOnly}
      links={[
        { title: "Help", onClick: () => onHelpModal(true) }
      ]}
      leftButtons={[
        { title: "Return to Deals", onClick: () => { router.push('/deals'); dispatch(setCommonLoader(true)) } },
        { title: "Chat", onClick: handleChat }
      ]}
      rightButtons={[
        { title: "Next", onClick: triggerFormSubmit, disabled: !isFilesUploaded },
      ]}
    >
      <Formik innerRef={formRef} initialValues={initialValues} onSubmit={handleSubmit} >
        {({ handleSubmit, handleChange, values }) => (
          <Form className="deal__content__with-sidebar sidebar-left">
            <div className="deal__content__sidebar">
              <div className="deal__content__sidebar-title">Upload the Inspection report</div>

              <Dropzone
                noClick={true}
                noKeyboard={true}
                disabled={permissions.readOnly}
                multiple={true}
                onDrop={acceptedFiles => {
                  setFiles(prevState => [...prevState, ...acceptedFiles])
                  setIsFilesUploaded(!!acceptedFiles.length)
                }}
                accept={fileAccept(true, true)}
              >
                {({ getRootProps, getInputProps, open }) => {
                  const removeFile = index => {
                    const newFiles = [...files]
                    newFiles.splice(index, 1)
                    setFiles(newFiles)
                    setIsFilesUploaded(!!newFiles.length)
                  }
                  return (
                    <div
                      {...getRootProps({
                        className: 'dropzone',
                      })}
                    >
                      <input {...getInputProps()} />
                      {files.length ? (
                        <div className="dropzone__items">
                          {files.map((file: FileWithPath, index) => (
                            <div className="dropzone__item" key={file.path}>
                              <div className="dropzone__name">{file.path}</div>
                              <div className="dropzone__actions">
                                <button className="dropzone__reload">
                                  <Icon name="i-reload" />
                                </button>
                                <button className="dropzone__delete" onClick={() => removeFile(index)}>
                                  <Icon name="i-trash" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {isFilesUploaded ? (
                        <button className="dropzone__link" type="button" onClick={open}>
                          Load more files
                        </button>
                      ) : (
                        <button className="btn" type="button" onClick={open}>
                          Load document
                        </button>
                      )}
                    </div>
                  )
                }}
              </Dropzone>
              {
                isFilesUploaded &&
                <FormikSelect name="report" options={commentOptions} className="select" changeHandler={(v) => handleFormChange(v, 'report')} />
              }
            </div>
            <div className="deal__content__main">
              {
                reportState === 'isNonAirworty' &&
                <FormikField
                  name="message"
                  disabled={permissions.readOnly}
                  isTextarea={true}
                  placeholder="Please write a comment if necessary"
                  changeHandler={(v) => handleFormChange(v, 'message')}
                />

              }
              {
                reportState === 'isWithDiscrepancies' &&
                <div>
                  <div>
                    {renderOptions()}
                  </div>
                  <div className="deal__content-comment">
                    <div className="deal__content-comment__title">Your comment</div>
                    <FormikField
                      name="message"
                      disabled={permissions.readOnly}
                      isTextarea={true}
                      placeholder="Please write a comment if necessary"
                      changeHandler={(v) => handleFormChange(v, 'message')}
                    />
                  </div>
                </div>

              }
            </div>
          </Form>
        )}
      </Formik>
    </DealProcessLayout>
  )
})

export default InspectionReport
