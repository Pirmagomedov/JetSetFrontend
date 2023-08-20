import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { withRouter, useHistory, useLocation } from 'react-router-dom'
import CabinetNav from 'src/components/CabinetNav/CabinetNav'
import Layout from 'src/hoc/Layout'
import { AppDispatch, RootState } from 'src/store'
import { useCountryName, useWorkspaceSwitcher } from 'src/hooks'
import { setProfile } from 'src/reducers/userReducer'
import { Form, Formik } from 'formik'
import FormikField from 'src/components/FormikField/FormikField'
import FormikFile from 'src/components/FormikFile/FormikFile'
import FormikCheckbox from 'src/components/FormikCheckbox/FormikCheckbox'
import FormikSwitch from 'src/components/FormikSwitch/FormikSwitch'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import PrivateLink from 'src/components/PrivateLink/PrivateLink'
import CardImage from 'src/components/CardImage/CardImage'
import { format } from 'date-fns'
import {
  useUploadFiles,
  FileType,
  BankDetails,
  WorkspaceBank,
  WorkspaceShort,
  AppWorkspaceInviteStatusChoices,
  WorkspacePage,
  WorkspaceEnum,
  WorkspaceList,
  WorkspacePartner,
  WorkspaceInvite,
  WorkspaceView,
  WorkspaceDetailed,
  useCompanyDetails,
  useMyProfileFull,
  useMyProfile,
  useSetBankDetails,
  PermissionEnum,
  AppPermissionsRoleChoices,
  Permission,
  useUpdateProfile,
  useUpdateFlags,
  useMyProfileDetailed,
  useCreateWorkspace,
  useEditWorkspace,
  AppWorkspaceRoleChoices,
  useInviteUser,
  ProfileMain,
  useReplyInvite,
  useGetWorkspace,
  useLoadWorkspaceAds,
  ProfileFull,
  AdWorkspace,
  Profile,
  useMyInvites,
  ProfileDetail,
  ChangeUserInformationInput,
  useSetRepresentativeFlags,
  useSetRepresentativePermissions,
  useLeaveWorkspace,
  useRemoveRepresentative
} from 'src/generated/graphql'
import Modal from 'src/components/Modal/Modal'
import { setNotification } from 'src/reducers/notificationReducer'
import AvatarImageCropper from 'react-avatar-image-cropper';
import ImageUploader from 'src/components/ImageUploader/ImageUploader'
import LoaderView from 'src/components/LoaderView/LoaderView'
import Icon from 'src/components/Icon/Icon'
import Button from 'src/components/Button/Button'
import { PermissionTitles } from 'src/types'
import {
  blobToBase64,
  getWorkspaceKycKybState,
  KycKybState,
  getWorkspaceRoleTitle,
  getWorkspaceTitle,
  getProductTitle,
  responsibleWorkspaceId,
  permSign,
  getImageLink,
  getImageRatio,
  ImageStyles,
  getWorkspaceIcon
} from 'src/helper'
import SumSubIframe from './views/SumSubIframe/SumSubIframe'
import ProfileIndividual from './views/ProfileIndividual/ProfileIndividual'
import KycFlag from './views/KycFlag/KycFlag'
import {
  useSimpleLoader,
  useCurrentWorkspace
} from 'src/hooks'
import ProfileField from './views/ProfileField/ProfileField'
import ProfileFileField from './views/ProfileField/ProfileFileField'
import FileLink from 'src/components/FileLink/FileLink'
import './SumSubProfile.scss'



const getPermission = (p: AppPermissionsRoleChoices): PermissionEnum => {
  if (PermissionEnum[p]) return PermissionEnum[p]
  return PermissionEnum.NOT_ASSIGNED
}

interface workspaceSplit {
  representatives: WorkspaceList[],
  authorizedExecutive: WorkspaceList[]
}

const splitWorkspaces = (workspace: WorkspaceDetailed | WorkspaceList | WorkspacePartner): workspaceSplit => {
  const result: workspaceSplit = { representatives: [], authorizedExecutive: [] }

  let representatives = []

  if (
    workspace.role == AppWorkspaceRoleChoices.CORPORATE
    && workspace?.company
    && 'representatives' in workspace?.company
  ) {
    representatives = workspace.company.representatives
  } else if (workspace?.individual?.representatives) {
    representatives = workspace.individual.representatives
  }

  representatives.forEach(ws => {
    if (ws.isAuthorizedExecutive) {
      result.authorizedExecutive.push(ws)
    } else {
      result.representatives.push(ws)
    }
  })
  return result
}




const initialReviewState: string = 'initialized'


interface IProfileFlags {
  flags: string
}


interface IWorkspaceField {
  title: string
  value: string | number | null
  corporate?: boolean
  hideEmpty?: boolean
  kyc: boolean
}


interface IWorkspace {
  workspace: WorkspaceList | WorkspaceDetailed | WorkspacePartner
  readonly?: boolean
  profile?: Profile
  onSwitch?: (id: string) => void
  onDetails?: (id: string) => void
  updateWorkspaces?: () => void
  onKyc?: () => void
  kycKybState?: boolean
  full?: boolean
  short?: boolean
  authority?: boolean
  isOpen?: boolean
}

interface IWorkspaces {
  profile: ProfileMain
  switching: boolean
  onWorkspaceView?: (id: string) => void
  onWorkspaceSwitch?: (id: string) => void
  updateWorkspaces?: () => void
}

interface IWorkspaceFull {
  workspace: WorkspaceShort
  readonly?: boolean
  profile?: ProfileMain
  onSwitch?: (id: string) => void
  onDetails?: (id: string) => void
  onKyc?: () => void
  kycKybState?: boolean
  full?: boolean
  short?: boolean
  authority?: boolean
  onReturn?: () => void
  updateWorkspaces?: () => void
  onStartKyb?: (companyId: string) => void
  onStartKyc?: (profileId: string) => void
}

interface IWorkspaceAuth {
  profile?: ProfileFull
  readonly?: boolean
  workspace: WorkspaceList
  updateWorkspaces?: () => void
  isOpen?: boolean
}

interface IWorkspaceBank {
  workspace: WorkspaceBank
  readonly?: boolean
  updateWorkspaces?: () => void
}

interface IWorkspacePoA {
  workspace: WorkspaceList
  readonly?: boolean
  updateWorkspaces?: () => void
}


interface IBankField {
  value: string
  title: string
  name: string
  readOnly: boolean
  onSave: () => void
}

export const BankField: React.FC<IBankField> = (props) => {
  const { title, value, name, onSave, readOnly } = props
  const [edit, setEdit] = useState<boolean>(false)

  const toggle = () => {
    if (edit) {
      setEdit(false)
      if (onSave) onSave()
    } else {
      setEdit(true)
    }
  }

  return (
    <div className="profile-field">
      <div className="profile-field__title">
        {title}
        {
          !readOnly &&
          <Button type='icon' onClick={toggle}>
            <Icon name={edit ? "i-save" : "i-edit"} />
          </Button>
        }
      </div>
      <div className="profile-field__value">
        {
          edit ?
            <FormikField name={name} value={String(value)} callback={toggle} />
            :
            value
        }
      </div>
    </div>
  )
}


