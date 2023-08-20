import React, { useEffect, useState } from 'react'
import SumsubWebSdk from '@sumsub/websdk-react'
import Button from 'src/components/Button/Button'
import LoaderView from 'src/components/LoaderView/LoaderView'
import axios from 'axios'

interface ISumSubIframe {
  kyc?: string
  kyb?: string
  onFinish: (close: boolean) => void
  children: JSX.Element
}

const SumSubIframe: React.FC<ISumSubIframe> = (props) => {
  const {kyc, kyb, onFinish, children} = props
  const [accessToken, setToken] = useState<string>()

  const sumSubBackend = process.env.SUMSUB_BACKEND ? process.env.SUMSUB_BACKEND : `https://${process.env.BACKEND_URL}`

  const onSumSubMessage = (message, data) => {
    console.log('onMessage', message, data)
    //console.log('data?.reviewResult?.reviewStatus', data?.reviewStatus)
    if (message == 'idCheck.applicantReviewComplete' || message == 'idCheck.applicantStatus' && data?.reviewStatus =='completed') {
      onFinish(false)
      setTimeout(() => {
        onFinish(true)
        setToken(null)
        window.scrollTo(0,0)
      }, 5000)
    }
  }

  const getToken = async () => {
    const call = kyc ? 'getToken' : 'getTokenKYB'
    const id = kyc ? kyc : kyb
    return await axios.post(`${sumSubBackend}/skyc/${call}`, {userId: id}).then(
      (res) => {
        if (res?.data?.token && res?.data?.userId) {
          if (res.data.userId == id) {
            setToken(res.data.token)
            return res.data.token
          }
        }
      })
      .catch((e) => console.error(e))
  }

  const expirationHandler = () => Promise.resolve(getToken())

  useEffect(() => {
    if (kyc || kyb) {
      if (!accessToken) {
        getToken()
      }
    }
  },[kyc, kyb])

  if (kyc || kyb) {
    if (accessToken) {
      return (
        <div className="subsub">
          <div className="container sumsub__header">
            <Button className="" onClick={() => window.location.reload()}>Return</Button>
          </div>
          <SumsubWebSdk
            accessToken={accessToken}
            expirationHandler={expirationHandler}
            config={{
              uiConf: {
                scrollIntoView: false
              }
            }}
            //options={options}
            onMessage={onSumSubMessage}
            onError={(e) => {console.log('onError', e)}}
          />
        </div>
      )
    } else {
      return <LoaderView ring />
    }
  }

  return children
}


export default SumSubIframe