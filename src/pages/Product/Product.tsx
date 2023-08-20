import Modal from 'src/components/Modal/Modal'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams, useLocation, Link } from 'react-router-dom'
import Button from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import MediaQuery from 'react-responsive'
import {
    AdFull,
    DealDocuments,
    ProfileType,
    useAddComparison,
    useAddFavorite,
    useDeleteComparison,
    useDeleteFavorite,
    useGetAdFull,
    useCreateNft,
    useEditAd,
    useDeleteAd,
    useCreateDeal,
    AppDealStatusChoices,
} from 'src/generated/graphql'
import { useWorkspaceKycKybPassed } from 'src/hooks'
import Layout from 'src/hoc/Layout'
import LoaderView from 'src/components/LoaderView/LoaderView'
import { setConfirm } from 'src/reducers/confirmReducer'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { setNotification } from 'src/reducers/notificationReducer'
import { setProductNotice } from 'src/reducers/productNoticeReducer'
import { AppDispatch, RootState } from 'src/store'
import { AdStatus } from 'src/types'
import ProductGallery from './views/ProductGallery/ProductGallery'
import ProductInfoList from './views/ProductInfoList/ProductInfoList'
import ProductTabs from './views/ProductTabs/ProductTabs'
import ProductOwner from './views/ProductOwner/ProductOwner'
import ProductFeatures from './views/ProductFeatures/ProductFeatures'
import AdDescription from './views/AdDescription/AdDescription'
import PriceTag from 'src/components/PriceTag/PriceTag'
import AircraftDocuments from 'src/components/AircraftDocuments/AircraftDocuments'
import NFTView from 'src/components/NFTView/NFTView'
import KycKybBlocker from 'src/components/KycKybBlocker/KycKybBlocker'
import './Product.scss'
import { useChatButton } from 'src/hooks'
import {
    getProductTitle,
    permView,
    permEdit,
    permNone,
    permSign,
    responsibleWorkspaceId,
    getImageLink,
    getImageRatio,
    ImageStyles,
    KycKybState,
    getStateRelativeIndex
} from 'src/helper'
import { id } from 'date-fns/locale'

interface IVerificationPassedModal {
    modalIsOpen: boolean
    closeModal: () => void
    toggle: () => void
}