const WorkspaceBankAccount: React.FC<IWorkspaceBank> = (props) => {
  const { workspace, updateWorkspaces, readonly } = props
  const formikRef = useRef(null)
  const [, setBankDetails] = useSetBankDetails()
  const [bankData, setBankData] = useState<BankDetails>(workspace.bankDetails ? workspace.bankDetails : {
    name: '',
    address: '',
    accountNumber: '',
    swiftCode: '',
    iban: '',
    sortCode: ''
  })

  const handleSubmit = () => {
    formikRef.current.handleSubmit()
  }

  const formSubmit = (values) => {
    setBankDetails({
      bankDetails: {
        name: values.name,
        address: values.address,
        accountNumber: values.accountNumber,
        swiftCode: values.swiftCode,
        iban: values.iban,
        sortCode: values.sortCode,
        workspace: workspace.id
      }
    }).then(res => {
      const updatedDetails = res?.data?.bankDetails?.bankDetails
      setBankData(updatedDetails)
      if (updateWorkspaces) updateWorkspaces()
    })
  }

  return (
    <Formik innerRef={formikRef} initialValues={bankData} onSubmit={formSubmit} enableReinitialize={true}>
      {({ values }) =>
        <Form className='workspace__data__group workspace__bank'>
          <BankField readOnly={readonly} value={values?.name} name="name" title="Bank name" onSave={handleSubmit} />
          <BankField readOnly={readonly} value={values?.address} name="address" title="Bank address" onSave={handleSubmit} />
          <BankField readOnly={readonly} value={values?.accountNumber} name="accountNumber" title="Account number" onSave={handleSubmit} />

          <BankField readOnly={readonly} value={values?.swiftCode} name="swiftCode" title="SWIFT code" onSave={handleSubmit} />
          <BankField readOnly={readonly} value={values?.iban} name="iban" title="IBAN" onSave={handleSubmit} />
          <BankField readOnly={readonly} value={values?.sortCode} name="sortCode" title="Sort code" onSave={handleSubmit} />
        </Form>
      }
    </Formik>

  )
}


interface IPoA {
  position: string,
  proofOfAuthority: FileType
}


const WorkspacePoA: React.FC<IWorkspacePoA> = (props) => {
  const { readonly, workspace, updateWorkspaces } = props
  const formikRef = useRef(null)
  const [, uploadFiles] = useUploadFiles()
  const [poaData, setPoaData] = useState<IPoA>({
    position: workspace.position ? workspace.position : '',
    proofOfAuthority: workspace.proofOfAuthority ? workspace.proofOfAuthority : null
  })
  const [, editWorkspace] = useEditWorkspace()
  const [uploadedUUID, setUploadedUUID] = useState<string>()

  const handleSubmit = () => {
    formikRef.current.handleSubmit()
  }

  const handleUpload = async (data) => {
    const url: string = await blobToBase64(data.file)
    uploadFiles({
      files: [{ file: url, filename: data.filename, isPublic: false }]
    }).then(res => {
      if (res?.data?.uploadFiles?.files?.length == 1) {
        editWorkspace({ workspaceId: workspace.id, proofOfAuthority: res.data.uploadFiles.files[0].id }).then(res => {
          updateWorkspaces()
        })
      }
    })
  }

  const formSubmit = (values) => {
    editWorkspace({ workspaceId: workspace.id, position: values.position }).then(res => {
      updateWorkspaces()
    })
  }



  return (
    <Formik innerRef={formikRef} initialValues={poaData} onSubmit={formSubmit} enableReinitialize={true}>
      {({ values, handleSubmit }) =>
        <Form className='workspace__data__group workspace_poa'>
          <ProfileField onSave={handleSubmit} editable={!readonly} name="position" value={values.position} title="Position" />
          <ProfileFileField onSave={handleUpload} editable={!readonly} name="proofOfAuthority" value={workspace.proofOfAuthority} title="Proof of Authority" />
        </Form>
      }
    </Formik>
  )
}

const WorkspaceAuthority: React.FC<IWorkspaceAuth> = (props) => {
  const { profile, workspace, readonly, updateWorkspaces, isOpen } = props

  const [workspaceResult, loadWorkspace] = useGetWorkspace({ requestPolicy: 'network-only', pause: true, variables: { workspaceId: workspace.id } })
  const [authorityProfile, setAuthorityProfile] = useState<ProfileFull>(profile)
  const hasKyc = authorityProfile?.kycInfo?.kyc?.reviewAnswer
  const currentWorkspace = useCurrentWorkspace()
  const hostWorkspace = responsibleWorkspaceId(currentWorkspace)
  const isWorkspaceAdmin = ((currentWorkspace.id !== workspace.id && hostWorkspace == workspace.id && currentWorkspace.isAdmin) || currentWorkspace.id == workspace.id)

  useEffect(() => {
    if (authorityProfile && authorityProfile.id) {
      //do nothing
    } else {
      loadWorkspace()
      console.log('load workspace to achieve profile')
    }
  }, [profile])

  useEffect(() => {
    if (workspaceResult?.data) {
      if (workspaceResult?.data?.getWorkspace?.workspace?.user) {
        setAuthorityProfile(workspaceResult.data.getWorkspace.workspace.user)
      }
    }
  }, [workspaceResult])

  if (workspace.isAdmin && workspace.role == AppWorkspaceRoleChoices.INDIVIDUAL) {
    return null
  }

  return (
    <>
      {
        authorityProfile?.id ?
          <>
            {/* <h3>Authorized executive</h3> */}
            <div className={`workspace__data workspace__authority ${readonly ? 'readonly' : 'editable'}`}>

              <div className="workspace__data__avatar">

                <div className="workspace__data__avatar--avatar">
                  <img src={getImageLink(authorityProfile?.avatar, ImageStyles.AVATAR)} />
                </div>
              </div>

              <div className="workspace__data__fixed">
                <div className="workspace__data__group">
                  <WorkspaceField value={authorityProfile?.kycInfo?.firstName} title="First name" kyc={hasKyc} />
                  <WorkspaceField value={authorityProfile?.kycInfo?.lastName} title="Last name" kyc={hasKyc} />
                  <WorkspaceField value={authorityProfile?.kycInfo?.middleName} title="Middle name" kyc={hasKyc} />
                </div>
                <div className="workspace__data__group w13">
                  <WorkspaceField value={authorityProfile?.email} title="Email" kyc={hasKyc} />
                </div>
                {
                  isWorkspaceAdmin &&
                  <WorkspacePoA updateWorkspaces={updateWorkspaces} workspace={workspace} readonly={readonly || !isWorkspaceAdmin} />
                }
              </div>
            </div>
          </>
          :
          <LoaderView ring />
      }

    </>
  )
}

