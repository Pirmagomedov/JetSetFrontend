import { Form, Formik } from 'formik'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { RootState } from 'src/store'
import Sticky from 'react-sticky-el'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import Button from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import FormikField from 'src/components/FormikField/FormikField'
import FormikImageCrop from 'src/components/FormikImageCrop/FormikImageCrop'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import ScrollToErrors from 'src/components/ScrollToErrors/ScrollToErrors'
import FormikMultiupload from 'src/components/FormikMultiupload/FormikMultiupload'
import Upload from 'src/components/Upload/Upload'
import {
  Ad,
  MainInformationInputType,
  useCreateDraft,
  useEditDraft,
  useGetManufacturers,
  useGetModels,
  useUploadFiles,
  AdDocumentTypeEnum,
  AppUploadedFileDocTypeChoices,
} from 'src/generated/graphql'
import {
  getImageLink,
  ImageStyles,
  blobToBase64
} from 'src/helper'
import { setNotification } from 'src/reducers/notificationReducer'
import { AppDispatch } from 'src/store'
import { FileType, Options } from 'src/types'
import * as Yup from 'yup'

interface ICreateAdMain {
  id: string
  step: number
  onStep: (step: number) => void
  currentAd: Ad
  category: Options
  condition: Options
  onError: (text: string) => void
}

interface IInitialValues {
  country: number
  condition: string
  category: string
  manufacturer: string
  model: string
  images: FileType[]
  imagesLength: number
  year: string | number
  description: string
  //brochure?: FileType[]
  specSheet?: FileType[]
  documents?: FileType[]
  //recentInspectionReport?: FileType[]
}

const MainSchema = Yup.object().shape({
  year: Yup.number()
    .typeError('Must be a number')
    .min(1900, 'Must be minimum 1900')
    .max(new Date().getFullYear(), `Must be maximum ${new Date().getFullYear()}`)
    .required('Required'),
  condition: Yup.string().required('Required'),
  category: Yup.string().required('Required'),
  manufacturer: Yup.string().required('Required'),
  model: Yup.string().nullable().required('Required'),
  /*images: Yup.array().test({
    message: 'Required',
    test: arr => arr.find(el => el.file !== null),
  }),*/
  imagesLength: Yup.number().min(1, 'Upload at least 1 photo').required('Required'),
  /*brochure: Yup.array()
    .of(
      Yup.object().shape({
        file: Yup.string(),
        filename: Yup.string(),
      }),
    ),*/
  specSheet: Yup.array().test({
    message: 'Required',
    test: arr => arr.find(el => el.file !== null),
  }),
  documents: Yup.array().test({
    message: 'Choose a document type',
    test: arr => arr.length == 0 || arr.filter(el => el.docType == null)?.length == 0,
  }),
  /*recentInspectionReport: Yup.array()
    .of(
      Yup.object().shape({
        file: Yup.string(),
        filename: Yup.string(),
      }),
    ),*/
  description: Yup.string()
    .max(6000, "Description can contain maximum 6000 symbols.")
})

