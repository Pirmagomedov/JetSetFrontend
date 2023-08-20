import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { withRouter, useHistory, useLocation, useParams, } from 'react-router-dom'
import CabinetNav from 'src/components/CabinetNav/CabinetNav'
import Layout from 'src/hoc/Layout'
import { AppDispatch, RootState } from 'src/store'
import {
  useMyDealPartners,
  Profile,
  WorkspacePartner,
  useMyProfileFull,
  useGetWorkspacePublic
} from 'src/generated/graphql'
import {
  useCurrentWorkspace,
  useProfile
} from 'src/hooks'
import Avatar from 'src/components/Avatar/Avatar'
import LoaderView from 'src/components/LoaderView/LoaderView'
import { Workspace } from './SumSubProfile'
import { useSimpleLoader } from 'src/hooks'
import ProfileField from './views/ProfileField/ProfileField'
import './SumSubProfile.scss'

interface IPath {
  id?: string
}

const PublicProfile: React.FC = () => {
  const profileStored = useProfile()
  const params = useParams<IPath>()
  const [myDeals, loadDeals] = useMyDealPartners()
  const [matchedProfile, setMatchedProfile] = useState<Profile>(null)
  const [matchedWorkspace, setMatchedWorkspace] = useState<WorkspacePartner>(null)
  const [profileFull, loadProfileFull] = useMyProfileFull()
  const [loading, setLoading] = useState<boolean>(false)
  const currentWorkspace = useCurrentWorkspace()
  const [workspaceResult, reloadWorkspace] = useGetWorkspacePublic({ requestPolicy: 'network-only', pause: true, variables: { workspaceId: params.id } })
  

  useEffect(() => {
    if (params.id == currentWorkspace?.id && workspaceResult?.data?.getWorkspace?.workspace) {
      setMatchedWorkspace(workspaceResult.data.getWorkspace.workspace)
      setLoading(false)
    }
  }, [workspaceResult])

  useEffect(() => {
    if (params.id == currentWorkspace?.id) {
      setLoading(true)
      reloadWorkspace()
      loadProfileFull().then(res => {
        if (res?.data?.myProfile?.profile) {
          setMatchedProfile(res.data.myProfile.profile)
        }
      })

      //setMatchedWorkspace(currentWorkspace)
      //setMatchedProfile(profileStored)
    } else {
      setLoading(true)
      loadDeals({ first: 50, offset: 0, isActive: true, newFirst: true })
    }
  }, [params.id, currentWorkspace?.id])

  useEffect(() => {
    if (params.id == currentWorkspace?.id) {
      setLoading(true)
      loadProfileFull().then(res => {
        if (res?.data?.myProfile?.profile) {
          setLoading(false)
          setMatchedProfile(res.data.myProfile.profile)
          setMatchedWorkspace(workspaceResult.data.getWorkspace.workspace)
        }
      })
    } else {
      setLoading(true)
      loadDeals({ first: 50, offset: 0, isActive: true, newFirst: true })
    }
  }, [params.id])

  useEffect(() => {
    setLoading(false)
    if (myDeals?.data?.myDeals?.deals?.edges?.length) {
      //console.log('matchedProfile.data.myDeals.edges',myDeals.data.myDeals.deals.edges)
      for (var i = 0; i < myDeals.data.myDeals.deals.edges.length; i++) {
        const deal = myDeals.data.myDeals.deals.edges[i].node
        if (deal.seller.id === params.id) {
          setMatchedWorkspace(deal.seller)
          setMatchedProfile(deal.seller.user)
          break
        }
        if (deal.buyer.id === params.id) {
          setMatchedWorkspace(deal.buyer)
          setMatchedProfile(deal.buyer.user)
          break
        }
      }
    }
  }, [myDeals?.data])

  return (
    <Layout>
      <CabinetNav page="profile" />
      <div className="container">
        <div className="profile__tree">
          {myDeals.fetching ?
            <LoaderView ring />
            :
            matchedWorkspace 
              ?  <Workspace workspace={matchedWorkspace} profile={matchedProfile} readonly={true} />
              :  loading 
                  ?  <LoaderView ring />
                  :  <div className="error">Not found</div>
          }
        </div>
      </div>
    </Layout>
  )
}


export default withRouter(PublicProfile)