const WorkspaceFull: React.FC<IWorkspaceFull> = (props) => {
  const { onStartKyc, onStartKyb, onReturn, workspace, profile, onSwitch, readonly, updateWorkspaces } = props
  const isCorporate = workspace?.role == AppWorkspaceRoleChoices.CORPORATE ||
    (workspace?.role == AppWorkspaceRoleChoices.REPRESENTATIVE && workspace?.company?.id)
  const hasKyc = profile?.kycInfo?.kyc?.reviewAnswer
  const responsibleId = responsibleWorkspaceId(workspace)
  const history = useHistory()

  const [workspaceResult, reloadWorkspace] = useGetWorkspace({ requestPolicy: 'network-only', variables: { workspaceId: responsibleId } })
  const workspaceDetailed = workspaceResult?.data?.getWorkspace?.workspace ? workspaceResult.data.getWorkspace.workspace : null
  const profileFull = workspaceResult?.data?.getWorkspace?.workspace?.user?.id ? workspaceResult.data.getWorkspace.workspace.user : null
  //const [profileFull, loadProfileFull] = useMyProfileFull()
  const dispatch: AppDispatch = useDispatch()

  useEffect(() => {
    if (workspaceResult?.data?.getWorkspace?.workspace?.user?.id) {
      if (responsibleId == workspace?.id) {
        dispatch(setProfile(workspaceResult.data.getWorkspace.workspace.user))
      }
    }
    /*loadProfileFull().then(res => {
      const newProfile = res.data.myProfile.profile
      dispatch(setProfile(newProfile))
    })*/
  }, [workspaceDetailed?.id])


  const handleKycClick = () => {
    if (!readonly) {
      if (isCorporate && hasKyc) {
        onStartKyb(workspace.company.id)
      } else {
        onStartKyc(profile.id)
      }
    }
  }

  const handleViewPublicProfile = () => {
    window.open(`/user/${workspace.id}`)
  }

  console.log('workspace', workspace, profile)

  return (
    <div className="workspace-full">
      {
        workspaceDetailed?.id /*&& profileFull.data.myProfile.id*/ ?
          <>
            {
              !readonly &&
              <div className="workspace-full__buttons">
                <Button onClick={() => onReturn()}>Return</Button>
                {
                  profile?.currentWorkspace?.id != workspace.id &&
                  <Button onClick={() => onSwitch(workspace.id)}>Switch to workspace</Button>
                }
                {
                  !readonly && hasKyc &&
                    workspace.role === 'CORPORATE' ?
                      workspace.company.kyb ?
                        <Button
                          onClick={handleViewPublicProfile}
                        >
                          View Public Profile
                        </Button>
                      : 
                        null
                    :
                      workspace.user?.kycInfo?.kyc?.reviewAnswer ?
                        <Button
                          onClick={handleViewPublicProfile}
                        >
                          View Public Profile
                        </Button>
                      : 
                        null
                }
              </div>
            }
            <Workspace
              updateWorkspaces={reloadWorkspace}
              onKyc={handleKycClick}
              profile={profileFull}
              workspace={workspaceDetailed}
              readonly={readonly}
              full
            />
          </>
          :
          <LoaderView ring />
      }
    </div>
  )
}



interface IWorkspacesItem {
  workspace: WorkspaceShort
  profile: ProfileMain
  switching: boolean
  onSwitch: (id: string) => void
  onDetails: (id: string) => void
}

const WorkspacesItem: React.FC<IWorkspacesItem> = (props) => {
  // Этот компонент используется на входной странице WS
  const { workspace, profile, onSwitch, onDetails, switching } = props

  const currentWorkspaceId = profile?.currentWorkspace?.id
  const hasKyc = profile?.kycInfo?.kyc?.reviewAnswer
  const isCorporate = workspace?.role == AppWorkspaceRoleChoices.CORPORATE ||
    (workspace?.role == AppWorkspaceRoleChoices.REPRESENTATIVE && workspace?.company?.id)

  const handleSwitch = () => {
    onSwitch(workspace.id)
  }

  return (
    <div className="workspace short" id={`list_item__${workspace.id}`}>
      <div className="workspace__header">
        <h2>{getWorkspaceTitle(workspace)}
          <div className="workspace__header__type">{`${getWorkspaceRoleTitle(workspace.role)} account`}</div>
        </h2>
      </div>
      <div className="workspace__buttons">
        {
          currentWorkspaceId != workspace.id ?
            <Button className={switching ? 'isSwitching' : 'canSwitch'} onClick={handleSwitch}>Switch to workspace  {switching && <LoaderView ring />}</Button>
            :
            <Button onClick={() => onDetails(workspace.id)}>Profile</Button>
        }
      </div>
      <KycFlag
        title={isCorporate && hasKyc ? 'KYB' : 'KYC'}
        workspace={workspace}
        active={false}
      />
    </div>
  )
}


const WorkspaceIndividual: React.FC<IWorkspace> = (props) => {
  const { profile, full, authority, short, workspace, readonly, updateWorkspaces, isOpen } = props
  const getCountry = useCountryName()
  const dispatch: AppDispatch = useDispatch()
  const [, uploadFiles] = useUploadFiles()
  const [, updateProfile] = useUpdateProfile()
  const hasKyc = profile?.kycInfo?.kyc?.reviewAnswer
  const imageUrl = getImageLink(profile?.avatar, ImageStyles.AVATAR)


  const applyAvatar = async (avatar) => {
    const url: string = await blobToBase64(avatar)
    uploadFiles({
      files: [{ file: url, filename: avatar.name }],
    }).then(res => {
      if (res?.data?.uploadFiles?.files?.length == 1) {
        updateProfile({
          userInfo: {
            avatar: res.data.uploadFiles.files[0].id
          },
        }).then(res => {
          if (res?.data?.changeUserInformation?.profile) {
            const newProfile = res.data.changeUserInformation.profile
            dispatch(setProfile(newProfile))
            updateWorkspaces()
          }
        })
      }
    })
  }


  return (
    <div className="workspace__data">
      <div className="workspace__data__avatar">
        <div className="workspace__data__avatar--avatar">
          {
            readonly ?
              <img src={getImageLink(profile?.avatar, ImageStyles.AVATAR)} />
              :
              <AvatarImageCropper
                maxsize={1024 * 1024 * 4}
                apply={applyAvatar}
                title=""
                text=" "
                icon={<img src={getImageLink(profile?.avatar, ImageStyles.AVATAR)} />}
                sliderConStyle={{ background: '#fff' }}
              />
          }
        </div>
      </div>
      <div className="workspace__data__fixed">
        <div className="workspace__data__group">
          <WorkspaceField value={profile?.kycInfo?.firstName} title="First name" kyc={hasKyc} />
          <WorkspaceField value={profile?.kycInfo?.lastName} title="Last name" kyc={hasKyc} />
          <WorkspaceField value={profile?.kycInfo?.middleName} title="Middle name" kyc={hasKyc} />
        </div>
        <div className="workspace__data__group w13">
          <WorkspaceField value={profile?.email} title="Email" kyc={hasKyc} />
        </div>
        {
          !short &&
          <>
            <div className="workspace__data__group no-border">
              <WorkspaceField value={getCountry(profile?.kycInfo?.address?.country?.value)} title="Country" kyc={hasKyc} />
              <WorkspaceField value={profile?.kycInfo?.address?.city} title="City" kyc={hasKyc} />
              <WorkspaceField value={profile?.kycInfo?.address?.postalCode} title="Postal code" kyc={hasKyc} />
            </div>
            <div className="workspace__data__group no-border full-width">
              <WorkspaceField value={profile?.kycInfo?.address?.street1} title="Street 1" kyc={hasKyc} />
            </div>
            <div className="workspace__data__group no-border full-width" >
              <WorkspaceField value={profile?.kycInfo?.address?.street2} title="Street 2" kyc={hasKyc} />
            </div>
            {
              !readonly &&
              <WorkspaceBankAccount workspace={workspace} updateWorkspaces={updateWorkspaces} />
            }
          </>
        }
      </div>
    </div>
  )
}


