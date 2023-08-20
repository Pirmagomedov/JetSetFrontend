import React, { 
    useEffect, 
    useState 
} from 'react'
import { useWorkspaceKycKybPassed } from 'src/hooks'
import LoaderView from 'src/components/LoaderView/LoaderView'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'src/store'
import { setProfile } from 'src/reducers/userReducer'
import {
    useGetKycKyb,
    AppWorkspaceRoleChoices
} from 'src/generated/graphql'
import { 
    useCurrentWorkspace, 
    useProfile 
} from 'src/hooks'
import { 
    KycKybState, 
    getWorkspaceKycKybState 
} from 'src/helper'

interface IKycKybBlocker {
    hide?: boolean
    wsOnly?: boolean
    children?: JSX.Element[] | JSX.Element
    message?: string | JSX.Element
}

const KycKybBlocker: React.FC<IKycKybBlocker> = (props) => {
    const { children, hide, wsOnly = false, message } = props
    const currentWorkspace = useCurrentWorkspace()
    const dispatch: AppDispatch = useDispatch()
    const profile = useProfile()
    const [ , getKycKyb ] = useGetKycKyb()
    const [ updating, setUpdating ] = useState<boolean>(false)
    const defaultAccess = wsOnly ? !!currentWorkspace?.id : getWorkspaceKycKybState(currentWorkspace, profile) === KycKybState.SUCCESS
    const [ hasAccess, setHasAccess ] = useState<boolean>(defaultAccess)
    const getAccess = useWorkspaceKycKybPassed()

    useEffect(() => {
        if (currentWorkspace?.id) {
            if (wsOnly) {
                setHasAccess(true)
            } else {
                getAccess().then((hasAccess) => {
                    setHasAccess(hasAccess == KycKybState.SUCCESS)
                })                
            }
        } else {
            if (wsOnly) {
                setHasAccess(false)
            }
        }
    }, [currentWorkspace?.id])

    /*useEffect(() => {
        if (hasAccess !== KycKybState.SUCCESS) {
            if (!updating) {
                setUpdating(true)
                getKycKyb().then(res => {
                    setUpdating(false)
                    const p = res?.data?.myProfile.profile
                    if (currentWorkspace.role == AppWorkspaceRoleChoices.CORPORATE) {
                        if (p?.currentWorkspace?.company?.kyb?.reviewAnswer) {
                            const profileUpdated = profile
                            profileUpdated.currentWorkspace.company.kyb = p.currentWorkspace.company.kyb
                            dispatch(setProfile(profileUpdated))
                        }
                    } else {
                        if (p?.kycInfo?.kyc?.reviewAnswer) {
                            const profileUpdated = profile
                            profileUpdated.kycInfo.kyc = p.kycInfo.kyc
                            dispatch(setProfile(profileUpdated))
                        }
                    }
                })
            }
        }
    }, [hasAccess])*/

    if (hasAccess === null) {
        return <LoaderView ring />
    }

    if (!hasAccess) {
        if (hide) {
            return null
        } else {
            return (
                <div className="no-kyc-kyb">
                    <div className="no-kyc-kyb__message">
                        {
                            message 
                                ? message
                                : wsOnly 
                                    ? 'You have to create a workspace first' 
                                    : 'KYC/KYB not passed'
                        }
                    </div>
                </div>
            )
        }
    }

    return <>{children}</>
}

export default KycKybBlocker