const Product: React.FC = () => {
    const [product, setProduct] = useState<AdFull>()
    const [status, setStatus] = useState<number>()
    const [currentSlide, setCurrentSlide] = useState<number>(0)
    // const [isComparison, setComparison] = useState<boolean>(false)
    // const [isFavorites, setFavorites] = useState<boolean>(false)
    const [isCreator, setCreator] = useState<boolean>(null)
    const [isEditor, setEditor] = useState<boolean>(false)
    const [isBuyer, setIsBuyer] = useState<boolean>(null)
    const [afterPreNegotiations, setAfterPreNegotiations] = useState<boolean>(false)
    const [isAuthor, setIsAuthor] = useState<boolean>(null)
    const location = useLocation()
    const [isPublicPreview, setIsPublicPreview] = useState<boolean>(location.pathname.match('public-preview') ? true : false)
    const [modalConfirmOpen, setModalConfirmOpen] = useState<boolean>()
    const [removeModalIsOpen, setRemoveModalIsOpen] = useState<boolean>()
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isAgreementModal, setIsAgreementModal] = useState<boolean>(false)
    const [hasAccess, setHasAccess] = useState<boolean>(false)
    const [activeDeal, setActiveDeal] = useState<DealDocuments>(null)
    const router = useHistory()
    const dispatch: AppDispatch = useDispatch()
    const [, createNft] = useCreateNft()
    // const [, addFavorite] = useAddFavorite()
    // const [, addComparison] = useAddComparison()
    // const [, deleteFavorite] = useDeleteFavorite()
    // const [, deleteComparison] = useDeleteComparison()
    const getKycKybState = useWorkspaceKycKybPassed()
    const [kycKybState, setKycKybState] = useState<KycKybState>(null)
    const [, getAd] = useGetAdFull()
    const [, editAd] = useEditAd()
    const { profile, isAuth } = useSelector((state: RootState) => state.user)
    const { id: adId } = useParams<{ id: string }>()
    const history = useHistory()
    const [, deleteAd] = useDeleteAd()
    const openChat = useChatButton()
    const [kycModal, setKycModal] = useState<boolean>(false)
    const productTitle = getProductTitle(product)
    const [, createDeal] = useCreateDeal()
    const responsibleId = responsibleWorkspaceId(
        profile?.currentWorkspace,
    )

    const handleChat = () => {
        openChat(profile.id, product?.owner?.user?.id, product)
    }

    const loadAd = () => {
        getAd({ adId: adId })
            .then((res) => {
                const response = res?.data?.getAd
                if (response) {
                    const runtimeError = response.runtimeError
                    let dealStatus = null
                    if (response?.ad?.deals?.length > 0) {
                        response.ad.deals.forEach((d) => {
                            console.log('CheckDeal', d?.status, d.seller.id, d.buyer.id, responsibleId)
                            if (
                                d?.status !== AppDealStatusChoices.DC &&
                                d?.status !== AppDealStatusChoices.DR &&
                                (
                                    d.seller.id == responsibleId ||
                                    d.buyer.id == responsibleId
                                )
                            ) {

                                setActiveDeal(d)
                            console.log('setAfterPreNegotiations', getStateRelativeIndex(d.status), getStateRelativeIndex(AppDealStatusChoices.TCA))
                                setAfterPreNegotiations(
                                    getStateRelativeIndex(d.status) 
                                    >
                                    getStateRelativeIndex(AppDealStatusChoices.TCA)
                                )
                                dealStatus = d?.status
                            }
                        })
                    } else {
                        setActiveDeal(null)
                    }

                    if (dealStatus == AppDealStatusChoices.DC) {
                        setStatus(AdStatus.SOLD)
                    }
                    if (runtimeError) {
                        console.error(
                            `[${runtimeError.message}]: ${runtimeError.message}`,
                        )
                        return false
                    }
                    setProduct(response.ad)
                    setStatus(response.ad.status)
                    // setFavorites(response.ad.lists.favorites)
                    // setComparison(response.ad.lists.comparison)
                }
            })
            .catch((error) => console.error(error))
            .finally(() => dispatch(setCommonLoader(false)))
    }

    useEffect(() => {
        dispatch(setCommonLoader(true))
        if (isAuth !== undefined) {
            loadAd()
        }
    }, [isAuth])

    useEffect(() => {
        getKycKybState().then((hasAccess) => setKycKybState(hasAccess))
        if (profile?.currentWorkspace?.id && product?.owner?.id) {
            const isAuthor =
                profile?.currentWorkspace?.id === product?.owner?.id
            const isSellerRep =
                responsibleId !== profile?.currentWorkspace?.id &&
                responsibleId === product?.owner?.id
            const adCreator =
                product?.realCreator?.id == profile?.currentWorkspace?.id
            const isCanCreateAd =
                profile?.currentWorkspace?.isCanCreateAd &&
                responsibleId === product?.owner?.id
            const isAdmin =
                profile?.currentWorkspace?.isAdmin &&
                responsibleId === product?.owner?.id
            const isBuyer = responsibleId === activeDeal?.buyer?.id
            const canSign = permSign(product.permission)
            const canView = permView(product.permission)
            const canEdit = permEdit(product.permission)
            console.log('flags', {
                adCreator,
                isSellerRep,
                isBuyer,
                isAuthor,
                canView,
                canEdit,
                canSign,
                isAdmin,
                isCanCreateAd
            })
            setCreator(
                isSellerRep ||
                isAuthor ||
                canView ||
                canEdit ||
                canSign ||
                isAdmin ||
                isCanCreateAd
            )
            setEditor(
                adCreator ||
                isAuthor ||
                canEdit ||
                canSign ||
                isAdmin /*|| isCanCreateAd*/
            )
            setIsBuyer(isBuyer)
            setIsAuthor(isAuthor)
            setHasAccess(
                (adCreator ||
                    isSellerRep ||
                    (isBuyer && afterPreNegotiations) ||
                    isAuthor ||
                    canView ||
                    canEdit ||
                    canSign ||
                    isAdmin ||
                    isCanCreateAd) && !isPublicPreview
            )
        }
    }, [profile?.currentWorkspace?.id, product, location.pathname])

    const checkAuth = (): boolean => {
        console.log('CheckAuth', isAuth)
        if (!isAuth) {
            dispatch(
                setNotification({
                    title: 'You need to login!',
                    /*onConfirm() {
                        router.push('/login')
                    },*/
                }),
            )
            return false
        }
        return true
    }

    // const handleFavorites = () => {
    //     setLoading(true)
    //     if (isFavorites) {
    //         deleteFavorite({ adId: adId })
    //             .then((res) => {
    //                 const response = res.data.deleteFavorite
    //                 const runtimeError = response.runtimeError
    //                 if (runtimeError) {
    //                     console.error(
    //                         `[${runtimeError.message}]: ${runtimeError.message}`,
    //                     )
    //                     return
    //                 }
    //                 setLoading(false)
    //                 setFavorites(false)
    //             })
    //             .catch((error) => console.error(error))
    //     } else {
    //         addFavorite({ adId: adId })
    //             .then((res) => {
    //                 const response = res.data.addFavorite
    //                 const runtimeError = response.runtimeError
    //                 if (runtimeError) {
    //                     console.error(
    //                         `[${runtimeError.message}]: ${runtimeError.message}`,
    //                     )
    //                     return
    //                 }
    //                 dispatch(
    //                     setProductNotice({
    //                         image: getImageLink(
    //                             product?.mainInformation?.images.map(
    //                                 (image) => image,
    //                             )[currentSlide],
    //                             ImageStyles.AD_VIEW,
    //                         ),
    //                         title: product?.mainInformation?.name,
    //                         text: product?.mainInformation?.category?.label,
    //                         btnText: 'To favorites',
    //                         onClick() {
    //                             router.push('/favorites')
    //                         },
    //                     }),
    //                 )
    //                 setLoading(false)
    //                 setFavorites(true)
    //             })
    //             .catch((error) => console.error(error))
    //     }
    // }

    // const handleComparison = () => {
    //     setLoading(true)
    //     if (isComparison) {
    //         deleteComparison({ adId: adId })
    //             .then((res) => {
    //                 const response = res.data.deleteComparison
    //                 const runtimeError = response.runtimeError
    //                 if (runtimeError) {
    //                     console.error(
    //                         `[${runtimeError.message}]: ${runtimeError.message}`,
    //                     )
    //                     return false
    //                 }
    //                 setLoading(false)
    //                 setComparison(false)
    //             })
    //             .catch((error) => console.error(error))
    //     } else {
    //         addComparison({ adId: adId })
    //             .then((res) => {
    //                 const response = res.data.addComparison
    //                 const runtimeError = response.runtimeError
    //                 if (runtimeError) {
    //                     console.error(
    //                         `[${runtimeError.message}]: ${runtimeError.message}`,
    //                     )
    //                     return false
    //                 }
    //                 dispatch(
    //                     setProductNotice({
    //                         image: getImageLink(
    //                             product?.mainInformation?.images.map(
    //                                 (image) => image,
    //                             )[currentSlide],
    //                             ImageStyles.AD_VIEW,
    //                         ),
    //                         title: product?.mainInformation?.name,
    //                         text: product?.mainInformation?.category?.label,
    //                         onClick() {
    //                             router.push('/compare')
    //                         },
    //                     }),
    //                 )

    //                 setComparison(true)
    //             })
    //             .catch((error) => console.error(error))
    //     }
    // }

    // const renderOptions = (withTitles = true): ReactElement => {
    //     const classFavorites = isFavorites ? 'product__option--active' : ''
    //     const classCompare = isComparison ? 'product__option--active' : ''

    //     return withTitles ? (
    //         <div className="product__options">
    //             {!isCreator && (
    //                 <button
    //                     className={`product__option ${classFavorites}`}
    //                     type="button"
    //                     onClick={handleFavorites}
    //                     disabled={isLoading}
    //                 >
    //                     <Icon
    //                         className="product__option-icon"
    //                         name="favorites"
    //                     />
    //                     <span className="product__option-text">
    //                         Add to Favorites
    //                     </span>
    //                 </button>
    //             )}
    //             <button
    //                 className={`product__option product__option--compare ${classCompare}`}
    //                 type="button"
    //                 onClick={handleComparison}
    //                 disabled={isLoading}
    //             >
    //                 <Icon
    //                     className="product__option-icon"
    //                     name="compare"
    //                 />
    //                 <span className="product__option-text">Add to Compare</span>
    //             </button>
    //             <button
    //                 className="product__option"
    //                 type="button"
    //                 disabled={isLoading}
    //             >
    //                 <Icon
    //                     className="product__option-icon"
    //                     name="shareNew"
    //                 />
    //                 <span className="product__option-text">Share</span>
    //             </button>
    //         </div>
    //     ) : (
    //         <div className="product__options">
    //             {!isCreator && (
    //                 <button
    //                     className={`product__option ${classFavorites}`}
    //                     type="button"
    //                     onClick={handleFavorites}
    //                     disabled={isLoading}
    //                 >
    //                     <Icon
    //                         className="product__option-icon"
    //                         name="favorites"
    //                     />
    //                 </button>
    //             )}

    //             <button
    //                 className="product__option"
    //                 type="button"
    //                 disabled={isLoading}
    //             >
    //                 <Icon
    //                     className="product__option-icon"
    //                     name="shareNew"
    //                 />
    //             </button>
    //         </div>
    //     )
    // }

    const mintToken = async () => {
        if (checkAuth()) {
            if (kycKybState == KycKybState.SUCCESS) {
                router.push(`/publicoffer/${adId}`)
            } else {
                dispatch(
                    setNotification({
                        title: 'You need to fill your profile first.',
                        icon: 'i-attantion',
                        isPositive: false,
                    }),
                )
            }
        }

    }

    const openAgreementModal = () => {
        setIsAgreementModal(true)
    }

    const handleCreateNft = () => {
        checkAuth()
        if (kycKybState == KycKybState.SUCCESS) {
            createNft({ adId }).then((res) => {
                //loadAd()
                history.push('/inventory')
            })
        } else {
            dispatch(
                setNotification({
                    title: 'Publish error',
                    text: 'You need to fill profile page',
                    isPositive: false,
                }),
            )
        }
    }

    const publish = async () => {
        checkAuth()
        if (kycKybState == KycKybState.SUCCESS) {
            dispatch(
                setNotification({
                    title: 'Your ad has been successfully placed',
                    text: 'Your ad is posted on the platform. Now you can receive offers from potential buyers.',
                    isPositive: true,
                }),
            )
            editAd({ status: '6', adId: adId }).then((res) => { })
            history.push('/inventory')
        } else {
            dispatch(
                setNotification({
                    title: 'Publish error',
                    text: 'You need to fill profile page',
                    isPositive: false,
                }),
            )
        }
    }

    const handleDeal = () => {
        if (checkAuth()) {
            if (kycKybState === KycKybState.SUCCESS) {
                createDeal({adId}).then(res => {
                    if (res?.data?.createDeal?.deal?.id) {
                        router.push(`/deal-process/${res.data.createDeal.deal.id}`)
                    }
                    console.log('createDeal', res)
                })
                //router.push(`/prepayment/${adId}`)
            } else {
                /*dispatch(
                    setNotification({
                        title: 'Reserve Error',
                        text: 'You need to fill profile page',
                        isPositive: false,
                    }),
                )*/
                setKycModal(true)
            }
        }
    }

    const removeBeforeMint = async () => {
        setRemoveModalIsOpen(false)
        deleteAd({ adId: product.id }).then((res) => history.push('/inventory'))
    }

    const handleRemove = async () => {
        setModalConfirmOpen(false)
        deleteAd({ adId: product.id }).then((res) => history.push('/inventory'))
    }

    const goToEditPage = () => {
        editAd({ status: '1', adId: adId }).then((res) =>
            router.push(`/create-ad/${adId}`),
        )
    }

    const goToPublicPreview = () => {
        setIsPublicPreview(true)
        router.push(`/product/${adId}/public-preview`)
    }

    const renderButtons = () => {
        if (!isPublicPreview && isCreator) {
            return (
                <div className="product__buttons">
                    <>
                        {product.status === AdStatus.DRAFT ? (
                            <Button
                                className="product__button"
                                onClick={() => router.push(`/create-ad/${adId}`)}
                            >
                                Edit
                            </Button>
                        ) : null}
                        {product.status === AdStatus.AWAITS_TOKENIZATION &&
                            isEditor ? (
                            <Button
                                className="product__button"
                                isLoading={isLoading}
                                disabled={isLoading}
                                onClick={handleCreateNft}
                            >
                                Publish
                            </Button>
                        ) : null}
                        {product.status === AdStatus.AWAITS_TOKENIZATION ?
                            (
                                <Button
                                    className='product__button'
                                    onClick={goToPublicPreview}
                                >
                                    Public Preview
                                </Button>
                            )
                            :
                            null
                        }
                        {product.status === AdStatus.AWAITS_TOKENIZATION ? (
                            <Button
                                className="product__button"
                                onClick={goToEditPage}
                            >
                                Edit
                            </Button>
                        ) : null}
                        {product.status === AdStatus.AWAITS_TOKENIZATION &&
                            isEditor ? (
                            <Button
                                className="product__button"
                                type="secondary"
                                onClick={() => setRemoveModalIsOpen(true)}
                            >
                                Delete
                            </Button>
                        ) : null}
                        {product.status === AdStatus.PUBLISHED &&
                            activeDeal === null &&
                            isEditor ? (
                            <Button
                                className="product__button"
                                isLoading={isLoading}
                                disabled={isLoading}
                                type="secondary"
                                onClick={() => setModalConfirmOpen(true)}
                            >
                                Unpublish
                            </Button>
                        ) : null}
                        {(product.status === AdStatus.PUBLISHED ||
                            product.status === AdStatus.IN_TRANSACTION ||
                            product.status === AdStatus.RESERVED) &&
                            activeDeal !== null ? (
                            <>
                                {/*<Button
                                    className="product__button"
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                    type="secondary"
                                    onClick={handleChat}
                                >
                                    Go to chat
                                </Button>*/}
                                <Button
                                    className="product__button"
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                    type="secondary"
                                    onClick={() => router.push('/deals')}
                                >
                                    Go to deal
                                </Button>
                            </>
                        ) : null}

                        {product.status === AdStatus.TOKENIZED && isEditor ? (
                            <Button
                                className="product__button"
                                isLoading={isLoading}
                                disabled={isLoading}
                                onClick={handleCreateNft}
                            >
                                Publish
                            </Button>
                        ) : null}
                        {product.status === AdStatus.TOKENIZED && isEditor ? (
                            <Button
                                className="product__button"
                                isLoading={isLoading}
                                disabled={isLoading}
                                type="secondary"
                                onClick={() => setModalConfirmOpen(true)}
                            >
                                Delete
                            </Button>
                        ) : null}
                        {product.status === AdStatus.ON_TOKENIZATION ? (
                            <Button
                                className="product__button"
                                isLoading={isLoading}
                                disabled={true}
                            >
                                On tokenization
                            </Button>
                        ) : null}
                    </>
                </div>
            )
        }
    }

    {/* Фотографии */ }
    const adGallery = (
        <ProductGallery
            ratio={getImageRatio(ImageStyles.AD_VIEW)}
            images={product?.mainInformation.images.sort((a, b) => a.order > b.order ? 1 : -1).map(
                (el) =>
                    getImageLink(
                        el,
                        ImageStyles.AD_VIEW,
                    ),
            )}
            title={productTitle}
        />
    )

    const adTabs = (
        <ProductTabs
            product={product}
            isBlurred={!hasAccess}
        />
    )

    const standartCondition = (
        product?.deliveryConditions?.standartCondition && product?.deliveryConditions?.additionalData !== ''
            ?
            <div className="product__standard-condition">
                <div className="product__sm-title">Standard conditions:</div>
                {product.deliveryConditions.additionalData}
            </div>
            :
            null
    )


    {/* Название модели самолета */ }
    const adTitle = (
        <div className="product__name">{productTitle}</div>
    )

    {/* Location */ }
    const adType = (
        <div className="product__type">
            {product?.aircraftLocation?.airport?.name && (
                <>
                    Location: {product?.aircraftLocation?.airport?.name},{' '}
                    {product?.aircraftLocation?.airport?.region},{' '}
                    {product?.aircraftLocation?.airport?.country}
                </>
            )}
        </div>
    )

    {/* Информация по самолету + цена и продавец */ }
    const adInfo = (
        // <div className="product__info">
        <ProductInfoList
            isBlurred={!hasAccess}
            // serialNumber={
            //     product?.aircraftSummary
            //         ?.serialNumber
            // }
            // registrationNumber={
            //     product?.aircraftSummary
            //         ?.registrationNumber
            // }
            year={product?.mainInformation?.year}
            totalSeats={
                product?.aircraftSummary?.totalSeats
            }
            ttsn={
                +product?.aircraftSummary
                    ?.airframeTtsn
            }
        />
        // </div>
    )

    // const adStatus = (
    //     status === AdStatus.SOLD ? null : renderOptions()
    // )

    const adPrice = (
        <PriceTag
            status={status}
            // vat={product?.termsOfPayment?.vat}
            amount={
                product?.termsOfPayment
                    ?.aircraftPrice
            }
            currency={
                product?.termsOfPayment
                    ?.currency?.label
            }
            icon={false}
            isBuyer={isBuyer}
        />
    )

    const adOwner = (
        <ProductOwner
            isBlurred={!hasAccess}
            workspace={product?.owner}
            isCreator={isAuthor}
        />
    )

    const adFeatures = (
        <ProductFeatures product={product} />
    )

    const renderNftInfo = () => {
        if (product?.nft?.tokenUrl) {
            return (

                <div className="product__nft-info">
                    <div className="product__sm-title">Token info:</div>
                    <NFTView nft={product?.nft} isPublicPreview={isPublicPreview} />
                    <a className="product__sm-link" href="/help/terms-of-aircraft-sales-transactions" target="_blank">
                        Learn about aircraft purchase procedure
                    </a>
                </div>
            )
        }
    }

    const adReserve = (
        <div className="product__reservation">
            <div>
                <div className="product__sm-title">Reservation deposit:</div>
                <PriceTag
                    amount={
                        (product?.termsOfPayment?.aircraftPrice *
                            product?.termsOfPayment?.depositPercent) /
                        100
                    }
                    currency={product?.termsOfPayment?.currency?.label}
                    icon={false}
                    isBuyer={isBuyer}
                />
            </div>
            {
                isPublicPreview ?
                    <>
                        <Button
                            className="product__button"
                            onClick={() => { }}
                        >
                            Start negotiations
                        </Button>
                    </>
                    :
                    !isCreator && product?.status === AdStatus.PUBLISHED &&
                    <>
                        {activeDeal !== null ? null : (
                            <Button
                                className="product__button"
                                onClick={handleDeal}
                            >
                                Start negotiations
                            </Button>
                        )}
                        <KycKybBlocker hide>
                            {product?.status === AdStatus.PUBLISHED &&
                                activeDeal !== null ? (
                                <Button
                                    className="product__button"
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                    type="secondary"
                                    onClick={() => router.push('/deals')}
                                >
                                    Go to deal
                                </Button>
                            ) : null}
                        </KycKybBlocker>
                    </>
            }
        </div>
    )

    const adNft = (
        status === AdStatus.SOLD
            ? null
            : renderNftInfo()
    )

    const adButton = (
        status === AdStatus.SOLD
            ? null
            : renderButtons
    )

    const adDocs = (
        status === AdStatus.SOLD ? null : (
            <div className="product__info-footer">
                <div className="product__docs">
                    <div className="product__sm-title">Aircraft Documents:</div>
                    <AircraftDocuments
                        ad={product}
                        disabled={
                            !(isCreator || (isBuyer && afterPreNegotiations))
                        }
                        showInfo={
                            status ===
                            AdStatus.DRAFT ||
                            status ===
                            AdStatus.AWAITS_TOKENIZATION
                        }
                    />
                </div>
            </div>
        )
    )

    const closePreview = () => {
        setIsPublicPreview(false)
        router.push(`/product/${product.id}`)
    }

    return (
        <Layout>
            <div className="product">
                {isPublicPreview &&
                    <div className='product__publicView'>
                        <h1>Public preview</h1>
                        <Button
                            type='blue'
                            onClick={closePreview}
                        >
                            Return
                        </Button>
                    </div>
                }
                {product ? (
                    <div className="product__inner">
                        <MediaQuery minWidth={1280}>
                            <div className="product__inner__left-container">
                                {adGallery}
                                <AdDescription product={product} />
                                {adTabs}
                                {standartCondition}
                            </div>
                            <div className="product__inner__right-container">
                                {adTitle}
                                {adType}
                                {adInfo}
                                {adPrice}
                                {adOwner}
                                {adReserve}
                                {adDocs}
                                {adNft}
                                {adButton()}
                            </div>
                        </MediaQuery>
                        <MediaQuery minWidth={320} maxWidth={1279}>
                            {adTitle}
                            {adGallery}
                            {adType}
                            {adInfo}
                            {adPrice}
                            <AdDescription product={product} />
                            {adOwner}
                            {adReserve}
                            {adButton()}
                            {adTabs}
                            {standartCondition}
                            {adDocs}
                            {adNft}
                        </MediaQuery>
                    </div>
                ) : (
                    <LoaderView ring />
                )}
            </div>

            <Modal
                isCloseIcon={false}
                modalIsOpen={isAgreementModal}
                onRequestClose={() => setIsAgreementModal(false)}
                buttons={[
                    {
                        title: 'Cancel',
                        type: 'secondary',
                        onClick: () => setIsAgreementModal(false),
                    },
                    { title: 'Agree', onClick: mintToken },
                ]}
            >
                <p className="modal__paragraph">
                    To list your aircraft on the marketplace, you need to sign
                    the Public Offer, affirming your willingness to engage in
                    discussions with potential buyers who will express their
                    interest through the platform. Prior to listing, a
                    distinctive token for your aircraft will be generated. This
                    token serves as an unchangeable record of all present and
                    future documents related to the aircraft and its
                    transactions on the blockchain. Deal smart contracts manage
                    the token to ensure the transaction's security. All
                    associated documents are securely encrypted
                </p>
            </Modal>
            <Modal
                title="Do you really want to delete this draft?"
                onRequestClose={() => setRemoveModalIsOpen(false)}
                modalIsOpen={removeModalIsOpen}
                buttons={[
                    {
                        title: 'Cancel',
                        type: 'secondary',
                        onClick: () => setRemoveModalIsOpen(false),
                    },
                    { title: 'Delete', onClick: removeBeforeMint },
                ]}
            />
            <Modal
                modalIsOpen={modalConfirmOpen}
                isCloseIcon={false}
                onRequestClose={() => setModalConfirmOpen(false)}
                buttons={[
                    {
                        title: 'Cancel',
                        type: 'secondary',
                        onClick: () => setModalConfirmOpen(false),
                    },
                    { title: 'Yes', onClick: handleRemove },
                ]}
            >
                <p className="modal__paragraph">
                    {product?.status === AdStatus.PUBLISHED
                        ? 'Are you sure you want to remove the listing from the marletplace?'
                        : 'Are you sure you want to delete the ad?'}
                </p>
            </Modal>
            <Modal
                modalIsOpen={kycModal}
                isCloseIcon={false}
                onRequestClose={() => setKycModal(false)}
                buttons={[
                    {
                        title: 'Got it',
                        type: 'secondary',
                        onClick: () => setKycModal(false),
                    },
                    {
                        title: 'To workspaces',
                        onClick: () => router.push('/profile')
                    },
                ]}
            >
                <p className="modal__paragraph">
                    To reserve the aircraft, you need to create a workspace and/or undergo the compliance check.
                </p>
            </Modal>

        </Layout >
    )
}

export default Product
