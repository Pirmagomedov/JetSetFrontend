import { Form, Formik } from 'formik'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Sticky from 'react-sticky-el'
import Button from 'src/components/Button/Button'
import Upload from 'src/components/Upload/Upload'
import { Ad, useEditDraft, useUploadFiles } from 'src/generated/graphql'
import {
  getImageLink,
  ImageStyles
} from 'src/helper'
import { FileType } from 'src/types'
import * as Yup from 'yup'

interface ICreateAdCharacteristics {
  id: string
  step: number
  onStep: (step: number) => void
  currentAd: Ad
}

interface IValues {
  documentFiles: FileType[]
}

const DocumentsSchema = Yup.object().shape({
  documentFiles: Yup.array()
    .of(
      Yup.object().shape({
        file: Yup.string(),
        filename: Yup.string(),
      }),
    )
    .test({
      message: 'Required',
      test: arr => arr.length > 0,
    }),
})

const CreateAdDocuments: React.FC<ICreateAdCharacteristics> = React.memo(props => {
  const { id, step, onStep, currentAd } = props
  const [initialValues, setInitialValues] = useState<IValues>({ documentFiles: [] })
  const [isNext, setNext] = useState<boolean>()
  const [isSubmitting, setSubmitting] = useState<boolean>()

  const [, updateDraft] = useEditDraft()
  const [, uploadFiles] = useUploadFiles()
  const history = useHistory()
  const formikRef = useRef(null)

  useEffect(() => {
    if (currentAd?.aircraftDocuments) {
      const { proofsOfOwnership } = currentAd?.aircraftDocuments
      const formattedDocs = proofsOfOwnership.map(el => ({ ...el, id: el.id }))

      setInitialValues({
        documentFiles: formattedDocs,
      })
    }
  }, [currentAd])

  const makeNext = (isNext: boolean) => {
    formikRef.current.handleSubmit()
    setNext(isNext)
  }

  const handleSubmit = async (values: IValues) => {
    setSubmitting(true)

    const images: FileType[] = await Promise.all(
      values?.documentFiles?.map(async el => {
        if (el.id) {
          return el
        } else {
          if (el.file) {
            const result = await uploadFiles({ files: [{ ...el, isPublic: false }] })
            const image = result?.data?.uploadFiles?.files[0]
            return {
              id: image?.id,
              file: getImageLink(image, ImageStyles.AD_VIEW),
              filename: image?.filename,
            }
          }
        }
      }),
    )

    const aircraftDocuments = {
      proofsOfOwnership: images.map(el => el.id),
    }

    updateDraft({ draftId: id, currentStep: step, aircraftDocuments })
      .then(res => {
        const response = res?.data?.editDraft
        const fieldErrors = response?.fieldErrors
        const runtimeError = response?.runtimeError
        if (runtimeError) {
          setSubmitting(false)
          return false
        }
        if (fieldErrors) {
          setSubmitting(false)
          setNext(null)
          return false
        }
        if (isNext) {
          onStep(step + 1)
          history.push(`/create-ad/${id}`)
        } else {
          history.push('/inventory')
        }
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  })

  return (
    <div className="create-ad__content">
      <div className="create-ad__wrapper">
        <div className="create-ad__head label-required">Load the proof of ownership document</div>
        <div className="create-ad__text">
          Please upload documents confirming ownership rights.
        </div>
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          enableReinitialize={true}
          validationSchema={DocumentsSchema}
        >
          <Form>
            <div className="create-ad__files">
              <Upload name="documentFiles" text="Load files" />
            </div>
          </Form>
        </Formik>
      </div>

      <div className="create-ad__footer">
        <Sticky className="create-ad__sticky" mode="bottom">
          <div className="create-ad__holderWide">
            <div className="create-ad__footer__left">
              <Button
                className="create-ad__btn create-ad__btn--back"
                type="secondary"
                onClick={() => onStep(step - 1)}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Back
              </Button>
              <Button
                className="create-ad__btn create-ad__btn--save"
                type="secondary"
                onClick={() => makeNext(false)}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Save draft and Exit
              </Button>
            </div>
            <div className="create-ad__footer__right">
              <Button
                className="create-ad__btn create-ad__btn--next"
                onClick={() => makeNext(true)}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Next
              </Button>
            </div>
          </div>
        </Sticky>
      </div>

    </div>
  )
})

export default CreateAdDocuments