const WorkspaceCorporate: React.FC<IWorkspace> = (props) => {
  const { workspace, full, kycKybState, short, readonly, updateWorkspaces, isOpen } = props;
  const company = workspace.company
  const getCountry = useCountryName()
  const [, companyDetails] = useCompanyDetails()
  const [, uploadFiles] = useUploadFiles()
  const currentWorkspace = useCurrentWorkspace()
  const hostWorkspace = responsibleWorkspaceId(currentWorkspace)
  const isWorkspaceAdmin = ((currentWorkspace.id !== workspace.id && hostWorkspace == workspace.id && currentWorkspace.isAdmin) || currentWorkspace.id == workspace.id)

  const applyLogo = async (filename, blob) => {
    const url: string = await blobToBase64(blob)
    uploadFiles({
      files: [{ file: url, filename: filename }],
    }).then(res => {
      if (res?.data?.uploadFiles?.files?.length == 1) {
        companyDetails({
          companyId: company.id,
          label: '',
          logoId: res.data.uploadFiles.files[0].id
        }).then(res => {
          updateWorkspaces()
          //console.log('companyDetails', res)
          //window.location.reload()//dirty!! TODO
        })
      }
    })
  }

  return (
    <div className="workspace__data">
      <div className="workspace__data__avatar">
        <div className="workspace__data__avatar--avatar">
          {
            readonly ?
              <img src={getImageLink(workspace?.company?.logo, ImageStyles.LOGO)} />
              :
              <ImageUploader
                name="companyLogo"
                onChange={applyLogo}
                icon={getImageLink(workspace?.company?.logo, ImageStyles.LOGO)}
              />
          }
        </div>
      </div>

      <div className="workspace__data__fixed">
        {
          !kycKybState &&
          <div className="workspace__data__group full-width">
            <div className="workspace__kyb-message">
              You need to pass KYC and KYB before you can use this workspace
            </div>
          </div>
        }
        <div className="workspace__data__group">
          <WorkspaceField
            corporate
            value={company.name}
            title="Company name"
            kyc={kycKybState} />
          <WorkspaceField
            corporate
            value={company.website}
            title="Website"
            kyc={kycKybState} />
          <WorkspaceField
            corporate
            value={company.registrationNumber}
            title="Registration number"
            kyc={kycKybState} />
        </div>


        <div className="workspace__data__group">
          <WorkspaceField
            corporate
            value={company.phone}
            title="Phone"
            kyc={kycKybState}
          />
          <WorkspaceField
            corporate
            value={company.email}
            title="Email"
            kyc={kycKybState}
          />
          <WorkspaceField
            corporate
            value={company.taxIdNumber}
            title="Tax ID"
            kyc={kycKybState}
          />
        </div>

        {
          !short &&
          <>
            <div className="workspace__data__group no-border">
              <WorkspaceField
                value={getCountry(company.address?.country?.value)}
                title="Country"
                kyc={kycKybState}
              />
              <WorkspaceField
                value={company?.address?.city}
                title="City"
                kyc={kycKybState}
              />
              <WorkspaceField
                value={company?.address?.postalCode}
                title="Postal code"
                kyc={kycKybState}
              />
            </div>
            <div className="workspace__data__group no-border full-width">
              <WorkspaceField
                value={company?.address?.street1}
                title="Street 1"
                kyc={kycKybState}
              />
            </div>
            <div className="workspace__data__group full-width" >
              <WorkspaceField
                value={company?.address?.street2}
                title="Street 2"
                kyc={kycKybState}
              />
            </div>

            <div className="workspace__data__group no-border">
              {
                company.proofOfIncorporation?.length > 0 && company.proofOfIncorporation.map(doc => <PrivateLink key={doc.id} fileKey={doc.key} fileName='Proof of Incorporation' fileBucket={doc.bucket} className="workspace__data__proof-doc" icon>Proof of Incorporation</PrivateLink>)
              }
              {
                company.proofOfSigneesAuthority?.length > 0 && company.proofOfSigneesAuthority.map(doc => <PrivateLink key={doc.id} fileKey={doc.key} fileName='Proof of Authority' fileBucket={doc.bucket} className="workspace__data__proof-doc" icon>Proof of Authority</PrivateLink>)
              }

            </div>
            {
              !readonly &&
              <WorkspaceBankAccount
                workspace={workspace}
                updateWorkspaces={updateWorkspaces}
                readonly={!isWorkspaceAdmin}
              />
            }
          </>
        }
      </div>
    </div>
  )
}


interface IWorkspaceView {
  workspace: WorkspaceView
}


const WorkspaceShortView: React.FC<IWorkspaceView> = (props) => {
  const { workspace } = props
  const isCorporate = workspace.role == AppWorkspaceRoleChoices.CORPORATE
  const image = isCorporate ? getImageLink(workspace?.company?.logo, ImageStyles.LOGO) : getImageLink(workspace?.user?.avatar, ImageStyles.AVATAR)

  return (
    <div className="workspace__data">
      <div className="workspace__data__avatar">
        <div className="workspace__data__avatar--avatar">
          <img src={image} />
        </div>
      </div>

      <div className="workspace__data__fixed">
        {
          isCorporate ?
            <>
              <div className="workspace__data__group">
                <WorkspaceField
                  value={workspace.company.name}
                  title="Company name"
                  kyc={true}
                />
                <WorkspaceField
                  value={workspace.company.website}
                  title="Website"
                  kyc={true}
                />
                <WorkspaceField
                  value={workspace.company.registrationNumber}
                  title="Registration number"
                  kyc={true}
                />
              </div>
              <div className="workspace__data__group">
                <WorkspaceField
                  value={workspace.company.phone}
                  title="Phone"
                  kyc={true}
                />
                <WorkspaceField
                  value={workspace.company.email}
                  title="Email"
                  kyc={true}
                />
                <WorkspaceField
                  value={workspace.company.taxIdNumber}
                  title="Tax ID"
                  kyc={true}
                />
              </div>
            </>
            :
            <>
              <div className="workspace__data__group">
                <WorkspaceField
                  value={workspace?.user?.kycInfo?.firstName}
                  title="First name"
                  kyc={true} />
                <WorkspaceField
                  value={workspace?.user?.kycInfo?.lastName}
                  title="Last name"
                  kyc={true} />
                <WorkspaceField
                  value={workspace?.user?.kycInfo?.middleName}
                  title="Middle name"
                  kyc={true} />
              </div>
              <div className="workspace__data__group w13">
                <WorkspaceField
                  value={workspace?.user?.email}
                  title="Email"
                  kyc={true} />
              </div>
            </>
        }
      </div>
    </div>
  )
}


interface IProfileInvite {
  invite: WorkspaceInvite
  onReply: () => void
}

const ProfileInvite: React.FC<IProfileInvite> = (props) => {
  const { invite, onReply } = props
  const [, reply] = useReplyInvite()
  const [replied, setReplied] = useState<boolean>(false)

  const handleReply = (accept: boolean) => {
    if (!replied) {
      setReplied(true)
      reply({
        inviteId: invite.id,
        isAccepted: accept
      }).then(res => {
        if (onReply) onReply()
      })
    }
  }

  return (
    <div className="profile-invite">
      <WorkspaceShortView workspace={invite.workspace} />
      <div className="profile-invite__actions">
        <Button disabled={replied} onClick={() => handleReply(true)}>Join</Button>
        <Button
          type="secondary"
          disabled={replied}
          onClick={
            () => {
              return handleReply(false)
            }
          }
        >
          Reject
        </Button>
      </div>
    </div >
  )
}


const InviteRepresentative: React.FC<IWorkspace> = (props) => {
  const { workspace } = props
  const formikRef = useRef(null)
  const [, inviteUser] = useInviteUser()
  const [message, setMessage] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false);
  const currentWorkspace = useCurrentWorkspace()
  const hostWorkspace = responsibleWorkspaceId(currentWorkspace)
  const isWorkspaceAdmin = ((currentWorkspace.id !== workspace.id && hostWorkspace == workspace.id && currentWorkspace.isAdmin) || currentWorkspace.id == workspace.id)

  const formSubmit = (values, { resetForm }) => {
    inviteUser({ ...values }).then(res => {
      if (res?.data?.inboundInviteWorkspace?.success) {
        setMessage('Invitation sent, waiting for the user to join the company')
      } else {
        const error = res?.data?.inboundInviteWorkspace?.runtimeError?.message ?
          res.data.inboundInviteWorkspace.runtimeError.message
          :
          'Unexpected error'
        setMessage(error)
      }
    })
    resetForm()
    setEmail('')
  }

  const handleChange = (v) => {
    setEmail(v?.target?.value)
    //console.log('handleChange', v)
  }

  useEffect(() => {
    var t
    if (message !== '') {
      t = setTimeout(() => { setMessage('') }, 5000)
    }
    return () => { clearTimeout(t) }
  }, [message])

  const handleSubmit = () => {
    formikRef.current.handleSubmit()
  }

  if (!isWorkspaceAdmin) return null



  const handleClick = (event) => {
    setIsOpen(!isOpen)
  }

  return (
    <div className='collapsible'>
      <div
        className="collapsible__title"
        onClick={handleClick}
      >
        <Icon
          name='add'
          className={isOpen ? 'i-opened' : 'i-closed'}
        />
        <h3>Invite representative</h3>
      </div>
      <div className={`collapsible__body invite-email__${isOpen ? 'open' : 'close'}`}>
        <Formik
          innerRef={formikRef}
          onSubmit={formSubmit}
          enableReinitialize={true}
          initialValues={{ email }}
        >
          {
            ({ values }) => {
              return (
                <Form className='workspace__invite-representative-form'>
                  <FormikField
                    type="email"
                    isEmail={true}
                    name="email"
                    label="Representative email"
                    changeHandler={handleChange}
                  />
                  <Button onClick={handleSubmit}>Invite</Button>
                </Form>
              )
            }
          }
        </Formik>
        {
          message !== '' &&
          <div className="workspace__invite-representative-form--message">{message}</div>
        }
      </div>
    </div>
  )
}


