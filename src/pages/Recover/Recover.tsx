import { Form, Formik, FormikProps } from 'formik'
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import ErrorMsg from 'src/components/ErrorMsg/ErrorMsg'
import FormikField from 'src/components/FormikField/FormikField'
import { useGetResetPasswordToken, useResendEmail } from 'src/generated/graphql'
import Layout from 'src/hoc/Layout'
import LoaderView from 'src/components/LoaderView/LoaderView'
import './Recover.scss'

interface Values {
    code: string
}

const Recover: React.FC = React.memo((props) => {
    const [error, setError] = useState<string>('')
    const [counter, setCounter] = useState<number>(60)
    const [isResend, setIsResend] = useState<boolean>(false)
    const [, resendEmail] = useResendEmail()
    const [, getResetPasswordToken] = useGetResetPasswordToken()
    const params = new URLSearchParams(useLocation().search)
    const email = params.get('email')
    const history = useHistory()

    useEffect(() => {
        const timer =
            counter > 0 &&
            setTimeout(() => setCounter((prevState) => prevState - 1), 1000)
        return () => clearTimeout(timer)
    }, [counter])

    const handleResend = (setSubmitting) => {
        setIsResend(false)
        setSubmitting(true)

        resendEmail({ email })
            .then((res) => {
                const response = res.data.resendEmail
                const runtimeError = response.runtimeError

                if (runtimeError) {
                    setError(runtimeError.message)
                    return false
                }

                setIsResend(true)
                setCounter(60)
            })
            .catch((err) => console.error(err))
            .finally(() => setSubmitting(false))
    }

    return (
        <Layout>
            <div className="recover">
                <Formik
                    initialValues={{ code: '' }}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        setSubmitting(true)
                        getResetPasswordToken({ email, code: +values.code })
                            .then((res) => {
                                const response = res.data.getResetPasswordToken
                                const fieldErrors = response.fieldErrors
                                const runtimeError = response.runtimeError
                                const token = response.token

                                if (runtimeError) {
                                    setError(runtimeError.message)
                                    return false
                                }

                                if (fieldErrors) {
                                    let errorList = {}
                                    fieldErrors.map(
                                        (err) =>
                                            (errorList[err.field] =
                                                err.message),
                                    )
                                    setErrors(errorList)
                                    return false
                                }

                                history.push({
                                    pathname: '/recover-password',
                                    search: `?token=${token}&email=${encodeURIComponent(
                                        email,
                                    )}`,
                                })
                            })
                            .catch((err) => console.error(err))
                            .finally(() => setSubmitting(false))
                    }}
                >
                    {({ isSubmitting, setSubmitting }: FormikProps<Values>) => (
                        <Form>
                            <h1 className="recover__title">Forgot password?</h1>
                            <div className="recover__description">
                                <b>Six-digit code</b> has been sent to you at{' '}
                                <span>{email}</span> Enter this code within 24
                                hours to confirm your recovery.
                            </div>
                            <FormikField
                                name="code"
                                placeholder="Enter six-digit code"
                                type="text"
                            />
                            <ErrorMsg text={error} />
                            {counter > 0 ? (
                                <div className="recover__notification">
                                    You can get new code in {counter} seconds
                                </div>
                            ) : null}
                            {isResend ? (
                                <div className="recover__notification">
                                    New code has been sent
                                </div>
                            ) : null}
                            <div className="recover__buttons">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    disabled={counter > 0 || isSubmitting}
                                    onClick={() => handleResend(setSubmitting)}
                                >
                                    {isSubmitting ? (
                                        <LoaderView ring />
                                    ) : (
                                        <span>Resend code</span>
                                    )}
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-blue"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <LoaderView ring />
                                    ) : (
                                        <span>Confirm</span>
                                    )}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </Layout>
    )
})

export default Recover
