import { useHistory, useParams } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import MediaQuery from 'react-responsive'

import AircraftDocuments from 'src/components/AircraftDocuments/AircraftDocuments'
import Accordion from 'src/components/Accordion/Accordion'
import Button from 'src/components/Button/Button'
import ContentItem from './views/ContentItem/ContentItem'
import CardImage from 'src/components/CardImage/CardImage'
import DealHeader from './views/DealHeader/DealHeader'
import DealFlow from './views/DealFlow/DealFlow'
import LoaderView from 'src/components/LoaderView/LoaderView'
import Layout from 'src/hoc/Layout'
import ProductInfoList from '../Product/views/ProductInfoList/ProductInfoList'
import Party from './views/Party/Party'
import './DealOverview.scss'

import {
    useGetDealOverview,
    useGetAd,
    AppDealStatusChoices,
    DealOverviewData,
} from 'src/generated/graphql'
import {
    Ad,
    Deal
} from 'src/generated/graphql'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import {
    ImageStyles,
    getImageRatio,
    getImageLink,
    getProductTitle,
    getCalendarArray,
    formatDate,
    getStateRelativeIndex,
    responsibleWorkspaceId,
    getDealStateMessage,
    hasDealAccess,
} from 'src/helper'
import { useProfile } from 'src/hooks'

interface IValues {
    aircraftTitle: string
    buyer: any
    seller: any
    aircraftPrice: any
    aircraftPriceLabel: string
    deliveryLocation: string
    inspectionProgramLevel: string
    governingLaw: string
    fee: number
    commissionRule: string
    dateOfAgreement: any
    inspectionCompletionDate: string
    deliveryDate: string
    expectedClosingDate: string
    inspectionFacility: string
    inspectionStartDate: string
    inspectionResult: string
    images: any
    year?: number
    totalSeats?: number
    ttsn?: number
    dealAd: Ad
    currency: string
    ppiFacility: string
    ppiStartDate: string
    ppiCompletionDate: string
    ppiResult
}

