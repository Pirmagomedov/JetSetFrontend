import { Form, Formik, FormikProps } from 'formik'
import React, { useState, useEffect } from 'react'
//import GoogleLogin from 'react-google-login'
import { Link, useHistory } from 'react-router-dom'
import ErrorMsg from 'src/components/ErrorMsg/ErrorMsg'
import FormikField from 'src/components/FormikField/FormikField'
import FormikCheckbox from 'src/components/FormikCheckbox/FormikCheckbox'
import { useSignUp } from 'src/generated/graphql'
import Layout from 'src/hoc/Layout'
import LoaderView from 'src/components/LoaderView/LoaderView'
import * as Yup from 'yup'
import './Register.scss'
import Button from 'src/components/Button/Button'

interface Values {
    email: string
    password: string
    passwordConfirm: string
    username: string
}

const RegisterSchema = Yup.object().shape({
    username: Yup.string()
        .min(3, 'Should be at least 3 characters')
        .required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string()
        .min(8, 'Should be at least 8 characters')
        .required('Required'),
    passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
    acceptTermsOfUse: Yup.boolean().required('Required'),
    acceptTermsOfTransactions: Yup.boolean().required('Required'),
    acceptPrivacy: Yup.boolean().required('Required'),
})

//const clientId = '246041224072-3pc9h5fj3t2djq3966nvf2hsntruph89.apps.googleusercontent.com'

interface IAccepted {
    acceptTermsOfUse: boolean
    acceptTermsOfTransactions: boolean
    acceptPrivacy: boolean
}

const Register: React.FC = () => {
    const [error, setError] = useState<string>('')
    const [_, signUp] = useSignUp()
    const history = useHistory()
    const [accepted, setAccepted] = useState<IAccepted>({
        acceptTermsOfUse: false,
        acceptTermsOfTransactions: false,
        acceptPrivacy: false,
    })
    const [unlocked, setUnlocked] = useState<boolean>(false)

    const handleGoogleSuccess = (res) => {
        console.log('[Login Success]: ', res)
    }

    useEffect(() => {
        let newUnlocked = true
        Object.keys(accepted).forEach(
            (key) => (newUnlocked = newUnlocked && accepted[key]),
        )
        setUnlocked(newUnlocked)
    }, [accepted])

    const handleChange = (name: string, value: boolean) => {
        setAccepted({ ...accepted, [name]: value })
    }

    return (
        <Layout>
            <div className="auth">
                <div className="auth__inner">
                    <div className="auth__nav">
                        <Link to="/login">Log In</Link>
                        <Link
                            to="/register"
                            className="active"
                        >
                            Sign Up
                        </Link>
                    </div>
                    <Formik
                        initialValues={{
                            email: '',
                            password: '',
                            passwordConfirm: '',
                            username: '',
                        }}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            setSubmitting(true)
                            signUp({
                                email: values.email,
                                password: values.password,
                                username: values.username,
                            })
                                .then((res) => {
                                    const response = res.data.register
                                    const fieldErrors = response.fieldErrors
                                    const runtimeError = response.runtimeError

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

                                    setSubmitting(false)

                                    history.push({
                                        pathname: '/confirm',
                                        search: `?email=${encodeURIComponent(
                                            values.email,
                                        )}`,
                                    })
                                })
                                .catch((err) => {
                                    console.error(err)
                                    setSubmitting(false)
                                })
                        }}
                        validationSchema={RegisterSchema}
                    >
                        {({ isSubmitting }: FormikProps<Values>) => (
                            <Form>
                                <FormikField
                                    name="username"
                                    placeholder="Username"
                                />
                                <FormikField
                                    name="email"
                                    placeholder="E-mail"
                                    isEmail={true}
                                />
                                <FormikField
                                    name="password"
                                    placeholder="Password"
                                    type="password"
                                />
                                <FormikField
                                    name="passwordConfirm"
                                    placeholder="Repeat password"
                                    type="password"
                                />
                                <div>
                                    <FormikCheckbox
                                        handleChange={handleChange}
                                        name="acceptTermsOfUse"
                                        label={
                                            <span>
                                                Accept the{' '}
                                                <a
                                                    target="_blank"
                                                    href="https://wingform.com/assets/docs/Terms_Of_Use_Wingform.pdf"
                                                >
                                                    Terms of Use
                                                </a>
                                            </span>
                                        }
                                    />
                                </div>
                                <div>
                                    <FormikCheckbox
                                        handleChange={handleChange}
                                        name="acceptTermsOfTransactions"
                                        label={
                                            <span>
                                                Accept the{' '}
                                                <a
                                                    target="_blank"
                                                    href="https://wingform.com/assets/docs/Terms_Of_Transactions_Wingform.pdf"
                                                >
                                                    Terms of Transactions
                                                </a>
                                            </span>
                                        }
                                    />
                                </div>
                                <div>
                                    <FormikCheckbox
                                        handleChange={handleChange}
                                        name="acceptPrivacy"
                                        label={
                                            <span>
                                                Accept the{' '}
                                                <a
                                                    target="_blank"
                                                    href="https://wingform.com/assets/docs/Privacy_Policy_Wingform.pdf"
                                                >
                                                    Privacy Policy
                                                </a>
                                            </span>
                                        }
                                    />
                                </div>
                                <ErrorMsg text={error} />
                                <Button
                                    btnType="submit"
                                    className="btn btn-blue auth__confirm"
                                    disabled={isSubmitting || !unlocked}
                                >
                                    {isSubmitting ? (
                                        <LoaderView ring />
                                    ) : (
                                        <span>Sign up</span>
                                    )}
                                </Button>
                                {/* <button type="submit" className="btn btn-blue auth__confirm" disabled={isSubmitting || !unlocked}>
                    {isSubmitting ? <img src="assets/images/loader.svg" /> : <span>Sign up</span>}
                  </button> */}
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </Layout>
    )
}

export default Register
