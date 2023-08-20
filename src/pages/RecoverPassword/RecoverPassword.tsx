import { Form, Formik, FormikProps } from 'formik'
import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import ErrorMsg from 'src/components/ErrorMsg/ErrorMsg'
import FormikField from 'src/components/FormikField/FormikField'
import { useChangePasswordByToken } from 'src/generated/graphql'
import Layout from 'src/hoc/Layout'
import LoaderView from 'src/components/LoaderView/LoaderView'
import * as Yup from 'yup'
import './RecoverPassword.scss'

interface IInitialValues {
    password: string
    repeatPassword: string
}

const initialValues: IInitialValues = {
    password: '',
    repeatPassword: '',
}

const RecoverSchema = Yup.object().shape({
    password: Yup.string()
        .min(8, 'Should be at least 8 characters')
        .required('Required'),
    repeatPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
})

const RecoverPassword: React.FC = React.memo((props) => {
    const [error, setError] = useState<string>('')
    const params = new URLSearchParams(useLocation().search)
    const email = params.get('email')
    const token = params.get('token')
    const [, changePasswordByToken] = useChangePasswordByToken()
    const history = useHistory()

    return (
        <Layout>
            <div className="recover-password">
                <div className="recover-password__inner">
                    <h1 className="recover-password__title">
                        Enter a new password
                    </h1>
                    <Formik
                        initialValues={initialValues}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            setSubmitting(true)
                            changePasswordByToken({
                                email,
                                token,
                                password: values.password,
                            })
                                .then((res) => {
                                    const response =
                                        res.data.changePasswordByToken
                                    const fieldErrors = response.fieldErrors
                                    const runtimeError = response.runtimeError

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
                                        pathname: '/success',
                                        search: `?fromRecover=true`,
                                    })
                                })
                                .catch((err) => console.error(err))
                                .finally(() => setSubmitting(false))
                        }}
                        validationSchema={RecoverSchema}
                    >
                        {({ isSubmitting }: FormikProps<IInitialValues>) => (
                            <Form className="recover-password__form">
                                <FormikField
                                    className="recover-password__field"
                                    name="password"
                                    label="New password"
                                    type="password"
                                />
                                <FormikField
                                    className="recover-password__field"
                                    name="repeatPassword"
                                    label="Repeat password"
                                    type="password"
                                />
                                <ErrorMsg text={error} />
                                <button
                                    type="submit"
                                    className="recover-password__btn btn btn-blue"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <LoaderView ring />
                                    ) : (
                                        <span>Submit</span>
                                    )}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </Layout>
    )
})

export default RecoverPassword
