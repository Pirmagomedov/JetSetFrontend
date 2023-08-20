import React, { useEffect, useRef, useState } from 'react'
import { Form, Formik } from 'formik'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSwitch from 'src/components/FormikSwitch/FormikSwitch'
import { useCountryName } from 'src/hooks'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/store'
import { setProfile } from 'src/reducers/userReducer'
import { 
  useUploadFiles, 
  useUpdateProfile, 
  ProfileFull, 
  AppWorkspaceRoleChoices,
  useRemoveAllWorkspaces,
  ProfileMain
} from 'src/generated/graphql'
import ProfileField from '../ProfileField/ProfileField'

import Icon from 'src/components/Icon/Icon'
import Button from 'src/components/Button/Button'
import KycFlag from '../KycFlag/KycFlag'
import AvatarImageCropper from 'react-avatar-image-cropper'
import { 
  blobToBase64,
  getImageLink,
  ImageStyles
} from 'src/helper'
import { useSimpleLoader } from 'src/hooks'
import LoaderView from 'src/components/LoaderView/LoaderView'


interface IProfileSlice {
  firstName?: string
  lastName?: string
  middleName?: string
  hideAvatar?: boolean
  hideFullName?: boolean 
  username?: string
}

interface IProfileIndividual {
  profile: ProfileMain,
  isOnKYC?: boolean,
  createIndividualWorkspace?: () => void,
  createCorporateWorkspace?: () => void,
  updateWorkspaces?: () => void
}


const getProfileSlice = (p: ProfileMain):IProfileSlice => {
  if (p?.kycInfo?.firstName) {
    return {
      firstName: p?.kycInfo?.firstName,
      lastName: p?.kycInfo?.lastName,
      middleName: p?.kycInfo?.middleName,
    }
  } 
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    middleName: p.middleName,
  }
}