const CreateAdMain: React.FC<ICreateAdMain> = React.memo(props => {
  const { id, step, onStep, currentAd, category, condition, onError } = props

  const [initialValues, setInitialValues] = useState<IInitialValues>({
    country: null,
    condition: '',
    category: '',
    manufacturer: '',
    model: '',
    images: [],//Array(10).fill({ file: null, filename: null }),
    imagesLength: null,
    year: '',
    description: '',
    specSheet: [],
    documents: []
    /*brochure: [],
    recentInspectionReport: [],*/

  })
  const [activeThumb, setActiveThumb] = useState<number>(0)

  const [images, setImages] = useState([])

  const [isNext, setNext] = useState<boolean>()
  const [modelOptions, setModelOptions] = useState<Options>([])
  const [manufacturerOptions, setManufacturerOptions] = useState<Options>([])
  const [isLoading, setLoading] = useState<boolean>()

  const formikRef = useRef(null)
  const dispatch: AppDispatch = useDispatch()
  const [, createDraft] = useCreateDraft()
  const [, updateDraft] = useEditDraft()
  const [, getManufacturers] = useGetManufacturers()
  const [, getModels] = useGetModels()
  const [, uploadFiles] = useUploadFiles()
  const history = useHistory()
  const { choices } = useSelector((state: RootState) => state.choices)


  const uploadFile = async (el, docType: AppUploadedFileDocTypeChoices = null) => {
    if (el?.id) {
      return el
    } else {
      if (el?.file) {
        const response = await fetch(el?.file)
        const blob = await response?.blob()
        const base64 = await blobToBase64(blob)
        const result = await uploadFiles({ files: [{ file: base64, filename: el.filename, isPublic: true, docType }] })
        const image = result?.data?.uploadFiles?.files[0]
        return {
          id: image?.id,
          file: getImageLink(image, ImageStyles.AD_VIEW),
          filename: image?.filename,
          docType: image?.docType
        }
      }
    }
  }

  useEffect(() => {
    if (currentAd?.mainInformation && id) {
      const { images, condition, category, manufacturer, model, description, year, country, documents } = currentAd?.mainInformation
      let formattedImages: FileType[] = []

      images.forEach(image => {
        formattedImages.push({
          id: image?.id,
          file: getImageLink(image, ImageStyles.AD_VIEW),
          filename: image?.filename,
        })
      })

      const specSheet = documents.filter(d => d.docType == AppUploadedFileDocTypeChoices.SPEC_SHEET)
      const restDocuments = documents.filter(d => d.docType !== AppUploadedFileDocTypeChoices.SPEC_SHEET)

      setInitialValues({
        year,
        description,
        images: formattedImages,
        imagesLength: formattedImages.length,
        condition: condition?.value.toString() ?? '',
        category: category?.value.toString() ?? '',
        manufacturer: manufacturer?.value.toString() ?? '',
        model: model?.value.toString() ?? '',
        country: country?.value,
        documents: restDocuments,
        specSheet: specSheet
      })

      //changeImages(formattedImages)
      handleCategories(category?.value.toString() ?? '', true)
      handleManufacture(manufacturer?.value.toString() ?? '', true)
    }
  }, [currentAd])

  const makeNext = (isNext: boolean, isSubmitting: boolean) => {
    if (!isSubmitting) {
      formikRef.current.handleSubmit()
      setNext(isNext)
    }
  }

  const successQuery = (id: string) => {
    if (isNext) {
      onStep(step + 1)
      history.push(`/create-ad/${id}`)
    } else {
      history.push('/inventory')
    }
  }

  const handleCategories = (category: string, isClean: boolean) => {
    setLoading(true)
    getManufacturers({ category: +category })
      .then(res => {
        const response = res.data.getManufacturers
        const runtimeError = response?.runtimeError
        if (runtimeError) {
          dispatch(setNotification({ text: runtimeError?.message, isPositive: false }))
          console.error(runtimeError.message)
          return false
        }
        setManufacturerOptions(response?.manufacturers)
        !isClean ? setInitialValues(prev => { return { ...prev, manufacturer: '', model: '' } }) : null
        !isClean ? setModelOptions(null) : null
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false))
  }

  const handleManufacture = (manufacturer: string, isClean: boolean) => {
    setLoading(true)
    getModels({ manufacturer: +manufacturer })
      .then(res => {
        const response = res?.data?.getModels
        const runtimeError = response?.runtimeError
        if (runtimeError) {
          dispatch(setNotification({ text: runtimeError?.message, isPositive: false }))
          console.error(runtimeError?.message)
          return false
        }
        setModelOptions(response?.models)
        !isClean ? setInitialValues({ ...initialValues, model: '' }) : null

      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false))
  }

  const submitForm = async (values: IInitialValues, { setSubmitting, setErrors }) => {
    setLoading(true)
    setSubmitting(true)
    const gallery: FileType[] = await Promise.all(
      images.map(f => uploadFile(f))
    )

    const adDocuments = []
    if (values?.specSheet?.length) {
      const specSheet: FileType[] = await Promise.all(
        values?.specSheet?.map(f => {
          return f.id
            ? f
            : uploadFile(f, AppUploadedFileDocTypeChoices.SPEC_SHEET)
        })
      )
      specSheet.forEach(f => adDocuments.push({
        file: f?.id,
        type: AppUploadedFileDocTypeChoices.SPEC_SHEET
      }))
    }
    if (values?.documents?.length) {

      const documents: FileType[] = await Promise.all(
        values?.documents?.map(f => {
          return f.id
            ? f
            : uploadFile(f, f.docType)
        })
      )
      documents.forEach(f => adDocuments.push({
        file: f.id,
        type: f.docType
      }))
    }

    const mainInformation: MainInformationInputType = {
      description: values?.description,
      country: values?.country,
      year: +values?.year,
      condition: +values?.condition,
      category: +values?.category,
      manufacturer: +values?.manufacturer,
      model: +values?.model,
      images: gallery.map(el => el?.id),
      documents: adDocuments
    }

    if (id) {
      updateDraft({ draftId: id, currentStep: step, mainInformation })
        .then(res => {
          const response = res?.data?.editDraft
          const fieldErrors = response?.fieldErrors
          const runtimeError = response?.runtimeError
          if (runtimeError) {
            onError(runtimeError?.message)
            setSubmitting(false)
            setLoading(false)
            return false
          }
          if (fieldErrors) {
            let errorList = {}
            fieldErrors.map(err => (errorList[err.field] = err.message))
            setErrors(errorList)
            setSubmitting(false)
            setLoading(false)
            return false
          }
          successQuery(response?.draft?.id)
        })
        .catch(err => console.error(err))
    } else {
      createDraft({ mainInformation })
        .then(res => {
          const response = res?.data?.createDraft
          const fieldErrors = response?.fieldErrors
          const runtimeError = response?.runtimeError
          if (runtimeError) {
            console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
            setSubmitting(false)
            setLoading(false)
            return false
          }
          if (fieldErrors) {
            let errorList = {}
            fieldErrors.map(err => (errorList[err.field] = err.message))
            setErrors(errorList)
            setSubmitting(false)
            setLoading(false)
            return false
          }
          successQuery(response?.draft?.id)
        })
        .catch(err => console.error(err))
    }

  }


  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        innerRef={formikRef}
        onSubmit={submitForm}
        validationSchema={MainSchema}
      >
        {({ values, setFieldValue, isSubmitting, errors, touched, handleSubmit }) => {
          return (
            <Form className="create-ad__form" >
              <ScrollToErrors errors={errors} isSubmitting={isSubmitting} />
              <div className="create-ad__info">
                <div className="create-ad__info-title label-required">Main information</div>
                <div className="create-ad__info-items">
                  <FormikSelect name="condition" options={condition} className="select" placeholder="Condition" />
                  <FormikSelect
                    name="category"
                    options={category}
                    className="select"
                    placeholder="Category"
                    changeHandler={handleCategories}
                  />
                  <FormikSelect
                    name="manufacturer"
                    options={manufacturerOptions}
                    className="select"
                    placeholder="Manufacturers"
                    changeHandler={handleManufacture}
                    isLoading={isLoading}
                  />
                  <FormikSelect
                    name="model"
                    options={modelOptions}
                    className="select"
                    placeholder="Model"
                    isLoading={isLoading}
                  />
                </div>
              </div>

              <div className="create-ad__inputs">
                <FormikField name="year" label="Year" required placeholder="Enter Year" />
                <FormikSelect
                  className="select"
                  options={choices?.countries}
                  name="country"
                  label="Country of registration"
                />
              </div>

              <div>
              </div>
              <div className="create-ad__upload" data-name="images">
                <div className="create-ad__upload-block">
                  <div className="create-ad__images-wrapper">
                    <div className="create-ad__upload-subtitle">
                      <div className="label-required">Upload photo</div>
                      <div className="field__error">

                        {touched.images && errors.imagesLength ? <div className="field__error"><>{errors.imagesLength}</></div> : null}

                      </div>
                    </div>
                    <FormikImageCrop
                      onChange={images => {
                        setImages(images)
                        setFieldValue('imagesLength', images.length)
                      }}
                      name="images"
                      ratio={1.7777}
                      minWidth={1024}
                      minHeight={576}
                      onCropStart={() => setLoading(true)}
                      onCropFinish={() => setLoading(false)}
                    />
                  </div>
                  <div className="create-ad__docs-wrapper">
                    <div className="create-ad__upload-subtitle">
                      <div className="label-required">Upload documents</div>
                      
                    </div>
                    <div className="load-brochure multiupload-wrapper">
                      <div className="load-brochure__content">
                        <h2 className="label-required">Specification</h2>
                        {<div className="load-brochure__text">
                          (PDF format only)
                        </div>}
                      </div>
                      <FormikMultiupload name="specSheet" multiple docType={AppUploadedFileDocTypeChoices.SPEC_SHEET} noDocTypeSelect />
                    </div>
                    <div className="load-brochure multiupload-wrapper">
                      <div className="load-brochure__content">
                        <h2 className="label">Other documents</h2>
                        {/*<div className="load-brochure__text">
                          You can upload a brochure, recent inspection report or other documents.
                        </div>*/}
                      </div>
                      <FormikMultiupload name="documents" multiple docType={null} />
                    </div>
                  </div>
                  {/* <div className="create-ad__upload-guides">
                    <div className="create-ad__upload-title">Recommendation & guides</div>
                    <p className="create-ad__upload-text">Great photos help attract buyers. Upload your photos in the order you would like them to appear.</p>
                    <p className="create-ad__upload-text">Recommended Image Resolution: 800 x 470 px or higher.</p>
                    <p className="create-ad__upload-text">
                      For best results, we highly recommend adding a front 3/4 photo of the exterior! Professional and aesthetic photographs of the interior help your potential buyers embark on the probable experience and will promote your listing.
                    </p>
                  </div> */}
                </div>
                <label className="create-ad__description">
                  <span className="create-ad__label">Description</span>
                  <FormikField name="description" placeholder="Text here..." isTextarea />
                </label>




              </div>
              <div className="create-ad__footer">
                <Sticky className="create-ad__sticky" mode="bottom">
                  <div className="create-ad__holder">
                    <Button
                      className="create-ad__btn"
                      type="secondary"
                      onClick={() => makeNext(false, isSubmitting || isLoading)}
                      disabled={isSubmitting || isLoading}
                      isLoading={isSubmitting}
                    >
                      Save draft and Exit
                    </Button>
                    <Button
                      className="create-ad__btn create-ad__btn--next"
                      onClick={() => makeNext(true, isSubmitting || isLoading)}
                      disabled={isSubmitting || isLoading}
                      isLoading={isSubmitting}
                    >
                      Next
                    </Button>
                  </div>
                </Sticky>
              </div>
            </Form>
          )
        }}
      </Formik >
    </>
  )
})

export default CreateAdMain