interface IInvitesList {
  profile: ProfileMain
  updateWorkspaces: () => void
}

const InvitesList: React.FC<IInvitesList> = (props) => {
  const [invites, getInvites] = useMyInvites()
  const { updateWorkspaces } = props

  useEffect(() => {
    getInvites()
  }, [])

  const handleReply = () => {
    getInvites()
    updateWorkspaces()
  }

  console.log('invites', invites)

  if (!invites?.data?.myProfile?.profile?.invites?.length) return null

  const pending = invites.data.myProfile.profile.invites.filter(invite => invite.status == AppWorkspaceInviteStatusChoices.PENDING)

  if (!pending.length) return null

  return (
    <>
      <h2>Invites</h2>
      <div className="workspace-invites">
        {
          pending.map(
            (invite) => {
              return (
                <ProfileInvite
                  key={invite.id}
                  invite={invite}
                  onReply={handleReply}
                />
              )
            }
          )
        }
      </div>
    </>
  )
}


interface IWorkspaceAircrafts {
  ad: AdWorkspace
  editable: boolean
  permissions: Permission[]
  workspaceId: string
  onReloadAds: () => void
}

const WorkspaceAircrafts: React.FC<IWorkspaceAircrafts> = (props) => {
  const { ad, editable, permissions, workspaceId, onReloadAds } = props
  const formikRef = useRef(null)
  const [, setBankDetails] = useSetBankDetails()
  const currentPermission = ad.permissions.filter(p => p.ad.id == ad.id && p.workspace.id == workspaceId)
  const currentPermissionRole = currentPermission?.[0] ? getPermission(currentPermission[0].role) : PermissionEnum.NOT_ASSIGNED
  const title = getProductTitle(ad)

  const [permission, setPermission] = useState<PermissionEnum>(currentPermissionRole)
  const [, assignPermission] = useSetRepresentativePermissions()

  // const options = []

  // Cтрочку ниже не трогаем
  // Object.keys(PermissionEnum).forEach(key => options.push({ label: PermissionEnum[key], value: PermissionEnum[key] }))

  // Object.keys(PermissionEnum).filter((key) => {
  //   return key !== 'SIGNEE'
  // })
  //   .forEach(key => options.push({ label: PermissionTitles[key], value: PermissionEnum[key] }))

  const options = [
    {
      label: PermissionTitles['NOT_ASSIGNED'],
      value: PermissionEnum['NOT_ASSIGNED']
    },
    {
      label: PermissionTitles['VIEWER'],
      value: PermissionEnum['VIEWER']
    },
    {
      label: PermissionTitles['MANAGER'],
      value: PermissionEnum['MANAGER']
    }
  ]


  const handleSubmit = () => {
    formikRef.current.handleSubmit()
  }

  const formSubmit = (values) => {
    assignPermission({
      permissions: [{
        adId: ad.id,
        role: values[ad.id] ? values[ad.id] : PermissionEnum.NOT_ASSIGNED,
        representativeId: workspaceId
      }]
      , workspaceId: ad.owner.id
    }).then(res => {
      onReloadAds()
      //console.log('assignPermission', res)
    })
  }

  const aircraftDetails = []

  if (ad?.mainInformation?.year)
    aircraftDetails.push(<span key={'v1'}><Icon name="i-calendar" title='YEAR' />{`${ad?.mainInformation?.year}`}</span>)
  if (ad?.aircraftSummary?.registrationNumber)
    aircraftDetails.push(<span key={'v2'}><b>Reg. No</b>{ad?.aircraftSummary?.registrationNumber}</span>)
  if (ad?.aircraftSummary?.airframeTtsn)
    aircraftDetails.push(<span key={'v3'}><Icon name="i-clock" title='TTSN' />{`${ad?.aircraftSummary?.airframeTtsn}`}</span>)



  return (
    !editable && currentPermissionRole == PermissionEnum.NOT_ASSIGNED
      ? null
      : <Formik innerRef={formikRef} initialValues={{ [ad.id]: permission }} onSubmit={formSubmit} enableReinitialize={true}>
        {({ values }) =>
          <Form className='ws-aircraft'>
            <div className="ws-aircraft__image">
              <CardImage
                ratio={getImageRatio(ImageStyles.AD)}
                src={getImageLink(ad?.mainInformation?.images?.[0], ImageStyles.AD)}
                title={title}
              />
            </div>
            <div className="ws-aircraft__title">{title}</div>
            <div className="ws-aircraft__details">
              {
                aircraftDetails
              }
            </div>
            <div className="ws-aircraft__actions">
              {
                editable ?
                  <FormikSelect
                    name={ad.id}
                    options={options}
                    changeHandler={handleSubmit}
                  />
                  :
                  PermissionTitles[permission]
              }
            </div>
          </Form>
        }
      </Formik>
  )
}


const WorkspaceAircraftList: React.FC<IWorkspaceRepresentative> = (props) => {
  const { workspace, ads, editable, parentWorkspace, onReloadAds, updateWorkspaces } = props
  const adList: AdWorkspace[] = []

  ads.forEach(ad => {
    const currentPermission = ad.permissions.filter(p => p.ad.id == ad.id && p.workspace.id == workspace.id)
    const currentPermissionRole = currentPermission?.[0] ? getPermission(currentPermission[0].role) : PermissionEnum.NOT_ASSIGNED
    if (!(!editable && currentPermissionRole == PermissionEnum.NOT_ASSIGNED)) {
      adList.push(ad)
    }
  })

  return (
    <div className="workspace__data__aircrafts">
      {
        adList.length > 0 &&
        <div className="workspace__aircrafts--header">
          <div className="col">Title</div>
          <div className="col">Details</div>
          <div className="col">Role</div>
        </div>
      }
      {adList
        .map(
          (ad) => {
            return (
              <WorkspaceAircrafts
                key={ad.id}
                ad={ad}
                onReloadAds={onReloadAds}
                editable={editable}
                workspaceId={workspace.id}
                permissions={'permissions' in parentWorkspace ? parentWorkspace.permissions : null}
              />
            )
          }
        )
      }
    </div>
  )
}






interface IWorkspaceRepresentative {
  ads: Array<AdWorkspace>
  workspace: WorkspaceList | WorkspaceDetailed
  parentWorkspace: WorkspaceList | WorkspaceDetailed
  editable: boolean
  onReloadAds: () => void
  onRemoveRepresentative?: (wid: string) => void
  updateWorkspaces: () => void
}


