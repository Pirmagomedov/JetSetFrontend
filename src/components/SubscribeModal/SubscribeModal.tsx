import { Formik, FormikProps, Form } from 'formik'
import React from 'react'
import Modal from 'src/components/Modal/Modal'
import Button from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import FormikField from '../FormikField/FormikField'

interface ISubscribeModalProps {
    modalIsOpen: boolean
    closeModal: () => void
}

const SubscribeModal: React.FC<ISubscribeModalProps> = React.memo((props) => {
    const { modalIsOpen, closeModal } = props

    return (
        <Modal
            modalIsOpen={modalIsOpen}
            onRequestClose={closeModal}
            title="Subscribe to newsletter of the aviation world"
        >
            <Formik
                initialValues={{ email: '' }}
                onSubmit={(values, { setSubmitting }) => {}}
            >
                {(props: FormikProps<{ email: string }>) => (
                    <Form className="subscribe-modal__form">
                        <FormikField
                            name="email"
                            placeholder="E-mail"
                            type="email"
                            isEmail={true}
                        />
                        <div className="footer-block">
                            <Button
                                btnType="submit"
                                className="btn btn-blue"
                            >
                                Subscribe
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
})

export default SubscribeModal
