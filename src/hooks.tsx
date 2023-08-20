import { useState, useEffect } from 'react'
import { RootState, AppDispatch } from 'src/store'
import { useSelector, useDispatch } from 'react-redux'
import { useQuery, RequestPolicy } from 'urql'
import { documentQueryList } from 'src/types'
import {
    useText2Pdf,
    useWorkspaceKycKyb
} from 'src/generated/graphql'
import {
    getWorkspaceKycKybState,
    KycKybState,
    getImageLink,
    ImageStyles,
} from 'src/helper'
import { setProfile } from 'src/reducers/userReducer'
import {
    useSwitchWorkspace,
    ProfileFull,
    ProfileCard,
    AdMain,
} from 'src/generated/graphql'
import { setSimpleLoader } from 'src/reducers/loaderReducer'
import { chatsCreateRoom } from 'src/reducers/chatsReducer'

export const useCountryName = () => {
    const { choices } = useSelector((state: RootState) => state.choices)
    const countries = choices.countries

    const getCountry = (id: number): string | null => {
        if (countries?.length) {
            const country = countries.filter((c) => c.value === id)
            if (country?.length) {
                return country[0].label
            }
        }
        return '-'
    }

    return getCountry
}

export const useWorkspaceKycKybPassed = () => {
    const [, workspaceKycKyb] = useWorkspaceKycKyb()

    const getState = async () => {
        const res = await workspaceKycKyb()
        if (res?.data?.myProfile?.profile?.currentWorkspace) {
            return getWorkspaceKycKybState(
                res.data.myProfile.profile.currentWorkspace,
            )
        }
        return KycKybState.NONE
    }

    return getState
}


/*export const useWorkspaceKycKybPassed = () => {
    const currentWorkspace = useCurrentWorkspace()
    const profile = useProfile()
    return getWorkspaceKycKybState(currentWorkspace, profile)
}*/

export const useWorkspaceSwitcher = () => {
    const [, switchWorkspace] = useSwitchWorkspace()
    const dispatch: AppDispatch = useDispatch()

    const switchCallback = async (id: string) => {
        const res = await switchWorkspace({ workspaceId: id })
        if (res?.data?.switchWorkspace?.user) {
            const profileNew: ProfileFull = res?.data?.switchWorkspace?.user
            if (profileNew) {
                dispatch(setProfile(profileNew))
            }
            return profileNew
        }
        return null
    }

    return switchCallback
}

export const useChatButton = () => {
    const dispatch: AppDispatch = useDispatch()

    const openChat = (from: string, to: string, product: AdMain) => {
        const title =
            product?.mainInformation?.manufacturer?.label +
            ' ' +
            product?.mainInformation?.model?.label
        dispatch(
            chatsCreateRoom(from, to, title, {
                key: product.id,
                type: 'AD',
                title: title,
                image: product?.mainInformation?.images?.[0]
                    ? getImageLink(
                        product.mainInformation.images[0],
                        ImageStyles.AD_CHAT,
                    )
                    : null,
            }),
        )
    }

    return openChat
}

export const useProfile = () => {
    const profileStored = useSelector((state: RootState) => state.user.profile)
    return profileStored
}

export const useCurrentWorkspace = () => {
    const profileStored = useSelector((state: RootState) => state.user.profile)
    return profileStored.currentWorkspace
}

export const useChoices = () => {
    const { choices } = useSelector((state: RootState) => state.choices)
    return choices
}

export const useSimpleLoader = () => {
    const simpleLoader = useSelector(
        (state: RootState) => state.loader.simpleLoader,
    )
    const dispatch: AppDispatch = useDispatch()
    const setSimpleLoaderState = (loader: boolean) => {
        dispatch(setSimpleLoader(loader))
    }
    return { simpleLoader, setSimpleLoaderState }
}



export const useDocumentText = (docType: string, queryParams: any) => {
    const NetworkOnly: RequestPolicy = 'network-only'
    const queryName = documentQueryList[docType].name
    const queryData = {
        query: documentQueryList[docType].query,
        variables: queryParams,
        requestPolicy: NetworkOnly,
        pause: true
    }
    const [documentResult, executeQuery] = useQuery(queryData)

    const getDocument = () => {
        executeQuery()
    }

    return { text: documentResult?.data?.[queryName]?.text, getDocument }
}


export const useConvert2Pdf = () => {
    const [, text2Pdf] = useText2Pdf()
    const [converting, setConverting] = useState<boolean>(false)

    const downloadPdf = (text: string, fileName: string) => {
        setConverting(true)
        const filetered = text.replace(/{{[^}]*}}/g, '')
        text2Pdf({ text: filetered }).then(res => {
            if (res?.data?.convertTextToPdf?.fileBase64) {
                const windowUrl = window.URL || window.webkitURL
                const fileUrl = 'data:application/pdf;base64,' +
                    res.data.convertTextToPdf.fileBase64
                const anchorElement = document.createElement('a')
                document.body.appendChild(anchorElement)
                anchorElement.style.display = 'none'
                anchorElement.href = fileUrl
                anchorElement.download = fileName
                anchorElement.click()
                setConverting(false)
            } else {
                setConverting(false)
                console.error('Text to PDF conversion failed!')
            }
        })
    }

    return { converting, downloadPdf }
}


export const useDownloadDocument = (filename: string, docType: string, queryParams: any) => {
    const { converting, downloadPdf } = useConvert2Pdf()
    const { text, getDocument } = useDocumentText(docType, queryParams)

    useEffect(() => {

        if (text) {
            downloadPdf(text, filename)
        }
    }, [text])

    const downloadDocument = () => {
        getDocument()
    }

    return { loading: converting, downloadDocument }
}



export const useDownloadLink = (fileKey: string, fileBucket: string, fileName: string) => {
    const token = useSelector((state: RootState) => state.user.token)
    const host = process.env.BACKEND_URL
        ? process.env.BACKEND_URL
        : window.location.host
    const url = `https://${host}/api/files/${fileBucket}/${fileKey}`

    const [downloading, setDownloading] = useState<boolean>(false)

    const download = () => {
        setDownloading(true)
        fetch(
            url,
            {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token.replace('JWT', '') }
            }
        )
            .then((res) => res.blob())
            .then((blob) => {
                const windowUrl = window.URL || window.webkitURL
                const fileUrl = windowUrl.createObjectURL(blob)
                const anchorElement = document.createElement('a')
                document.body.appendChild(anchorElement)
                anchorElement.style.display = 'none'
                anchorElement.href = fileUrl
                anchorElement.download = fileName
                anchorElement.click()

                setDownloading(false)
                windowUrl.revokeObjectURL(fileUrl)
            })
    }

    return { downloading, download }
}