const DealOverview: React.FC = (props) => {
    const [values, setValues] = useState<IValues>({
        aircraftTitle: "",
        buyer: "",
        seller: "",
        aircraftPrice: "",
        aircraftPriceLabel: "",
        deliveryLocation: "",
        inspectionProgramLevel: "",
        governingLaw: "",
        fee: 0,
        commissionRule: "",
        dateOfAgreement: "",
        inspectionCompletionDate: "",
        deliveryDate: "",
        expectedClosingDate: "",
        inspectionFacility: "",
        inspectionStartDate: "",
        inspectionResult: "",
        images: "",
        year: 0,
        totalSeats: 0,
        ttsn: 0,
        dealAd: null,
        currency: '',
        ppiFacility: '',
        ppiStartDate: '',
        ppiCompletionDate: '',
        ppiResult: '',
    })
    const [isLoading, setLoading] = useState<boolean>(true)
    const [deal, setDeal] = useState<DealOverviewData>()
    const [ad, setAd] = useState<Ad>()
    const { choices } = useSelector((state: RootState) => state.choices)
    const profile = useProfile()
    const [isSeller, setSeller] = useState<boolean>(null)
    const dealAccess = hasDealAccess(deal, isSeller)
    const [dealLoader, setDealLoader] = useState<boolean>(false)
    const dealStateMessageText = getDealStateMessage(deal, dealAccess, isSeller, dealLoader)
    const router = useHistory()
    const dealId = useParams<{ dealId: string }>()

    const [, getDeal] = useGetDealOverview()
    const [, getAd] = useGetAd()

    useEffect(() => {
        setLoading(true)
        getDeal(dealId)
            .then((response) => {
                console.log('response', response)
                const deal = response?.data?.getDeal?.deal
                setDeal(deal)
                return deal
            })
            .then((deal) => {
                setSeller(deal?.seller?.id == profile?.currentWorkspace?.id || responsibleWorkspaceId(profile?.currentWorkspace) == deal?.seller?.id)
                setValues({
                    aircraftTitle: getProductTitle(deal?.ad),
                    buyer: deal?.buyer,
                    seller: deal?.seller,
                    images: deal?.ad?.mainInformation?.images,
                    inspectionStartDate: deal?.contractedTermsAndCond?.buyerTerms?.inspectionDate,
                    inspectionFacility: deal?.contractedTermsAndCond?.buyerTerms?.inspectionConditions?.inspectionFacility,
                    inspectionResult: "",
                    dealAd: deal?.ad,
                    // Contracted terms
                    // Left side
                    aircraftPrice: deal?.contractedTermsAndCond?.buyerTerms?.termsOfPayment?.aircraftPrice,
                    aircraftPriceLabel: deal?.contractedTermsAndCond?.buyerTerms?.termsOfPayment?.currency?.label,

                    // deliveryLocation: 
                    deliveryLocation: (() => {
                        const [res,] =
                            choices?.airports?.filter(
                                (item) => {
                                    return item?.value === deal?.contractedTermsAndCond?.buyerTerms?.deliveryLocation
                                }
                            )
                        return res?.name
                    })(),
                    inspectionProgramLevel: choices?.inspectionProgramLevels[deal?.contractedTermsAndCond?.buyerTerms?.inspectionProgramLevel - 1]?.label,
                    governingLaw: choices?.governingLaws[deal?.contractedTermsAndCond?.buyerTerms?.governingLaw]?.label,
                    fee: deal?.contractedTermsAndCond?.buyerTerms?.termsOfPayment?.feeAmount,
                    commissionRule: deal?.contractedTermsAndCond?.buyerTerms?.commissionRule,
                    // Right side
                    dateOfAgreement: deal?.purchaseAgreement?.dateOfAgreement,
                    inspectionCompletionDate: "",
                    // inspectionCompletionDate: (() => {
                    //     console.log('before', deal?.contractedTermsAndCond?.buyerTerms?.inspectionDate)
                    //     const currentDate = deal?.contractedTermsAndCond?.buyerTerms?.inspectionDate
                    //     console.log('currentDate', currentDate)
                    //     currentDate.setDate(currentDate.getDate() + deal?.contractedTermsAndCond?.buyerTerms?.inspectionConditions?.daysForInspection);
                    //     return currentDate.toString()
                    // })(),
                    deliveryDate: deal?.contractedTermsAndCond?.buyerTerms?.deliveryDate,
                    expectedClosingDate: (() => {
                        return String(getCalendarArray(deal)[deal?.steps.length - 1]?.expectedDate)
                    })(),
                    currency: deal?.ad?.termsOfPayment?.currency?.label,
                    ppiFacility: deal?.ppiDetails?.facilityAndLocation,
                    ppiStartDate: deal?.ppiDetails?.startingDate,
                    ppiCompletionDate: deal?.ppiDetails?.expectedCompletionDate,
                    ppiResult: deal?.ppiDetails?.otherDetails,
                })
                return deal
            })
            .then((deal) => {
                getAd({ adId: `${deal?.ad?.id}` })
                    .then((response) => {
                        const ad = response?.data?.getAd?.ad
                        setAd(ad)
                        return ad
                    })
                    .then((ad) => {
                        setValues(
                            (prev) => {
                                return {
                                    ...prev,
                                    year: ad?.mainInformation?.year,
                                    totalSeats: ad?.aircraftSummary?.totalSeats,
                                    ttsn: +ad?.aircraftSummary?.airframeTtsn
                                }
                            }
                        )
                        setLoading(false)
                    })
            })
    }, [choices])

    useEffect(() => {
        // console.log('ad', ad)
        console.debug('deal', deal)
        // console.log('choices', choices)
    }, [ad, deal])

    const handleReturn = () => {
        router.push('/deals')
    }

    return (
        <Layout>
            <div className="dealOverview">
                <div className="dealOverview__inner">
                    <div className="dealOverview__heading">
                        <h1 className="dealOverview__title">Deal Overview</h1>
                        <Button
                            onClick={handleReturn}
                        >
                            Return
                        </Button>
                    </div>
                    <div className="dealOverview__content">
                        {isLoading ?
                            <LoaderView ring={true} />
                            :
                            <>

                                <div className="dealOverview__content__main appear">
                                    <Accordion
                                        underline={true}
                                        initialState={true}
                                    >
                                        <DealHeader title={values?.aircraftTitle} />
                                        <div className="dealOverview__content__content">
                                            <div className="dealOverview__content__content-left">
                                                <div className="dealOverview__info">
                                                    <div className="dealOverview__info--img">
                                                        <CardImage
                                                            ratio={getImageRatio(ImageStyles.DEAL_OVERVIEW)}
                                                            src={getImageLink(values?.images?.[0], ImageStyles.DEAL_OVERVIEW)}
                                                            title={values?.aircraftTitle}
                                                        />
                                                    </div>
                                                    <ProductInfoList
                                                        year={values?.year}
                                                        totalSeats={values?.totalSeats}
                                                        ttsn={values?.ttsn}
                                                    />
                                                </div>
                                            </div>
                                            <div className="dealOverview__content__content-right">
                                            </div>
                                        </div>
                                    </Accordion>
                                    <MediaQuery maxWidth={1279}>
                                        <DealFlow
                                            logDeals={deal?.logDeals}
                                            currentStatus={dealStateMessageText}
                                        />
                                    </MediaQuery>
                                    <Accordion
                                        underline={true}
                                        initialState={true}
                                    >
                                        <DealHeader title="Parties of the Deal" />
                                        <div className="dealOverview__content__parties">
                                            <div className="dealOverview__content__content-left">
                                                <div className="dealOverview__content__content-buyer">
                                                    <Party side={values?.buyer} />
                                                </div>
                                            </div>
                                            <div className="dealOverview__content__content-right">
                                                <div className="dealOverview__content__content-seller">
                                                    <Party side={values?.seller} role="seller" />
                                                </div>
                                            </div>
                                        </div>
                                    </Accordion>

                                    <Accordion
                                        underline={true}
                                        initialState={true}
                                    >
                                        <DealHeader title="Contracted Terms" />
                                        <div className="dealOverview__content__content">
                                            <div className="dealOverview__content__content-left">
                                                <ContentItem
                                                    title="Aircraft Price"
                                                    content={{
                                                        contentValue: values?.aircraftPrice,
                                                        currency: values?.currency,
                                                    }}
                                                    type="price"
                                                />
                                                <ContentItem
                                                    title="Delivery Location"
                                                    content={{
                                                        contentValue: values?.deliveryLocation
                                                    }}
                                                    type="string"
                                                />
                                                <ContentItem
                                                    title="Inspection Level"
                                                    content={{
                                                        contentValue: values?.inspectionProgramLevel
                                                    }}
                                                    type="string"
                                                />
                                                <ContentItem
                                                    title="Governing Law"
                                                    content={{
                                                        contentValue: values?.governingLaw
                                                    }}
                                                    type="string"
                                                />
                                                <ContentItem
                                                    title="Platform's Administration fees"
                                                    content={{
                                                        contentValue: values?.fee,
                                                        currency: values?.currency,
                                                    }}
                                                    type="price"
                                                />
                                                <ContentItem
                                                    title="Administration Fee Distribution"
                                                    content={{
                                                        contentValue: values?.commissionRule
                                                    }}
                                                    type="string"
                                                />
                                            </div>
                                            <div className="dealOverview__content__content-right">
                                                <ContentItem
                                                    title="Purchase Agreement Date"
                                                    content={{
                                                        contentValue: values?.dateOfAgreement
                                                    }}
                                                    type="date"
                                                />
                                                <ContentItem
                                                    title="Inspection Completion Date"
                                                    content={{
                                                        contentValue: values?.inspectionCompletionDate,
                                                    }}
                                                    type="date"
                                                />
                                                <ContentItem
                                                    title="Delivery Date"
                                                    content={{
                                                        contentValue: values?.deliveryDate
                                                    }}
                                                    type="date"
                                                />
                                                <ContentItem
                                                    title="Expected Closing Date"
                                                    content={{
                                                        contentValue: values?.expectedClosingDate
                                                    }}
                                                    type="date"
                                                />
                                            </div>
                                        </div>
                                    </Accordion>

                                    {
                                        getStateRelativeIndex(AppDealStatusChoices[deal?.status]) >= 18 && values.inspectionProgramLevel !== "No Inspection" ?
                                            <Accordion
                                                underline={true}
                                                initialState={true}
                                            >
                                                <DealHeader title="Pre-Purchase Inspection" />

                                                <div className="dealOverview__content__content">
                                                    <div className="dealOverview__content__content-left">
                                                        <ContentItem
                                                            title="Inspection Facility"
                                                            content={{
                                                                contentValue: values?.ppiFacility
                                                            }}
                                                            type="string"
                                                        />
                                                        <ContentItem
                                                            title="Inspection Start Date"
                                                            content={{
                                                                contentValue: values?.ppiStartDate
                                                            }}
                                                            type="date"
                                                        />
                                                    </div>
                                                    <div className="dealOverview__content__content-right">
                                                        <ContentItem
                                                            title="Inspection Completion Date"
                                                            content={{
                                                                contentValue: values?.ppiCompletionDate
                                                            }}
                                                            type="date"
                                                        />
                                                        <ContentItem
                                                            title="Inspection Result"
                                                            content={{
                                                                contentValue: values?.ppiResult
                                                            }}
                                                            type="string"
                                                        />
                                                    </div>
                                                </div>
                                            </Accordion>
                                            :
                                            null
                                    }

                                    <Accordion
                                        underline={true}
                                        initialState={true}
                                    >
                                        <DealHeader title="Documents" />
                                        <div className="dealOverview__content__documents">

                                            <div className="dealOverview__content__content-left">
                                                <div className="deal-card__docs">
                                                    <AircraftDocuments
                                                        title='Aircraft Docs'
                                                        ad={values?.dealAd}
                                                        deal={deal}
                                                        signed={false}
                                                    />
                                                </div>
                                            </div>
                                            <div className="dealOverview__content__content-right">
                                                <div className="deal-card__docs">
                                                    <AircraftDocuments
                                                        title='Signed docs'
                                                        ad={values?.dealAd}
                                                        deal={deal}
                                                        unsigned={false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Accordion>
                                </div>
                                <MediaQuery minWidth={1280}>
                                    <DealFlow
                                        logDeals={deal?.logDeals}
                                        currentStatus={dealStateMessageText}
                                    />
                                </MediaQuery>
                            </>
                        }
                    </div>
                </div>
            </div>
        </Layout >
    )
}

export default DealOverview