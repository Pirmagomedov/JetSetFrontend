import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Form, Formik } from 'formik'
import { useDispatch } from 'react-redux'
import { useHistory, useLocation, withRouter } from 'react-router-dom'
import Modal from 'src/components/Modal/Modal'
import Avatar from 'src/components/Avatar/Avatar'
import CabinetNav from 'src/components/CabinetNav/CabinetNav'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import Icon from 'src/components/Icon/Icon'
import LoaderView from 'src/components/LoaderView/LoaderView'
import ProductItem from 'src/components/ProductItem/ProductItem'
import KycKybBlocker from 'src/components/KycKybBlocker/KycKybBlocker'
import { setNotification } from 'src/reducers/notificationReducer'
import {
    AdCard,
    AppDealStatusChoices,
    useMyAds,
    useMyFavorites,
    useDeleteAd,
    useMyDeals,
} from 'src/generated/graphql'
import Layout from 'src/hoc/Layout'
import { KycKybState } from 'src/helper'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch, RootState } from 'src/store'
import { AdStatus, Options, ProductStatus } from 'src/types'
import {
    useCurrentWorkspace,
    useProfile,
    useWorkspaceKycKybPassed,
} from 'src/hooks'
import './Inventory.scss'
import '../Product/Product.scss'

interface ISortValues {
    status: number
    date: boolean
}

type AdsOptions = {
    newFirst: boolean
    status?: number
    isLoadMore: boolean
    resetOffset: boolean
}

const initialOptions: AdsOptions = {
    newFirst: true,
    status: 0,
    isLoadMore: false,
    resetOffset: true,
}

const initialSortValues: ISortValues = { status: 0, date: true }

const statusOptions: Options = [
    { label: 'All', value: 0 },
    { label: 'Draft', value: AdStatus.DRAFT },
    { label: 'Moderation', value: AdStatus.MODERATION },
    { label: 'Awaits tokenization', value: AdStatus.AWAITS_TOKENIZATION },
    { label: 'Unpublished', value: AdStatus.TOKENIZED },
    { label: 'Published', value: AdStatus.PUBLISHED },
]

const dateOptions: Options = [
    { label: 'New at first', value: true },
    { label: 'Old at first', value: false },
]

