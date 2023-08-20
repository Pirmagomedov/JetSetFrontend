import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import CabinetNav from 'src/components/CabinetNav/CabinetNav'
//import DealCard from 'src/components/DealCard/DealCard'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import Icon from 'src/components/Icon/Icon'
import LoaderView from 'src/components/LoaderView/LoaderView'
import KycKybBlocker from 'src/components/KycKybBlocker/KycKybBlocker'
import {
    Deal,
    useMyDeals,
    useRejectDeal,
    AppDealStatusChoices,
    useCancelNegotiation,
} from 'src/generated/graphql'
import Layout from 'src/hoc/Layout'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch, RootState } from 'src/store'
import { Options } from 'src/types'
import { useCurrentWorkspace } from 'src/hooks'
import ActiveDeal from './views/ActiveDeal/ActiveDeal'
import DemoDeal from './views/ActiveDeal/DemoDeal'
import Modal from 'src/components/Modal/Modal'
import './Deals.scss'

interface IDealsOptions {
    first: number
    offset: number
    newFirst: boolean
    isActive?: boolean
}

const dateOptions: Options = [
    { label: 'New at first', value: true },
    { label: 'Old at first', value: false },
]

const Deals: React.FC = (props) => {
    const [isLoading, setLoading] = useState<boolean>(true)
    const [first, setFirst] = useState<number>(100)
    const [offsetActive, setOffsetActive] = useState<number>(0)
    const [offsetCompleted, setOffsetCompleted] = useState<number>(0)
    const [hasNextActivePage, setHasNextActivePage] = useState<boolean>()
    const [hasNextCompletedPage, setHasNextCompletedPage] = useState<boolean>()
    const [rejectModalOpen, setRejectModalOpen] = useState<string>(null)
    const [negotiationModalOpen, setNegotiationModalOpen] = useState<string>(null)
    const [activeDeals, setActiveDeals] = useState<Deal[]>()
    const [completedDeals, setCompletedDeals] = useState<Deal[]>(null)
    const [showCompleted, setShowCompleted] = useState<boolean>(false)
    const dispatch: AppDispatch = useDispatch()
    const currentWorkspace = useCurrentWorkspace()
    const [, myDeals] = useMyDeals()
    const [, rejectDeal] = useRejectDeal()
    const [, cancelNegotiation] = useCancelNegotiation()

    useEffect(() => {
        dispatch(setCommonLoader(true))
        setOffsetActive(0)
        setOffsetCompleted(0)
        setActiveDeals(null)
        setCompletedDeals(null)
        getDeals({ first, offset: 0, isActive: true, newFirst: true }, false)
        //getDeals({ first, offset: 0, isActive: false, newFirst: true }, false)
    }, [currentWorkspace?.id])

    const handleLoadCompleted = () => {
        getDeals({ first, offset: 0, isActive: false, newFirst: true }, false)
    }

    const toggleCompleted = () => {
        if (showCompleted) {
            setShowCompleted(false)
        } else {
            setShowCompleted(true)
            getDeals(
                { first, offset: 0, isActive: false, newFirst: true },
                false,
            )
        }
    }

    useEffect(() => {
        if (completedDeals?.length || activeDeals?.length) {
            dispatch(setCommonLoader(false))
        }
    }, [completedDeals?.length, activeDeals?.length])

    const getDeals = (opts: IDealsOptions, isLoadMore?: boolean) => {
        setLoading(true)
        dispatch(setCommonLoader(true))
        myDeals(opts)
            .then((res) => {
                const response = res?.data?.myDeals
                const runtimeError = response?.runtimeError

                if (runtimeError) {
                    console.error(
                        `[${runtimeError?.exception}]: ${runtimeError?.message}`,
                    )
                    return false
                }
                if (response?.deals) {
                    const { hasNextPage } = response?.deals?.pageInfo
                    const deals: Deal[] = response?.deals?.edges
                        .filter((el) => {
                            if (el?.node) {
                                return true
                            } else {
                                console.error('Broken deal entity', el)
                                return false
                            }
                        })
                        .map((el) => el?.node)

                    //const tmpActive: Deal[] = []
                    //const tmpClosed: Deal[] = []

                    /*deals.forEach(d => {
            console.log('AppDealStatusChoices', d.status)
            if (d.status == AppDealStatusChoices.DC || d.status == AppDealStatusChoices.DR) {
              tmpClosed.push(d)
            } else {
              tmpActive.push(d)
            }
          }) 
          setActiveDeals(tmpActive)
          if (tmpClosed.length)
          setCompletedDeals(tmpClosed)*/

                    if (opts?.isActive) {
                        if (isLoadMore) {
                            setActiveDeals((prev) => [...prev, ...deals])
                        } else {
                            setActiveDeals(deals)
                        }
                        setOffsetActive((prev) => prev + first)
                        setHasNextActivePage(hasNextPage)
                    } else {
                        if (isLoadMore) {
                            setCompletedDeals((prev) => [...prev, ...deals])
                        } else {
                            setCompletedDeals(deals)
                        }
                        setOffsetCompleted((prev) => prev + first)
                        setHasNextCompletedPage(hasNextPage)
                    }
                }
            })
            .catch((err) => console.error(err))
            .finally(() => {
                setLoading(false)
                dispatch(setCommonLoader(false))
            })
    }

    const handleRejectDeal = (action: boolean) => {
        if (action) {
            rejectDeal({ dealId: rejectModalOpen }).then((res) => {
                console.debug('rejectDeal', res)
            })
        }
        setRejectModalOpen(null)
    }

    const handleCancelNegotiation = (action: boolean) => {
        if (action) {
            cancelNegotiation({ dealId: negotiationModalOpen })
                .then((res) => {
                    getDeals({ first, offset: 0, isActive: true, newFirst: true }, false)
                })
        }
        setNegotiationModalOpen(null)
    }

    return (
        <Layout>
            <CabinetNav page="deals" />

            <div className="deals">
                {
                    /*!isLoading && !activeDeals?.length && !completedDeals?.length 
                    ?   <>
                            <div className="demo-message">
                                The deals dashboards will appear in this page once you enter into a sale or purchase transaction.
                                <br />
                                The dashboards will enable you to manage your transactions and gain access to documents and actions.
                            </div>
                            <DemoDeal />
                        </>
                    : */  <div className="deals__inner">
                        <div className="deals__section">
                            <div className="deals__heading">
                                <h2 className="deals__title">Active deals</h2>

                                <Formik
                                    initialValues={{ newFirst: true }}
                                    onSubmit={(values) =>
                                        getDeals({
                                            first,
                                            offset: 0,
                                            isActive: true,
                                            newFirst: values.newFirst,
                                        })
                                    }
                                >
                                    {({ handleSubmit }) => (
                                        <Form className="deals__sorting-form hidden">
                                            <div className="select-wrapper">
                                                <FormikSelect
                                                    name="newFirst"
                                                    options={dateOptions}
                                                    className="deals__sort select-text"
                                                    label="Date added: "
                                                    changeHandler={() =>
                                                        handleSubmit()
                                                    }
                                                />
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>

                            <div className="deals__cards">
                                {activeDeals?.length ? (
                                    activeDeals.map((el, i) => (
                                        <ActiveDeal
                                            key={el.id}
                                            deal={el}
                                            onReject={(dealId) =>
                                                setRejectModalOpen(dealId)
                                            }
                                            onCancelNegotiation={(dealId) => {
                                                setNegotiationModalOpen(dealId)
                                            }}
                                        />
                                    ))
                                ) : isLoading ? (
                                    <div className="center-content">
                                        <LoaderView ring />
                                    </div>
                                ) : (
                                    null
                                )}
                            </div>
                        </div>
                        {hasNextActivePage ? (
                            <div className="deals__footer">
                                <div className="deals__btn">
                                    {!isLoading ? (
                                        <Icon
                                            name="load-more"
                                            onClick={() =>
                                                getDeals(
                                                    {
                                                        first,
                                                        offset: offsetActive,
                                                        isActive: false,
                                                        newFirst: true,
                                                    },
                                                    true,
                                                )
                                            }
                                        />
                                    ) : (
                                        <LoaderView ring />
                                    )}
                                </div>
                            </div>
                        ) : null}


                        <div className="deals__section">
                            <div className="deals__heading">
                                <h2
                                    className={`deals__title ${showCompleted ? 'expand' : 'collapse'}`}
                                    onClick={toggleCompleted}
                                >
                                    Completed deals <Icon name="i-expand" />
                                </h2>
                                <Formik
                                    initialValues={{ newFirst: true }}
                                    onSubmit={(values) =>
                                        getDeals({
                                            first,
                                            offset: 0,
                                            isActive: false,
                                            newFirst: values.newFirst,
                                        })
                                    }
                                >
                                    {({ handleSubmit }) => (
                                        <Form className="deals__sorting-form hidden">
                                            <div className="select-wrapper">
                                                <FormikSelect
                                                    name="newFirst"
                                                    options={dateOptions}
                                                    className="deals__sort select-text"
                                                    label="Date added: "
                                                    changeHandler={() =>
                                                        handleSubmit()
                                                    }
                                                />
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                            {showCompleted && (
                                <div className="deals__cards">
                                    {completedDeals?.length ? (
                                        completedDeals.map((el) => (
                                            <ActiveDeal
                                                key={el.id}
                                                deal={el}
                                            />
                                        ))
                                    ) : isLoading ? (
                                        <div className="center-content">
                                            <LoaderView ring />
                                        </div>
                                    ) : (
                                        <span
                                            className="loadMore-completed"
                                            style={{ textAlign: 'center' }}
                                            onClick={handleLoadCompleted}
                                        >
                                            {'No completed deals!'}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {hasNextCompletedPage ? (
                            <div className="deals__footer">
                                <div className="deals__btn">
                                    {!isLoading ? (
                                        <Icon
                                            name="load-more"
                                            onClick={() =>
                                                getDeals(
                                                    {
                                                        first,
                                                        offset: offsetCompleted,
                                                        isActive: false,
                                                        newFirst: true,
                                                    },
                                                    true,
                                                )
                                            }
                                        />
                                    ) : (
                                        <LoaderView ring />
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                }

                <Modal
                    title="Reject the deal"
                    modalIsOpen={rejectModalOpen !== null}
                    onRequestClose={() => handleRejectDeal(false)}
                    isCloseIcon={false}
                    buttons={[
                        {
                            title: 'Cancel',
                            onClick: () => handleRejectDeal(false),
                        },
                        {
                            title: 'Confirm',
                            onClick: () => handleRejectDeal(true),
                        },
                    ]}
                >
                    Are you sure you want to reject the deal?
                </Modal>
                <Modal
                    title="Cancel negotiations"
                    modalIsOpen={negotiationModalOpen !== null}
                    onRequestClose={() => handleCancelNegotiation(false)}
                    isCloseIcon={false}
                    buttons={[
                        {
                            title: 'Cancel',
                            onClick: () => handleCancelNegotiation(false),
                        },
                        {
                            title: 'Confirm',
                            onClick: () => handleCancelNegotiation(true),
                        },
                    ]}
                >
                    Are you sure you want to cancel negotiations?
                </Modal>
            </div>
        </Layout>
    )
}

export default Deals
