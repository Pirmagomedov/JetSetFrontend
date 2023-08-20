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
  useDiscrepanciesRemoval, 
  AppDealStatusChoices 
} from 'src/generated/graphql'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { useClient } from 'urql'
import './DiscrepanciesRemoval.scss'
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
  FileType,
  DealPermission
} from 'src/types'
import { 
  fileToBase64,
  fileAccept
} from 'src/helper'
import Ol from 'src/components/Ol/Ol'
import { useChatButton } from 'src/hooks'


interface IDiscrepanciesRemoval {
  deal: Deal
  onHelpModal: (bool: boolean) => void
  onReload: () => void
  permissions: DealPermission
}


interface Values {
  files: FileWithPath[]
  message?: string
}

const DiscrepanciesRemoval: React.FC<IDiscrepanciesRemoval> = React.memo(props => {
  const { deal, onHelpModal, onReload, permissions } = props
  const dealId = deal.id
  const currentStatus = deal.status

  const router = useHistory()
  const client = useClient();
  const dispatch = useDispatch()

  const initialValues: Values = { files: null, message: '' }
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setLoading] = useState<boolean>(false)
  const [isFilesUploaded, setIsFilesUploaded] = useState<boolean>(false)
  const [reportMessage, setReportMessage] = useState<string>('')
  const formRef = useRef<FormikProps<any>>(null);
  const [error, setError] = useState<string>('')
  const [, addFile] = useAddFile()
  const [, uploadFiles] = useUploadFiles()
  const [, discrepanciesRemoval] = useDiscrepanciesRemoval()
  const openChat = useChatButton()

  const handleChat = () => {
    openChat(deal.buyer.user.id, deal.seller.user.id, deal.ad)
  }

  const handleSubmit = (values: Values) => {
    handleAccept(files, values.message)
  }

  const triggerFormSubmit = () => {
    dispatch(setCommonLoader(true))
    if (formRef.current) {
      formRef.current.handleSubmit()
    }
  }

  const handleAccept = async (files: File[], message?: string ) => {
    let newFiles: FileType[] = []

    await Promise.all(
      files.map(async file => {
        await fileToBase64(file).then(el => {
          newFiles.push({ file: el as string, filename: file.name })
        })
      }),
    )

    const fileIds = await uploadFiles({ files: newFiles })

    if (fileIds?.data?.uploadFiles?.files) {
      const uploadedFiles = fileIds?.data?.uploadFiles?.files.map(f => f.id)
      if (uploadFiles.length > 0) {
        discrepanciesRemoval({dealId: dealId, discrepanciesRemovalIds: uploadedFiles, discrepanciesComments: reportMessage}).then(res => {
          if (res?.data?.discrepanciesRemoval?.success) {
            dispatch(setCommonLoader(true))
            router.push('/deals')
          } else {
            dispatch(setCommonLoader(false))
          }
        })
      } else {
        dispatch(setCommonLoader(false))
      }
    } else {
      dispatch(setCommonLoader(false))
    }
  }
  



  return (
    <DealProcessLayout title="Discrepancies removal" 
      noAccess={permissions.readOnly}
      links={[
        {title: "Help", onClick: () => onHelpModal(true)}
      ]}
      leftButtons={[
        {title: "Return to Deals", onClick: () => {router.push('/deals'); dispatch(setCommonLoader(true))}},
        {title: "Chat", onClick: handleChat}
      ]}
      rightButtons={[
        {title: "Submit", onClick: triggerFormSubmit, disabled: !isFilesUploaded},
      ]}
    >
      <Formik innerRef={formRef} initialValues={initialValues} onSubmit={handleSubmit} >
        {({ handleSubmit, handleChange, values }) => (
          <Form className="deal__content__with-sidebar sidebar-left">
            <div className="deal__content__sidebar">  
              <Ol list={[
                  {index: "01", text: "Arrange for the removal of discrepancies"},
                  {index: "02", text: "Upload the Release To Service"},
                
                ]} />

              <Dropzone
                noClick={true}
                noKeyboard={true}
                multiple={false}
                disabled={permissions.readOnly}
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
              </div>
            <div className="deal__content__main">
              <FormikField
                name="message"
                disabled={permissions.readOnly}
                isTextarea={true}
                placeholder="Write comments on the results of the removal of discrepancies (if any)..."
                changeHandler={(e) => setReportMessage(e.target.value)}
              />
            </div>
          </Form>
        )}
      </Formik>
    </DealProcessLayout>
  )
})

export default DiscrepanciesRemoval
