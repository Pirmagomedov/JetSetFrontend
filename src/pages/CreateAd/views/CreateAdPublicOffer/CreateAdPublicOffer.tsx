import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import Layout from 'src/hoc/Layout'
import { AdPermission, useGetAdPermission } from 'src/generated/graphql'
import { setNotification } from 'src/reducers/notificationReducer'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import SignNow from 'src/components/SignNow/SignNow'
import LoaderView from 'src/components/LoaderView/LoaderView'




const CreateAdPublicOffer: React.FC = React.memo(props => {
  const { id: adId } = useParams<{ id: string }>()
  const [, getAdPermission] = useGetAdPermission()
  
  const [ad, setAd] = useState<AdPermission>(null)
  useEffect(() => {
    getAdPermission({ adId: adId }).then(res => {
      if (res?.data?.getAd?.ad) {
        setAd(res.data.getAd.ad)
      }
    })
  },[])


  const dispatch = useDispatch()
  const router = useHistory()

  const onHelpModal = () => {
    console.log('hlpme!')
  }


  return (
    <Layout>
      <div className="container" >
      {
        ad ?
          <SignNow 
            title="Public Offer"
            adId={adId}
            docType="PO"
            onHelpModal={onHelpModal}
            onSuccess={() => {
              router.push(`/inventory`)
            }}
            backTitle='Return'
            onBack={() => router.push(`/inventory`)}
          />
        :
          <LoaderView ring />
      }
        
      </div>
    </Layout>
    
  )
})

export default CreateAdPublicOffer
