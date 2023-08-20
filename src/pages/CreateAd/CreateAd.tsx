import React, { lazy, ReactNode, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'
import ErrorMsg from 'src/components/ErrorMsg/ErrorMsg'
import Modal from 'src/components/Modal/Modal'
import KycKybBlocker from 'src/components/KycKybBlocker/KycKybBlocker'
import { Ad, useGetAd, AppWorkspaceRoleChoices } from 'src/generated/graphql'
import Layout from 'src/hoc/Layout'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch, RootState } from 'src/store'
import { useCurrentWorkspace } from 'src/hooks'
import Icon from 'src/components/Icon/Icon'
import { Step } from 'src/types'
import './CreateAd.scss'
const CharacteristicsModal = lazy(
    () => import('./views/CharacteristicsModal/CharacteristicsModal'),
)
const ConditionsModal = lazy(
    () => import('./views/ConditionsModal/ConditionsModal'),
)
const CreateAdCharacteristics = lazy(
    () => import('./views/CreateAdCharacteristics/CreateAdCharacteristics'),
)
const CreateAdConditions = lazy(
    () => import('./views/CreateAdConditions/CreateAdConditions'),
)
const CreateAdDocuments = lazy(
    () => import('./views/CreateAdDocuments/CreateAdDocuments'),
)
const CreateAdMain = lazy(() => import('./views/CreateAdMain/CreateAdMain'))
const MainInformationModal = lazy(
    () => import('./views/MainInformationModal/MainInformationModal'),
)
import StepsAd from './views/StepsAd/StepsAd'

const steps: Step[] = [
    { id: 1, label: 'Main information / photo' },
    { id: 2, label: 'Aircraft Characteristics' },
    { id: 3, label: 'Documents' },
    { id: 4, label: 'Terms & Conditions' },
]


const CreateAd: React.FC = (props) => {
    const [isMainInformationModal, setIsMainInformationModal] =
        useState<boolean>(false)
    const [isCharacteristicsModal, setIsCharacteristicsModal] =
        useState<boolean>(false)
    const [isConditionsModal, setIsConditionsModal] = useState<boolean>(false)
    const currentWorkspace = useCurrentWorkspace()
    const [currentAd, setCurrentAd] = useState<Ad>()
    const [step, setStep] = useState<number>(1)
    const [error, setError] = useState<string>('')
    const router = useHistory()
    const isCanCreateAd =
        currentWorkspace?.role == AppWorkspaceRoleChoices.REPRESENTATIVE
            ? currentWorkspace?.isCanCreateAd
            : true

    const { choices } = useSelector((state: RootState) => state?.choices)
    const [, getAd] = useGetAd()

    const { id } = useParams<{ id: string }>()
    const dispatch: AppDispatch = useDispatch()

    useEffect(() => {
        if (id) {
            dispatch(setCommonLoader(true))
            getAd({ adId: id })
                .then((res) => {
                    const response = res?.data?.getAd
                    const runtimeError = response?.runtimeError
                    if (runtimeError) {
                        console.error(
                            `[${runtimeError?.exception}]: ${runtimeError?.message}`,
                        )
                        return false
                    }
                    setCurrentAd(response?.ad)
                })
                .catch((err) => console.error(err))
                .finally(() => dispatch(setCommonLoader(false)))
        }

        return () => {
            setCurrentAd(null)
        }
    }, [step])

    const handleWorkspacesOpen = () => {
        router.push('/profile')
    }

    const renderBody = (step: number): ReactNode => {
        switch (step) {
            case 1:
                return (
                    <CreateAdMain
                        id={id}
                        step={step}
                        onStep={setStep}
                        currentAd={currentAd}
                        category={choices?.planeCategories}
                        condition={choices?.planeConditions}
                        onError={setError}
                    />
                )
            case 2:
                return (
                    <CreateAdCharacteristics
                        id={id}
                        step={step}
                        onStep={setStep}
                        currentAd={currentAd}
                        choices={choices}
                        onError={setError}
                    />
                )
            case 3:
                return (
                    <CreateAdDocuments
                        id={id}
                        step={step}
                        onStep={setStep}
                        currentAd={currentAd}
                    />
                )
            case 4:
                return (
                    <CreateAdConditions
                        id={id}
                        step={step}
                        onStep={setStep}
                        currentAd={currentAd}
                        onError={setError}
                    />
                )
        }
    }

    const handleHelp = () => {
        switch (step) {
            case 1:
                router.push(`/help/terms-of-aircraft-sales-transactions/4`)
                // setIsMainInformationModal(true)
                break
            case 2:
                setIsCharacteristicsModal(true)
                break
            case 4:
                setIsConditionsModal(true)
                break
        }
    }

    return (
        <Layout>
            <div className="create-ad">
                <div className="create-ad__inner">
                    <div className="create-ad__header">
                        <h1>Create Ad</h1>
                        <div className="create-ad__help">
                            <ErrorMsg text={error} />
                            {step === 3 ? null : (
                                <Icon
                                    name="i-question"
                                    onClick={handleHelp}
                                    width={20}
                                    height={20}
                                />
                            )}
                        </div>
                    </div>
                    {isCanCreateAd ? (
                        <KycKybBlocker wsOnly message={
                            <Modal
                                title="Create workspace first"
                                className="modal demo-mode"
                                modalIsOpen={true}
                                onRequestClose={handleWorkspacesOpen}
                                isCloseIcon={false}
                                buttons={[

                                    { title: 'To workspaces', onClick: handleWorkspacesOpen },
                                ]}
                            >
                                To create a listing aircraft, you need to create a workspace and/or undergo the compliance check.
                            </Modal>
                        }>
                            <div className="create-ad__steps">
                                <StepsAd
                                    steps={steps}
                                    step={step}
                                />
                            </div>
                            <div className="create-ad__body">
                                {renderBody(step)}
                            </div>
                        </KycKybBlocker>
                    ) : (
                        <div>You can't create ad in this workspace</div>
                    )}
                </div>
            </div>

            {/* <MainInformationModal
                modalIsOpen={isMainInformationModal}
                closeModal={() => setIsMainInformationModal(false)}
            /> */}
            <CharacteristicsModal
                modalIsOpen={isCharacteristicsModal}
                closeModal={() => setIsCharacteristicsModal(false)}
            />
            <ConditionsModal
                modalIsOpen={isConditionsModal}
                closeModal={() => setIsConditionsModal(false)}
            />
        </Layout>
    )
}

export default CreateAd