const ProfileIndividual: React.FC<IProfileIndividual> = (props) => {
  const { profile, isOnKYC, createIndividualWorkspace, createCorporateWorkspace, updateWorkspaces } = props
  const {simpleLoader, setSimpleLoaderState} = useSimpleLoader()
  const formikRef = useRef(null)
  const dispatch: AppDispatch = useDispatch()
  const [, updateProfile] = useUpdateProfile()
  const [, uploadFiles] = useUploadFiles()
  const [userData, setUserData] = useState<IProfileSlice>(getProfileSlice(profile))
  const [edit, setEdit] = useState<boolean>(false)
  const [profileEditable, setProfileEditable] = useState<boolean>(!profile?.kycInfo?.kyc?.reviewAnswer)
  const [manualSubmit, setManualSubmit] = useState<boolean>(false)
  const getCountry = useCountryName()
  const [noIndividualAccount, setNoIndividualAccount] = useState<boolean>()
  const [showWSRemover, setShowWSRemover] = useState<number>(0)
  const [, removeAllWorkspaces] = useRemoveAllWorkspaces()
  const profileTitle = profile?.kycInfo?.firstName ? `${profile.kycInfo.firstName} ${profile.kycInfo.lastName}` : profile?.username


  useEffect(() => {
    var hasIndividual = false
    profile.workspaces.forEach(w => {
      if (w.role == AppWorkspaceRoleChoices.INDIVIDUAL) {
        hasIndividual = true
      }
    })
    setNoIndividualAccount(!hasIndividual)
  }, [])


  const avatar = getImageLink(profile?.avatar, ImageStyles.AVATAR)

  const handleSubmit = (e:any) => {
    setManualSubmit(true)
    formikRef.current.handleSubmit()
  }

  const doSumbitValues = (submitted) => {
    updateProfile({
      userInfo: submitted, 
    }).then(res => {

      //console.log('updateProfile',res)
      updateWorkspaces()
      if (res?.data?.changeUserInformation?.profile) {
        const newProfile = res.data.changeUserInformation.profile
        dispatch(setProfile(newProfile))
        setUserData(getProfileSlice(newProfile))
      }
    })
  }

  const applyAvatar = async (avatar) => {
    const url:string = await blobToBase64(avatar)
    uploadFiles({
      files: [{ file: url, filename: avatar.name }],
    }).then(res => {
      if (res?.data?.uploadFiles?.files?.length == 1) {

        const fileId = res.data.uploadFiles.files[0].id
        const profileInput = {
          ...userData, 
          avatar: fileId
        }
        doSumbitValues(profileInput)
      }
    })
  }

  return (
    <Formik innerRef={formikRef} initialValues={userData} onSubmit={(values) => {
      const profileInput = {...values}
      if (manualSubmit) {
        doSumbitValues(profileInput)
      }
      setManualSubmit(false)
    }} enableReinitialize={true}>
      {({ values, resetForm }) =>
        <Form className='inventory__form'>
          <div className="profile__header">
            <h1>{profileTitle}</h1>
            {
              profile?.kycInfo?.kyc?.reviewAnswer !== undefined &&
                <KycFlag profile={profile} />
            }
          </div>
          <div className="profile__personal">
            <div className="profile__personal__data">
              <div className="profile__personal__avatar">
                <div className="profile__personal__avatar--avatar">
                  <AvatarImageCropper 
                      maxsize={1024*1024*4}
                      apply={applyAvatar} 
                      text=" "
                      icon={<img src={avatar}  />}
                      sliderConStyle={{background: '#fff'}}
                  />
                </div>
              </div>
              <div className="profile__personal__fixed">
                <div className="profile__personal__group">
                  <ProfileField onSave={handleSubmit} editable={profileEditable} name="firstName" value={values?.firstName} title="First name"/>
                  <ProfileField onSave={handleSubmit} editable={profileEditable} name="lastName" value={values?.lastName} title="Last name"/>
                  <ProfileField onSave={handleSubmit} editable={profileEditable} name="middleName" value={values?.middleName} title="Middle name"/>
                </div>
                <div className="profile__personal__group no-border full-width move-right" onClick={() => setShowWSRemover(showWSRemover+1)}>
                  <div className={`workspaces__buttons ${simpleLoader ? 'loading' : 'loaded'}`} >
                    {
                      noIndividualAccount && !isOnKYC &&
                        <Button onClick={createIndividualWorkspace} >Create Individual account {simpleLoader && <LoaderView ring />}</Button>
                    }
                    <Button onClick={createCorporateWorkspace} >Create Corporate account {simpleLoader && <LoaderView ring />}</Button>
                    {
                      showWSRemover > 10 &&
                        <Button onClick={() => removeAllWorkspaces() }>Удалятор воркспейсов</Button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      }
    </Formik>
  )
}

export default ProfileIndividual


/*

<div className="profile__personal__fixed">
                <div className="profile__personal__group">
                  <ProfileField onSave={handleSubmit} editable={profileEditable} name="firstName" value={values?.firstName} title="First name"/>
                  <ProfileField onSave={handleSubmit} editable={profileEditable} name="lastName" value={values?.lastName} title="Last name"/>
                  <ProfileField onSave={handleSubmit} editable={profileEditable} name="middleName" value={values?.middleName} title="Middle name"/>
                </div>
                <div className="profile__personal__group w13">
                  <ProfileField value={profile?.email} title="Email"/>
                </div>
                <div className="profile__personal__group no-border">
                  <ProfileField value={getCountry(profile?.kycInfo?.address?.country?.value)} title="Country"/>
                  <ProfileField value={profile?.kycInfo?.address?.city} title="City"/>
                  <ProfileField value={profile?.kycInfo?.address?.postalCode} title="Postal code"/>
                </div>
                <div className="profile__personal__group no-border full-width">
                  <ProfileField value={profile?.kycInfo?.address?.street1} title="Street 1"/>
                </div>
                <div className="profile__personal__group no-border full-width" >
                  <ProfileField value={profile?.kycInfo?.address?.street2} title="Street 2"/>
                </div>
              </div>

*/