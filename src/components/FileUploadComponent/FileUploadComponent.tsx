import React, { useEffect, useState } from 'react'
import Button from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import { useRef } from 'react'
import { Form, Formik } from 'formik'
import FormikFile from 'src/components/FormikFile/FormikFile'
import { FileType, useUploadFiles } from 'src/generated/graphql'
import FileLink from 'src/components/FileLink/FileLink'
import './FileUploadComponent.scss'

interface IFileUploadComponent {
    title: string
    name: string
    file?: FileType
    onConfirm: (name: string, value: number) => void
    disabled: boolean
    isPrivate?: boolean
}

const FileUploadComponent: React.FC<IFileUploadComponent> = (props) => {
    const { title, name, onConfirm, file, disabled, isPrivate = false } = props
    const [uploaded, setUploaded] = useState<number>(file ? file.id : 0)
    const [link, setLink] = useState<any>('')
    const className =
        'confirmation-component file-upload-component ' +
        (uploaded > 0 || link !== '' ? 'uploaded' : 'empty')
    const [, uploadFiles] = useUploadFiles()
    const formRef = useRef()

    useEffect(() => {
        setUploaded(file ? file.id : 0)
        setLink(file ? file : '')
    }, [file])

    const handleSubmit = (values) => {
        console.log('F1', values)
        if (values[name]) {
            console.log('F2')
            values[name].forEach(async (f) => {
                const uploadedFile = await uploadFiles({
                    files: [
                        {
                            file: f.file,
                            filename: f.filename,
                            isPublic: !isPrivate,
                        },
                    ],
                })
                console.log('F3', uploadedFile)
                if (uploadedFile?.data?.uploadFiles?.files?.length) {
                    const uploadedFileItem =
                        uploadedFile?.data?.uploadFiles?.files[0]
                    setUploaded(uploadedFileItem.id)
                    setLink(uploadedFileItem)
                    onConfirm(name, uploadedFileItem.id)
                }
            })
        }
    }

    return (
        <Formik
            innerRef={formRef}
            initialValues={{}}
            onSubmit={handleSubmit}
        >
            {({ values, handleSubmit }) => (
                <Form>
                    <div className={className}>
                        <div className="confirmation-component__header">
                            <div className="confirmation-component__success">
                                <Icon name="i-success" />
                            </div>
                            <div className="confirmation-component__title">
                                {title}
                            </div>
                        </div>
                        {link !== '' ? (
                            <div className="confirmation-component__file">
                                <FileLink file={link} />
                            </div>
                        ) : (
                            <div className="confirmation-component__button">
                                <FormikFile
                                    name={name}
                                    changeHandler={handleSubmit}
                                    disabled={disabled}
                                />
                            </div>
                        )}
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default FileUploadComponent