interface WSPermissions {
  isAdmin: boolean
  isCanCreateAd: boolean
  isAuthorizedExecutive: boolean
}

const WorkspaceRepresentative: React.FC<IWorkspaceRepresentative> = (props) => {
  // Этот компонент отображает профили репов в профиле WS
  const { workspace, ads, editable, parentWorkspace, onReloadAds, updateWorkspaces, onRemoveRepresentative } = props
  const kycKybState = getWorkspaceKycKybState(workspace)
  const kycState = !!workspace?.user?.kycInfo?.kyc?.reviewAnswer
  const [, setRepresentativeFlags] = useSetRepresentativeFlags()
  const currentWorkspace = useCurrentWorkspace()
  const isYou = currentWorkspace.id === workspace.id

  const formikRef = useRef(null)
  const [wsPermissions, setWsPermissions] = useState<WSPermissions>({
    isAdmin: workspace.isAdmin,
    isCanCreateAd: workspace.isCanCreateAd,
    isAuthorizedExecutive: workspace.isAuthorizedExecutive
  })

  const handleSubmit = () => {
    formikRef.current.handleSubmit()
  }

  const formSubmit = (values) => {
    setRepresentativeFlags({
      flags: { ...values, representativeId: workspace.id },
      workspaceId: responsibleWorkspaceId(workspace)
    }).then(res => {
      if (res?.data?.setRepresentativeFlags?.workspace) {
        const ws = res.data.setRepresentativeFlags.workspace
        updateWorkspaces()
        /*setWsPermissions({
          isAdmin: ws.isAdmin,
          isCanCreateAd: ws.isCanCreateAd,
          isAuthorizedExecutive: ws.isAuthorizedExecutive
        })*/
      }
    })
  }

  const [isOpen, setIsOpen] = useState(isYou ? true : false)

  const handleClick = (event) => {
    setIsOpen(!isOpen)
  }

  const handleRemoveRepresentative = () => {
    if (onRemoveRepresentative) {
      onRemoveRepresentative(workspace.id)
    }
  }

  //console.log('WorkspaceRepresentative', workspace?.user?.avatar)

  return (
    <div
      className={
        `
        workspace__data
        workspace__representative ${isYou ? 'workspace__representative--you' : 'workspace__representative--rep'}
        workspace__animation__${!isOpen && 'no-gap'}
        workspace__animation__${isOpen ? 'open' : 'closed'}
        `
      }
      id={workspace.id}
    >
      <div
        className='workspace__header bb'
        onClick={handleClick}
      >
        <h3 className='small-header'>
          {
            !isOpen && workspace.user.avatar &&
            <div className='avatar__icon'>
              <img src={getImageLink(workspace?.user?.avatar, ImageStyles.AVATAR)} />
            </div>
          }
          {getWorkspaceTitle(workspace, true)}
        </h3>
        <div className="workspace__header--rep">
          {workspace.isAdmin ? 'Administrator' : 'Representative'}
          &nbsp;
          {isYou && <strong>(you)</strong>}
        </div>
        {
          (isYou || editable) &&
          <KycFlag
            title="KYC"
            profile={workspace?.user}
            active={false}
          />
        }
        <div className={`line line__${isOpen ? 'flatten' : 'default'}`}></div>
      </div>

      <div className={`workspace__data__avatar`}>
        <div className="workspace__data__avatar--avatar">
          <img src={getImageLink(workspace?.user?.avatar, ImageStyles.AVATAR)} />
        </div>
      </div>

      <div className="workspace__data__fixed">
        <div className="workspace__data__group">
          <WorkspaceField
            value={workspace?.user?.kycInfo?.firstName}
            title="First name"
            kyc={kycState}
          />
          <WorkspaceField
            value={workspace?.user?.kycInfo?.lastName}
            title="Last name"
            kyc={kycState}
          />
          <WorkspaceField
            value={workspace?.user?.kycInfo?.middleName}
            title="Middle name"
            kyc={kycState}
          />
        </div>
        <div className="workspace__data__group">
          <WorkspaceField
            value={workspace?.user?.email}
            title="Email"
            kyc={kycState}
          />
        </div>


        <Formik
          innerRef={formikRef}
          initialValues={wsPermissions}
          onSubmit={formSubmit}
          enableReinitialize={true}>
          {
            ({ values }) => {
              return (
                <Form className='workspace__data__group workspace__access'>
                  <FormikSwitch
                    disabled={!editable}
                    name="isCanCreateAd"
                    label="Can create new listings"
                    handleChange={handleSubmit}
                  />
                  <FormikSwitch
                    name='isAdmin'
                    label='Administrator'
                    handleChange={handleSubmit}
                    disabled={!editable}
                  />
                  {/* <FormikCheckbox disabled={!editable} name="isAdmin" label="Administrator" handleChange={handleSubmit} /> */}
                  {/* <FormikCheckbox disabled={!editable} */}
                  {/* value={values?.isCanCreateAd} * /}
                  {/* name="isCanCreateAd" label="Can create new listings" handleChange={handleSubmit} /> */}
                </Form>
              )
            }
          }
        </Formik>

        <div className="workspace__data__group">
          {/* <WorkspaceField value={workspace?.user?.email} title="Email"  kyc={kycState}/> */}
        </div>
      </div>

      {
        (editable || isYou) &&
        <WorkspaceAircraftList
          ads={ads}
          onReloadAds={onReloadAds}
          editable={editable}
          workspace={workspace}
          updateWorkspaces={updateWorkspaces}
          parentWorkspace={parentWorkspace}
        />

      }
      <div className="workspace__actions">
        {
          (parentWorkspace.isAdmin || parentWorkspace.isAuthorizedExecutive) && !isYou &&
            <Button onClick={handleRemoveRepresentative}>Remove representative</Button>
        }
      </div>
    </div>
  )
}


