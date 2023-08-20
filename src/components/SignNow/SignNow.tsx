import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import {
    useSignNowCheckSignature,
    useCreateSignature,
    useCreateNft,
    useSignNowSignature,
    useSignNowSecondSignature,
    useTechnicalAcceptance,
    useClosing,
    useGetDealDocuments,
    DealDocuments,
    Permission,
    Deal,
} from 'src/generated/graphql'
import Text2Pdf from 'src/components/Text2Pdf/Text2Pdf'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { setProcessed } from 'src/reducers/eventReducer'
import { AppDispatch, RootState } from 'src/store'
import { useClient, useQuery } from 'urql'
import { setNotification } from 'src/reducers/notificationReducer'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
//import useWebSocket, { ReadyState } from 'react-use-websocket'
import LoaderView from 'src/components/LoaderView/LoaderView'
import { permSign } from 'src/helper'
import { 
    DealPermission,
    documentQueryList
} from 'src/types'


interface ISignNow {
    title: string
    dealId?: string
    permissions?: DealPermission
    adId?: string
    secondSignature?: boolean
    docType: string
    backTitle?: string
    parameters?: object
    onHelpModal: (bool: boolean) => void
    onSuccess: (data?: any) => void
    onBack?: () => void
}

interface VoidPromise {
    data: {
        void: boolean
    }
}