const useInterval = (callback, delay) => {
    const savedCallback = useRef<any>()

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {
        function tick() {
            savedCallback.current()
        }
        if (delay !== null) {
            let id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}

const Inventory: React.FC = () => {
    const [idToDelete, setIdToDelete] = useState<number>(null)
    const [jets, setJets] = useState<AdCard[]>(null)
    const [favorites, setFavorites] = useState<AdCard[]>([])
    const [first, setFirst] = useState<number>(8)
    const [offset, setOffset] = useState<number>(0)
    const [hasNextPage, setHasNextPage] = useState<boolean>()
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const router = useHistory()
    const path = useLocation()
    const [isJets, setIsJets] = useState<boolean>()
    const [isFavorites, setIsFavorites] = useState<boolean>()
    const dispatch: AppDispatch = useDispatch()
    const profile = useProfile()
    const [, getAds] = useMyAds()
    const [, myFavorites] = useMyFavorites()
    const [, deleteAd] = useDeleteAd()
    const [, myDeals] = useMyDeals()
    const currentWorkspace = useCurrentWorkspace()
    const getAccess = useWorkspaceKycKybPassed()
    const [hasAccess, setHasAccess] = useState<KycKybState>(null)
    const [demo, setDemo] = useState<boolean>(false)

    const handleDemo = () => {
        setDemo(true)
    }

    const deleteDraft = async () => {
        setIsModalOpen(false)
        deleteAd({ adId: idToDelete }).then((res) => location.reload())
    }

    useEffect(() => {
        setIsJets(path.pathname === '/inventory')
        setIsFavorites(path.pathname === '/favorites')
    }, [path])

    useEffect(() => {
        updateAds(initialOptions)
        setFirst(8)
    }, [isJets])

    const updateAds = (options: AdsOptions, reload: boolean = true) => {
        if (reload) dispatch(setCommonLoader(true))
        if (isJets) {
            getMyAds(options, reload)
            setOffset(0)
        } else {
            getMyFavorites(options)
            setOffset(0)
        }
    }

    useEffect(() => {
        updateAds(initialOptions)
        getAccess().then((hasAccess) => setHasAccess(hasAccess))
    }, [currentWorkspace?.id])

    useInterval(() => {
        getMyAds(initialOptions, false)
    }, 10000)

    const getMyAds = (options: AdsOptions, reload: boolean = true) => {
        const soldAds: AdCard[] = []
        setLoading(true)
        if (reload) dispatch(setCommonLoader(true))
        getAds({
            first,
            offset: options.resetOffset ? 0 : offset,
            status: options.status ? options.status : null,
            newFirst: options.newFirst,
        })
            .then((res) => {
                const response = res.data.myAds
                const runtimeError = response.runtimeError
                if (runtimeError) {
                    console.error(
                        `[${runtimeError.exception}]: ${runtimeError.message}`,
                    )
                    return false
                }

                const ads: AdCard[] = []
                response.ads.edges.forEach((el) => {
                    ads.push(el.node)
                })
                if (options.isLoadMore) {
                    setJets((prev) => [...prev, ...ads])
                } else {
                    setJets([...ads])
                }
                setHasNextPage(response.ads.pageInfo.hasNextPage)
                setOffset((prev) => prev + first)
            })
            .catch((err) => console.error(err))
            .finally(() => {
                dispatch(setCommonLoader(false))
                setLoading(false)
            })
    }

    const getMyFavorites = (options: AdsOptions) => {
        setLoading(true)
        dispatch(setCommonLoader(true))
        return myFavorites({
            first,
            offset: options.resetOffset ? 0 : offset,
            status: options.status ? options.status : null,
            newFirst: options.newFirst,
        })
            .then((res) => {
                const response = res.data.myFavorites
                const runtimeError = response.runtimeError
                if (runtimeError) {
                    console.error(
                        `[${runtimeError.exception}]: ${runtimeError.message}`,
                    )
                    return false
                }
                const ads: AdCard[] = response.favorites.edges.map(
                    (el) => el.node,
                )
                if (options.isLoadMore) {
                    setFavorites((prev) => [...prev, ...ads])
                } else {
                    setFavorites(ads)
                }
                setHasNextPage(response.favorites.pageInfo.hasNextPage)
                setOffset((prev) => prev + first)
            })
            .catch((err) => console.error(err))
            .finally(() => {
                dispatch(setCommonLoader(false))
                setLoading(false)
            })
    }

    const renderProducts = (products: AdCard[]): ReactNode => {
        return products
            ? products.length
                ? products.map(
                    (el) =>
                        el && (
                            <ProductItem
                                inventory={true}
                                pathname={path.pathname}
                                key={el.id}
                                ad={el}
                                reRenderFavorites={reRenderFavorites}
                                workspaceId={currentWorkspace?.id}
                            />
                        ),
                )
                : <ProductItem
                    inventory={true}
                    pathname={path.pathname}
                    workspaceId={currentWorkspace?.id}
                    triggerDemo={handleDemo}
                />
            : null
    }

    const reRenderFavorites = async () => {
        dispatch(setCommonLoader(true))
        await getMyFavorites(initialOptions)
        //dispatch(setCommonLoader(false))
    }

    const handleSort = (values: ISortValues) => {
        updateAds({
            newFirst: values.date,
            status: values.status,
            isLoadMore: false,
            resetOffset: true,
        })
    }

    const renderFilter = (
        <Formik
            initialValues={initialSortValues}
            onSubmit={handleSort}
        >
            {({ handleSubmit }) => (
                <Form className="profile-header__sort">
                    <div
                        className="profile-header__select-wrapper select-wrapper"
                        style={{ width: '15em' }}
                    >
                        <FormikSelect
                            name="status"
                            options={statusOptions}
                            className="profile-header__select select-text"
                            label="Status: "
                            changeHandler={() => handleSubmit()}
                        />
                    </div>
                    {/*<div className="profile-header__select-wrapper select-wrapper">
            <FormikSelect
              name="date"
              options={dateOptions}
              className="profile-header__select select-text"
              label="Date added: "
              changeHandler={() => handleSubmit()}
            />
          </div>*/}
                </Form>
            )}
        </Formik>
    )

    const handleAddClick = () => {
        setDemo(false)
        if (currentWorkspace) {
            router.push('/create-ad')
        } else {
            router.push('/profile')
        }
    }

    const handleOpenDemo = () => {
        setDemo(true)
    }

    return (
        <Layout>
            <CabinetNav page="inventory" />
            <div className="profile-header">
                <div className="profile-header__inner">
                    <div className="profile-header__section">
                        {/* <div className="profile-header__tabs hidden">
                            <div
                                className={`profile-header__tab ${
                                    isJets ? 'profile-header__tab--active' : ''
                                }`}
                                onClick={() => router.push('/inventory')}
                            >
                                My jets
                            </div>
                            <div
                                className={`profile-header__tab ${
                                    isJets ? '' : 'profile-header__tab--active'
                                }`}
                                onClick={() => router.push('/favorites')}
                            >
                                My favorites
                            </div>
                        </div> */}
                        {/* <div className="profile-header__filter hidden">
                            {isJets ? renderFilter : null}
                            {isFavorites ? renderFilter : null}
                        </div> */}
                    </div>
                    {
                        jets && jets.length == 0 &&
                        <div className="demo-message">
                            Your aircraft will be displayed on this page. Create your first listing!
                        </div>
                    }
                    <div className="profile-header__products">
                        {isJets ? (
                            <div
                                className="product-add"
                                onClick={currentWorkspace ? handleAddClick : handleOpenDemo}
                            >
                                <Icon
                                    className="product-add__icon"
                                    name="add"
                                />
                            </div>
                        ) : null}
                        {/*<KycKybBlocker wsOnly>*/}
                        <>
                            {isJets
                                ? renderProducts(jets)
                                : renderProducts(favorites)}
                        </>
                        {/*</KycKybBlocker>*/}
                    </div>
                    {hasNextPage ? (
                        <div className="last-added__more">
                            {!isLoading ? (
                                <Icon
                                    name="load-more"
                                    onClick={() =>
                                        getMyAds({
                                            ...initialOptions,
                                            isLoadMore: true,
                                            resetOffset: false,
                                        })
                                    }
                                />
                            ) : (
                                <LoaderView ring />
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
            <Modal
                title="Do you really want to delete this draft?"
                className="modal verification-passed"
                modalIsOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                isCloseIcon={false}
                buttons={[
                    {
                        title: 'Cancel',
                        onClick: () => setIsModalOpen(!isModalOpen),
                        type: 'secondary'
                    },
                    { title: 'Delete', onClick: deleteDraft },
                ]}
            />
            <Modal
                title="This is demo aircraft"
                className="modal demo-mode"
                modalIsOpen={demo}
                onRequestClose={() => setDemo(false)}
                isCloseIcon={false}
                buttons={[
                    {
                        title: 'Got it',
                        onClick: () => setDemo(false),
                        type: 'secondary'
                    },
                    { title: currentWorkspace ? 'Create ad' : 'To workspaces', onClick: handleAddClick },
                ]}
            >
                {
                    currentWorkspace
                        ? 'You can create your first ad, or visit marketplace and buy aircraft of your dream'
                        : 'You need to create a workspace and/or undergo the compliance check'
                }
            </Modal>

        </Layout>
    )
}

export default withRouter(Inventory)