const Workspace: React.FC<IWorkspace> = (props) => {
  // Этот компонент - отображение экзекьютива и репов во внутренней странице профиля
  const { onKyc, workspace, profile, onSwitch, onDetails, full, short, readonly, updateWorkspaces } = props
  const { id, role } = workspace
  const isCorporate = workspace?.role == AppWorkspaceRoleChoices.CORPORATE ||
    (workspace?.role == AppWorkspaceRoleChoices.REPRESENTATIVE && workspace?.company?.id)
  const router = useHistory()
  const currentWorkspace = useCurrentWorkspace()
  const hostWorkspace = responsibleWorkspaceId(currentWorkspace)
  const isRepresentative = currentWorkspace?.role == AppWorkspaceRoleChoices.REPRESENTATIVE && hostWorkspace == workspace.id
  const { isAdmin, isAuthorizedExecutive } = currentWorkspace
  const isWSOwner = workspace.id == currentWorkspace.id

  const [switching, setSwitching] = useState<boolean>(false)
  const isPending = profile?.flags?.kyc && !isCorporate || profile?.flags && JSON.parse(profile.flags)?.kyb == workspace?.company?.id && isCorporate
  const isNew = isCorporate && workspace?.company?.kyb == null || !isCorporate && profile?.kycInfo?.kyc == null
  const hasKyc = profile?.kycInfo?.kyc?.reviewAnswer || readonly
  const kycState = getWorkspaceKycKybState(workspace)
  const [workspaceAds, loadWorkspaceAds] = useLoadWorkspaceAds({ requestPolicy: 'network-only', pause: true, variables: { workspaceId: workspace.id } })
  const { representatives, authorizedExecutive } = splitWorkspaces(workspace)
  const [, leaveWorkspace] = useLeaveWorkspace()
  const [, removeRepresentative] = useRemoveRepresentative()
  const [leaveWorkspaceModal, setLeaveWorkspaceModal] = useState<boolean>(false)
  const [removeRepresentativeModal, setRemoveRepresentativeModal] = useState<string>(null)

  const [ads, setAds] = useState<AdWorkspace[]>([])



  useEffect(() => {
    if (workspaceAds?.data?.getWorkspace?.workspace?.ads?.length && !workspaceAds.fetching) {
      /*const adList:AdWorkspace[] = []
      workspaceAds.data.getWorkspace.workspace.ads.forEach(n => adList.push(n.node))
      setAds(adList)*/
      setAds(workspaceAds.data.getWorkspace.workspace.ads)
    }
  }, [workspaceAds])


  const handleReloadAds = () => {
    loadWorkspaceAds()
  }

  useEffect(() => {
    if (workspace.isAdmin) {
      loadWorkspaceAds()
    }
  }, [workspace.id])

  const handleSwitch = () => {
    if (!switching) {
      setSwitching(true)
      setTimeout(() => setSwitching(false), 3000)
      onSwitch(id)
    }
  }

  const handleLeaveWorkspace = () => {
    leaveWorkspace(
      workspace.role == AppWorkspaceRoleChoices.CORPORATE
        ? { companyId: workspace.company.id }
        : { individualId: workspace.individual.id }
    ).then(res => {
      if (res?.data?.leaveWorkspace?.user) {
        router.push('/profile')
      }
    })
  }

  const handleRemoveRepresentative = () => {
    const parameters = {
      representativeId: removeRepresentativeModal,
      companyId: workspace.role == AppWorkspaceRoleChoices.CORPORATE ? workspace.company.id : null,
      individualId: workspace.role == AppWorkspaceRoleChoices.CORPORATE ? null : workspace.individual.id
    }
    
    setRemoveRepresentativeModal(null)
    removeRepresentative(parameters).then(res => {
      if (res?.data?.removeRepresentative?.success) {
        updateWorkspaces()
      } else {
        console.error('Error removing representative', res)
      }
    })
  }

  const requestLeaveWorkspace = () => {
    if (isRepresentative) {
      setLeaveWorkspaceModal(true)
    }
  }


  const onKycFlagClick = () => {
    if (!readonly) {
      if (kycState === KycKybState.UPDATE) {
        onKyc()
      }
      if (kycState === KycKybState.PENDING) {
        onKyc()
      }
      if (kycState === KycKybState.NONE) {
        onKyc()
      }
    }
  }

  const kycFlag = <KycFlag
    onClick={onKycFlagClick}
    title={isCorporate && hasKyc ? 'KYB' : 'KYC'}
    workspace={workspace}
    active={full}
  />

  const [isOpen, setIsOpen] = useState(true)

  const handleClick = (event) => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={`workspace ${short ? 'short' : 'not-short'}`}>
      <div className={
        `
          self-account
          workspace__animation_open
          workspace__animation__${isOpen ? 'open' : 'closed'}
          `
      }>

        <div
          className='workspace__header bb'
          onClick={handleClick}
        >
          <h2
            className='small-header'
          >
            {
              !isOpen &&
              <div className='avatar__icon'>
                <img src={getWorkspaceIcon(workspace)} />
              </div>
            }

            <div>
              {getWorkspaceTitle(workspace)}
              <div className="workspace__header__type">{`${getWorkspaceRoleTitle(workspace.role)} account`}</div>
            </div>
          </h2>
          {!short && kycFlag}
          <div className={`line line__${isOpen ? 'flatten' : 'default'}`}>
          </div>
        </div>
        {
          isCorporate ?
            <>
              {full && authorizedExecutive.map(ae => <WorkspaceAuthority
                key={ae.id}
                readonly={readonly}
                workspace={ae}
                /*profile={profile}*/
                updateWorkspaces={updateWorkspaces}
                isOpen={isOpen}
              />)}
              <WorkspaceCorporate
                updateWorkspaces={updateWorkspaces}
                kycKybState={workspace?.company?.kyb?.reviewAnswer}
                workspace={workspace}
                full={full}
                short={short}
                readonly={readonly}
                isOpen={isOpen}
              />
            </>
            :
            <WorkspaceIndividual
              updateWorkspaces={updateWorkspaces}
              workspace={workspace}
              profile={profile}
              full={full}
              short={short}
              readonly={readonly}
              isOpen={isOpen}
            />
        }
      </div>
      <>
        {
          !short &&
          <>
            {
              !readonly &&
              <>
                {
                  representatives.length > 0 && 'permissions' in workspace &&
                  <>
                    {/* <h3>Representatives</h3> */}
                    {
                      representatives.sort((a, b) => a.id == currentWorkspace.id || a.dateCreated < b.dateCreated ? -1 : 1).map(re =>
                        <WorkspaceRepresentative
                          key={re.id}
                          parentWorkspace={workspace}
                          workspace={re}
                          ads={ads}
                          onReloadAds={handleReloadAds}
                          updateWorkspaces={updateWorkspaces}
                          onRemoveRepresentative={setRemoveRepresentativeModal}
                          editable={isAdmin || isAuthorizedExecutive || isWSOwner} />
                      )
                    }
                  </>
                }
                {
                  kycState == KycKybState.SUCCESS &&
                  <InviteRepresentative workspace={workspace} />
                }

              </>

            }
            {
              isRepresentative &&
              <div className="workspace__leave-buttons">
                <Button onClick={requestLeaveWorkspace}>Leave workspace</Button>
              </div>
            }
          </>
        }
        {!readonly &&
          <div className="workspace__buttons">
            {
              !full &&
              <>
                {
                  profile?.currentWorkspace?.id != id &&
                  <Button
                    className={switching ? 'isSwitching' : 'canSwitch'}
                    onClick={handleSwitch}>Switch to workspace  {switching && <LoaderView ring />}</Button>
                }
                <Button onClick={() => onDetails(id)}>Profile</Button>
              </>
            }
          </div>
        }
        {short && kycFlag}
      </>

      <Modal
        title="You are about to leave this workspace as a representative. Proceeding will lead to loss of access."
        className="modal workspace-leave-dialog"
        modalIsOpen={leaveWorkspaceModal}
        onRequestClose={() => setLeaveWorkspaceModal(false)}
        isCloseIcon={false}
        buttons={[
          {
            title: 'Cancel',
            onClick: () => setLeaveWorkspaceModal(false),
          },
          { title: 'Proceed', onClick: handleLeaveWorkspace },
        ]}
      />
      <Modal
        title="You are about to remove a representative. Proceeding will lead to loss of access."
        className="modal workspace-leave-dialog"
        modalIsOpen={!!removeRepresentativeModal}
        onRequestClose={() => setRemoveRepresentativeModal(null)}
        isCloseIcon={false}
        buttons={[
          {
            title: 'Cancel',
            onClick: () => setRemoveRepresentativeModal(null),
          },
          { title: 'Proceed', onClick: handleRemoveRepresentative },
        ]}
      />
    </div>
  )
}



const WorkspaceField: React.FC<IWorkspaceField> = (props) => {
  const { title, value, corporate, kyc, hideEmpty = false } = props
  const isEmpty = value === null || value == '' || value === undefined
  /*if (value === null || value == '' || value === undefined) return null*/
  if (isEmpty && (kyc || hideEmpty)) return null

  return (
    <div className="profile-field">
      <div className="profile-field__title">
        {title}
      </div>
      <div className="profile-field__value ">
        {
          !isEmpty ?
            value
            :
            <span className="empty">autofilled after {corporate ? 'KYB' : 'KYC'}</span>
        }
      </div>
    </div>
  )
}