const SignNow: React.FC<ISignNow> = React.memo((props) => {
    const {
        permissions,
        title,
        dealId = '',
        adId = '',
        onHelpModal,
        docType,
        secondSignature = false,
        onSuccess,
        onBack,
        backTitle = 'Return to deals',
        parameters = {},
    } = props
    const queryData = documentQueryList[docType]

    const router = useHistory()

    const getQueryParams = () => {
        return { dealId, adId, ...parameters }
    }

    const [, checkSignNowSignature] = useSignNowCheckSignature()
    const [, createNft] = useCreateNft()
    const [documentId, setDocumentId] = useState<string>('')
    const [error, setError] = useState<string>(null)
    const [signNowLink, setSignNowLink] = useState<string>('')

    const dispatch: AppDispatch = useDispatch()
    //const client = useClient();
    const [documentResult, executeQuery] = useQuery({
        query: queryData.query,
        variables: getQueryParams(),
        requestPolicy: 'network-only',
    })
    const [, createSignature] = useCreateSignature()
    const [, signNowSignature] = useSignNowSignature()
    const [, signNowSecondSignature] = useSignNowSecondSignature()
    const [, technicalAcceptance] = useTechnicalAcceptance()
    const [, closingMutation] = useClosing()
    const [dealText, setDealText] = useState<string>('')
    const { isAuth, token, profile } = useSelector(
        (state: RootState) => state.user,
    )
    const currentEvent = useSelector(
        (state: RootState) => state.events,
    )
    const host = process.env.BACKEND_URL
        ? process.env.BACKEND_URL
        : window.location.host

    const isDemo = !!process.env.SIGNNOW_DEMO

    /*const { sendMessage, lastMessage, readyState } = useWebSocket(
        `wss://${host}/ws/sign/${dealId}/?token=${token}`,
    )*/
    const [, getDealDocuments] = useGetDealDocuments()
    const [downloadLink, setDownloadLink] = useState<string>('')

    /*if (!permissions.sign) {
    console.log('dd', documentResult?.data?.[queryData.name])
    return (
      <>
        <div className="deal-no-access">You have no access to this deal</div>
        <div className="deal-document-text" __dang>{}</div>
      </>
    )
  }*/

    const signDocument = (documentText) => {
        if (secondSignature) {
            return signNowSecondSignature({ dealId: dealId, docType: docType })
        }
        return signNowSignature({
            dealId: dealId == '' ? null : dealId,
            adId: adId == '' ? null : adId,
            docType: docType,
            text: documentText,
        })
    }

  const afterSign = () => {
    if (!dealId) {
      return createNft({adId})
    } else {
      if (docType == 'TA' || docType === 'RL') {
        return technicalAcceptance({dealId})
      }
      if (docType == 'BS' || docType == 'DR' || docType == 'WA' || docType == 'CC' || docType == 'CF' )  {
        //return closingMutation({ dealId })
        return true
      }
      if (docType == 'AM') {
        return true
      }
      return createSignature({signature: 'signature', dealId})
    }
  }

    const checkIframeUrl = () => {
        /*try {
            const href = (
                document.getElementsByClassName(
                    'signNowIframe',
                )[0] as HTMLIFrameElement
            ).contentWindow.location.href
            if (href.match(/.*wingform.com/)) {
                approveSign()
            }
        } catch (e) {
            console.log('No URL access')
        }*/
    }

    useEffect(() => {
        if (!currentEvent.processed && currentEvent.type == 'document_signed') {
            approveSign()
        }
        /*const messageData = lastMessage?.data
        console.log('messageData', { messageData, lastMessage })
        if (messageData) {
            const reply = JSON.parse(messageData)
            console.log('reply', reply)
            if (
                reply?.status == 'success' &&
                reply?.type == 'document_signed' &&
                reply?.payload?.user_id == profile.id
            ) {
                approveSign()
            }
        }*/
    }, [currentEvent.processed, currentEvent.id])

    const dealDocumentLink = (deal: DealDocuments) => {
        if (deal.documents) {
            return deal.documents.filter((d) => d.docType == docType)
        }
        return []
    }

    const reloadDeal = () => {
        if (dealId) {
            getDealDocuments({ dealId: dealId })
                .then((res) => {
                    const response = res?.data?.getDeal
                    const runtimeError = response.runtimeError
                    if (runtimeError) {
                        console.error(
                            `[${runtimeError.exception}]: ${runtimeError.message}`,
                        )
                        return false
                    }
                    if (response) {
                        const docs = dealDocumentLink(response.deal)
                        if (docs.length) {
                            setDownloadLink(
                                /*docs[0].link*/ `/docTemplate/${docs[0].docType}`,
                            )
                        }
                    }
                })
                .catch((error) => console.error(error))
        }
    }

    useEffect(() => {
        if (queryData.name && documentResult?.data?.[queryData.name]) {
            dispatch(setCommonLoader(false))
            if (queryData.name) {
                const doc = documentResult?.data?.[queryData.name]
                if (doc?.text && doc.text !== '') {
                    setDealText(doc.text.replace(/{{[^}]*}}/g,''))
                    if (permissions.sign) {
                        signDocument(doc.text).then((res) => {
                            const response =
                                res.data[
                                    secondSignature
                                        ? 'signNowSecondSignature'
                                        : 'signNowSignature'
                                ]
                            const runtimeError = response.runtimeError
                            if (runtimeError) {
                                setError(
                                    `[${runtimeError.exception}]: ${runtimeError.message}`,
                                )
                                console.error(
                                    `[${runtimeError.exception}]: ${runtimeError.message}`,
                                )
                                return false
                            }
                            if (response) {
                                const linkUrl = isDemo ? response.link.replace(/^(https?):\/\/[^\/]*\//g,`${window.location.protocol}//${window.location.host}/`) : response.link
                                setSignNowLink(linkUrl)
                                setDocumentId(`${response.documentId}`)
                                dispatch(setCommonLoader(false))
                                reloadDeal()
                            }
                        })
                    } else {
                        dispatch(setCommonLoader(false))
                    }
                } else {
                    setError('Document preparing error')
                }
            }
        }
    }, [documentResult.data])

    /*useEffect(() => {
    dispatch(setCommonLoader(false))
    if (queryData.name) {
      //const loadData = client.query(queryData.query, getQueryParams()).toPromise()
      //const loadData = client.query({query:queryData.query, fetchPolicy: 'network-only'}, getQueryParams()).toPromise()
      loadData.then(res => {
        const doc = res?.data[queryData.name]
        
        if (doc?.text && doc.text !== '') {
          signDocument(doc.text).then(
            res => {
              const response = res.data[secondSignature ? 'signNowSecondSignature' : 'signNowSignature']
              const runtimeError = response.runtimeError
              if (runtimeError) {
                setError(`[${runtimeError.exception}]: ${runtimeError.message}`)
                console.error(`[${runtimeError.exception}]: ${runtimeError.message}`)
                return false
              }
              if (response) {
                setSignNowLink(`${response.link}`)
                setDocumentId(`${response.documentId}`)
                dispatch(setCommonLoader(false))
                reloadDeal()
              }
            }
          )
        } else {
          setError('Document preparing error')
        }
      })
    } else {
      setError('There is no document to sign')
    }
  }, [])*/

    const approveSign = () => {
        dispatch(setCommonLoader(true))
        dispatch(setProcessed())
        checkSignNowSignature({ documentId }).then((res) => {
            if (res.data.signNowCheckSignature.success) {
                const afterSignPromise = afterSign()
                if (afterSignPromise === true) {
                    onSuccess(res.data.signNowCheckSignature)
                } else {
                    afterSignPromise
                        .then((res) => {
                            const resKeys = Object.keys(res?.data)
                            for (var i = 0; i < resKeys.length; i++) {
                                if (resKeys[i] !== 'errors') {
                                    const response = res?.data?.[resKeys[i]]
                                    const runtimeError = response?.runtimeError
                                    if (runtimeError) {
                                        dispatch(setCommonLoader(false))
                                        setError(
                                            `[${runtimeError.exception}]: ${runtimeError.message}`,
                                        )
                                        console.error(
                                            `[${runtimeError.exception}]: ${runtimeError.message}`,
                                        )
                                        return false
                                    }

                                    if (response.success === true) {
                                        onSuccess(response)
                                    }
                                } else {
                                    dispatch(setCommonLoader(false))
                                    //render errors?
                                }
                            }
                        })
                        .catch((error) => console.error(error))
                    //.finally(() => dispatch(setCommonLoader(false)))
                }
            } else {
                dispatch(setCommonLoader(false))
                dispatch(
                    setNotification({
                        title: 'You need to sign document!',
                        isPositive: false,
                    }),
                )
            }
        })
    }


    return (
        <DealProcessLayout 
          noAccess={!permissions.sign}
          title={title}
          links={[
            {title: "Help", onClick: () => onHelpModal(true)},
            //{title: "Download document", onClick: () => window.open(downloadLink,'_blank'), display: downloadLink !== ''}
            <Text2Pdf fileName={title} text={dealText} >Download</Text2Pdf>
          ]}
          leftButtons={[{title: backTitle, onClick: () => {/*router.push('/deals');*/ dispatch(setCommonLoader(true)); onBack();}}]}
          rightButtons={[
            {title: "Next", onClick: approveSign, disabled: !permissions.sign/*, display: !readyState*/},
          ]}
        >
          {
            permissions.sign ?
              error ?
                <div className="error">
                  <h2>Signing process error</h2>
                  <div>{error}</div>
                </div>
              :
                <div className="signNowWrapper">
                  <div className="signNowWrapper__loader">
                    <LoaderView bigRing />
                  </div>
                  <iframe src={signNowLink} className="signNowIframe" onLoad={checkIframeUrl} />
                </div>
            :
                <div className="signNow__noAccess">
                  {  
                  /*<div dangerouslySetInnerHTML={{__html: dealText}}></div>*/
                  }
                  Please ask the authorized executive to sign the document. You can 
                  &nbsp;<Text2Pdf fileName={title} text={dealText} >download</Text2Pdf>
                  &nbsp; the document to read it.
                  
                </div>
          }
        </DealProcessLayout>
    )
})

export default SignNow
