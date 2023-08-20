import { Form, Formik, FormikErrors, FormikProps, FormikTouched } from 'formik'
import React, { useState } from 'react'
//import GoogleLogin from 'react-google-login'
import { useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import Button from 'src/components/Button/Button'
import ErrorMsg from 'src/components/ErrorMsg/ErrorMsg'
import FormikField from 'src/components/FormikField/FormikField'
import { useResetPassword, useSignIn } from 'src/generated/graphql'
import Layout from 'src/hoc/Layout'
import { setProfileLoader } from 'src/reducers/loaderReducer'
import { setToken } from 'src/reducers/userReducer'
import { AppDispatch } from 'src/store'
import * as Yup from 'yup'
import '../Register/Register.scss'
import { alignProperty } from '@mui/material/styles/cssUtils'

interface Values {
    email: string
    password: string
}

const emailValidation = Yup.string().email('Invalid email').required('Required')


const LoginSchema = Yup.object().shape({
    email: emailValidation,
    password: Yup.string()
        .min(8, 'Should be at least 8 characters')
        .required('Required'),
})

const EmailSchema = Yup.object().shape({
    email: emailValidation,
})

//const clientId = '246041224072-3pc9h5fj3t2djq3966nvf2hsntruph89.apps.googleusercontent.com'

const Login: React.FC = () => {
    const [error, setError] = useState<string>('')
    const dispatch: AppDispatch = useDispatch()
    const [_, signIn] = useSignIn()
    const [, resetPassword] = useResetPassword()
    const history = useHistory()


    const handleForgotPassword = (
        email: string,
        setErrors: (errors: FormikErrors<Values>) => void,
        setTouched: (touched: FormikTouched<Values>) => void,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        EmailSchema.validate({ email })
            .then(() => {
                setSubmitting(true)
                resetPassword({ email })
                    .then((res) => {
                        const response = res.data.resetPassword
                        const fieldErrors = response.fieldErrors
                        const runtimeError = response.runtimeError

                        if (runtimeError) {
                            setError(runtimeError.message)
                            return false
                        }

                        if (fieldErrors) {
                            let errorList = {}
                            fieldErrors.map(
                                (err) => (errorList[err.field] = err.message),
                            )
                            setErrors(errorList)
                            return false
                        }

                        history.push({
                            pathname: '/password-recover',
                            search: `?email=${encodeURIComponent(email)}`,
                        })
                    })
                    .catch((err) => console.error(err))
                    .finally(() => setSubmitting(false))
            })
            .catch((err) => {
                setTouched({
                    email: true,
                })
                setErrors({ email: err.errors[0] })
            })
    }

    const handleGoogleSuccess = (res) => {
        console.log('[Login Success]: ', res)
        signIn({ email: res.profileObj.email, password: res.accessToken })
            .then((res) => {
                const response = res.data.signIn
                const runtimeError = response.runtimeError
                const fieldErrors = response.fieldErrors

                if (runtimeError) {
                    setError(runtimeError.message)
                    return false
                }

                if (fieldErrors) {
                    history.push('/register')
                }

                // dispatch(setToken(res.data.signIn.token))
                // dispatch(setProfileLoader(true))
                // history.push('/')
            })
            .catch((err) => console.error(err))
    }

    return (
        <Layout>
            <div className="auth">
                <div className="auth__inner">
                    <div className="auth__nav">
                        <Link
                            to="/login"
                            className="active"
                        >
                            Log In
                        </Link>
                        <Link to="/register">Sign Up</Link>
                    </div>
                    <div className="auth__form"></div>
                    <Formik
                        initialValues={{ email: '', password: '' }}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            setSubmitting(true)
                            signIn(values)
                                .then((res) => {
                                    const response = res.data.signIn
                                    const fieldErrors = response.fieldErrors
                                    const runtimeError = response.runtimeError
                                    const isConfirmed = response.isConfirmed
                                    if (runtimeError) {
                                        setError(runtimeError.message)
                                        setSubmitting(false)
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
                                        setSubmitting(false)
                                        return false
                                    }
                                    // Зачем это здесь, если мы не регистрируемся, а логинимся?
                                    if (!isConfirmed) {
                                        history.push({
                                            pathname: '/confirm',
                                            search: `?fromLogin=true&email=${encodeURIComponent(
                                                values.email,
                                            )}`,
                                        })
                                        return false
                                    }

                                    dispatch(setToken(res.data.signIn.token))
                                    dispatch(setProfileLoader(true))
                                    history.push('/')
                                })
                                .catch((err) => {
                                    console.error(err)
                                    setSubmitting(false)
                                })
                        }}
                        validationSchema={LoginSchema}
                    >
                        {({
                            isSubmitting,
                            values,
                            setErrors,
                            setTouched,
                            setSubmitting,
                        }: FormikProps<Values>) => (
                            <Form>
                                <FormikField
                                    name="email"
                                    placeholder="E-mail"
                                    type="email"
                                    isEmail={true}
                                />
                                <FormikField
                                    name="password"
                                    placeholder="Password"
                                    type="password"
                                />
                                <ErrorMsg text={error} />
                                <div className="auth__buttons">
                                    <Button
                                        className="auth__recover"
                                        type="red-border"
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            handleForgotPassword(
                                                values.email,
                                                setErrors,
                                                setTouched,
                                                setSubmitting,
                                            )
                                        }
                                    >
                                        Forgot password?
                                    </Button>
                                    <Button
                                        className="auth__login"
                                        btnType="submit"
                                        disabled={isSubmitting}
                                    >
                                        Log in
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </Layout>
    )
}

export default Login