const Workspaces: React.FC<IWorkspaces> = (props) => {
  const { profile, onWorkspaceView, switching, onWorkspaceSwitch, updateWorkspaces } = props
  const router = useHistory()

  const handleWorkspaceView = (id: string) => {
    router.push('/workspace/' + id)
  }


  return (
    <div className="workspaces">
      <h2>My workspaces</h2>
      <div className="workspaces__list">
        {
          profile.workspaces.length > 0 ?
            profile.workspaces.map(
              (ws) => {
                return (
                  <WorkspacesItem
                    profile={profile}
                    switching={switching}
                    onDetails={handleWorkspaceView}
                    onSwitch={onWorkspaceSwitch}
                    key={ws.id}
                    workspace={ws}
                  />
                )
              }
            )
            :
            <div className="workspaces__no-ws-alert">You haven’t joined or created any workspaces yet.</div>
        }
      </div>
      <InvitesList profile={profile} updateWorkspaces={updateWorkspaces} />
    </div>
  )
}







const ProfilePage: React.FC = () => {
  const [error, setError] = useState([])
  const dispatch: AppDispatch = useDispatch()
  const profileStored = useSelector((state: RootState) => state.user.profile)
  const { choices } = useSelector((state: RootState) => state.choices)
  const { simpleLoader, setSimpleLoaderState } = useSimpleLoader()

  const profileId: string = profileStored.id
  const [loading, setLoading] = useState<boolean>(true)
  const [, getProfile] = useMyProfile()
  const [, updateFlags] = useUpdateFlags()
  const [, createWorkspace] = useCreateWorkspace()
  const [switching, setSwitching] = useState<boolean>(true)
  const router = useHistory()
  const location = useLocation()
  //const [profileFull, setProfileFull] = useState<ProfileDetail>()
  const [isOnKYC, setIsOnKYC] = useState<string>()
  const [isOnKYB, setIsOnKYB] = useState<string>()
  const switchWorkspace = useWorkspaceSwitcher()
  const currentWorkspace = location.pathname.replace(/\/(workspace|profile)\/?(.*)/, '$2')
  //const [workspaceDetailed, reloadWorkspace] = useGetWorkspace({requestPolicy: 'network-only', pause: true, variables: {workspaceId: currentWorkspace ? currentWorkspace : undefined}})
  const [workspaceView, setWorkspaceView] = useState<string>(currentWorkspace ? currentWorkspace : null)
  const [workspaceViewItem, setWorkspaceViewItem] = useState<WorkspaceShort>(null)

  const refreshProfile = () => {
    getUserProfile()
  }

  useEffect(() => {
    const currentWorkspace = location.pathname.replace(/\/(workspace|profile)\/?(.*)/, '$2')
    const workspaceId = currentWorkspace ? currentWorkspace : null
    setWorkspaceView(workspaceId)
    if (!workspaceId) {
      getUserProfile()
    }
    /*if (workspaceId) {
      reloadWorkspace({requestPolicy: 'network-only', workspaceId: workspaceId})
    }*/
  }, [location.pathname])

  useEffect(() => {
    if (workspaceView && profileStored?.workspaces) {
      if (profileStored.workspaces.filter(w => w.id == workspaceView).length) {
        setWorkspaceViewItem(profileStored.workspaces.filter(w => w.id == workspaceView)[0])
      }
    } else {
      setWorkspaceViewItem(null)
    }
  }, [workspaceView, profileStored])


  const getUserProfile = async () => {
    getProfile().then((res) => {
      if (res?.data?.myProfile?.profile) {
        setSwitching(false)
        const myProfile: ProfileMain = res.data.myProfile.profile;
        dispatch(setProfile(myProfile))
        //setProfileFull(myProfile)
        const currentflags = JSON.parse(myProfile.flags)
        if (myProfile?.kycInfo?.kyc?.reviewAnswer && currentflags?.kyc) {
          const flags: IProfileFlags = currentflags?.kyb ?
            { flags: JSON.stringify({ kyb: currentflags.kyb }) }
            :
            { flags: null }
          updateFlags(flags)
        }
        /*if (myProfile?.kycInfo?.kyc?.reviewAnswer !== undefined) {
          if (myProfile.kycInfo.kyc.reviewAnswer == false || myProfile?.flags?.kyc === true) {
            setIsOnKYC(myProfile.id)
          }
        }*/
      }
    })
      .catch((err) => console.error(err))
      .finally(() => {
        setLoading(false)
      })
  }

  const handleCreateWorkspace = (corporate: boolean) => {
    if (!simpleLoader) {
      setSimpleLoaderState(true)
      createWorkspace({ workspaceType: corporate ? WorkspaceEnum.CORPORATE : WorkspaceEnum.INDIVIDUAL }).then(res => {
        console.log('handleCreateWorkspace', res.data.createWorkspace)
        if (res?.data?.createWorkspace?.user) {
          //setProfileFull(res.data.createWorkspace.user)
          dispatch(setProfile(res.data.createWorkspace.user))
          setSimpleLoaderState(false)
          if (res?.data?.createWorkspace?.user?.currentWorkspace?.id) {
            router.push('/workspace/' + res.data.createWorkspace.user.currentWorkspace.id)
          }
        }
      })
    }
  }

  const createIndividualWorkspace = () => {
    handleCreateWorkspace(false)
  }

  const createCorporateWorkspace = () => {
    handleCreateWorkspace(true)
  }


  const startKyc = (profileId: string) => {
    const flags: IProfileFlags = {
      flags: JSON.stringify({ kyc: true })
    }
    updateFlags(flags)
    setIsOnKYC(profileId)
  }

  const startKyb = (companyId: string) => {
    const flags: IProfileFlags = {
      flags: JSON.stringify({ kyb: companyId })
    }
    updateFlags(flags)
    setIsOnKYB(companyId)
  }

  const kycKybFinish = (close: boolean) => {
    if (close) {
      setIsOnKYC(null)
      setIsOnKYB(null)
      getUserProfile()
    } else {
      const flags: IProfileFlags = {
        flags: null
      }
      updateFlags(flags)
    }
  }

  const handleSwitchWorkspace = (id: string) => {
    setSwitching(true)
    switchWorkspace(id).then(profileNew => {
      getUserProfile()

      /*setProfileFull(profileNew)
      dispatch(setProfile(profileNew))*/
    })
  }

  const handleWorkspaceReturn = () => {
    setWorkspaceView(null)
    router.push('/profile')
  }

  useEffect(() => {
    setLoading(false)
  }, [profileStored?.currentWorkspace?.id])

  return (
    <Layout>
      <CabinetNav page="profile" />
      <SumSubIframe
        kyc={isOnKYC}
        kyb={isOnKYB}
        onFinish={kycKybFinish} >
        <div className="profile container">
          {
            !profileStored ?
              <LoaderView ring />
              :
              workspaceView ?
                workspaceViewItem ?
                  <WorkspaceFull
                    updateWorkspaces={refreshProfile}
                    onStartKyc={startKyc}
                    onStartKyb={startKyb}
                    onReturn={handleWorkspaceReturn}
                    workspace={workspaceViewItem}
                    onSwitch={handleSwitchWorkspace}
                    profile={profileStored} />
                  :
                  <LoaderView ring />
                :
                <div className="profile__tree">

                  <ProfileIndividual
                    profile={profileStored}
                    createCorporateWorkspace={createCorporateWorkspace}
                    createIndividualWorkspace={createIndividualWorkspace}
                    updateWorkspaces={refreshProfile}
                    isOnKYC={isOnKYC !== null && isOnKYC !== undefined}
                  />
                  <Workspaces
                    updateWorkspaces={refreshProfile}
                    switching={switching}
                    profile={profileStored}
                    onWorkspaceSwitch={handleSwitchWorkspace} />
                </div>
          }
        </div>
      </SumSubIframe>
    </Layout>
  )
}

export { Workspace, WorkspaceFull }

export default withRouter(ProfilePage)
