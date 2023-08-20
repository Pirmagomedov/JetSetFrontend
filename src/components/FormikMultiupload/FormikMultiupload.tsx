
import React, { 
    useEffect, 
    useState 
} from 'react'
import Icon from 'src/components/Icon/Icon'
import { 
    AppUploadedFileDocTypeChoices, 
    AdDocumentTypeEnum 
} from 'src/generated/graphql'
import { useField } from 'formik'
import PrivateLink from 'src/components/PrivateLink/PrivateLink'
import { 
    FileType,
    AppUploadedFileDocTypeChoicesLabels 
} from 'src/types'
import { fileToBase64 } from 'src/helper'
import ReactSelect, {
    OptionTypeBase,
    components,
    IndicatorProps,
    OptionsType,
} from 'react-select'
import './FormikMultiupload.scss'

const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <div className="dropdown-indicator-arrow"></div>
        </components.DropdownIndicator>
    )
}

interface IFormikMultiuploadProps {
    name: string
    text?: string
    label?: string
    multiple?: boolean
    onChange?: (event: any) => void
    className?: string
    disabled?: boolean
    docType?: AppUploadedFileDocTypeChoices
    noDocTypeSelect?:boolean
}

const FormikMultiupload: React.FC<IFormikMultiuploadProps> = (props) => {
    const {
        text,
        label,
        multiple,
        className = '',
        name,
        disabled,
        onChange,
        docType,
        noDocTypeSelect
    } = props
    const [field, meta, helpers] = useField(props)
    //const [files, setFiles] = useState<FileType[]>(field.value || [])

    /*useEffect(() => {
        helpers.setValue(files)
    }, [files])*/

    const removeDocument = (id: number) => {
        helpers.setValue(field.value.filter((el, index) => index !== id))
    }

    const addDocument = (file: File) => {
        fileToBase64(file).then((res) => {
            helpers.setValue([
                ...field.value,
                {
                    file: res,
                    filename: file.name,
                },
            ])
            if (onChange) {
              onChange(event)
            }
        })
    }

    const handleChangeDoctype = (value, index) => {
        const files = [...field.value]
        files[index].docType = value.value
        helpers.setValue(files)
    }

    const handleChangeValue = async (event) => {
        const files = [...event.target.files]

        const processed = await Promise.all(
          files.map(f => {
            return fileToBase64(f).then(res => {
                return {
                    file: res,
                    filename: f.name,
                    docType
                }
            })
          })
        )

        helpers.setValue([
            ...field.value,
            ...processed,
        ])
    }

    const docTypeSort = (a, b) => {
        console.log('docTypeSort', a, b)
        if (a == 'OTHER') return 1
        if (b == 'OTHER') return -1
        return a[0] == b[0] ? 0 : a[0] < b[0] ? -1 : 1
    }

    const documentOptions = []

    Object.keys(AdDocumentTypeEnum)
        .filter(k => k !== 'SPEC_SHEET')
        .sort(docTypeSort)
        .forEach(key => 
            documentOptions.push({
                value: key,
                label: AppUploadedFileDocTypeChoicesLabels[key] ? AppUploadedFileDocTypeChoicesLabels[key] : key
            })
        )
    
    

    return (
        <div
            className={`field field--multiupload 
                ${className} 
                ${ disabled ? 'disabled' : '' }
                ${noDocTypeSelect ? 'no-doctype' : 'has-doctype'}
            `}
            data-name={name}
        >   
            {
                field.value.map((file, i) =>
                    <div className="upload__item" key={i}>
                        <PrivateLink fileName={file.filename} fileKey={file.keySigned ? file.keySigned : file.key} fileBucket={file.bucket}>
                            {file.filename}
                        </PrivateLink>
                        {
                            !noDocTypeSelect &&
                                <div className="multiupload__doctype">
                                    <ReactSelect
                                        key={i + file.docType}
                                        name={`docType_${i}`}
                                        options={documentOptions}
                                        onChange={v => handleChangeDoctype(v, i) }
                                        //placeholder={file.docType}
                                        isSearchable={true}
                                        isClearable={false}
                                        components={{ DropdownIndicator }}
                                        classNamePrefix="select select-white"
                                        value={documentOptions.filter(o => o.value == file.docType)?.[0]}
                                        defaultValue={documentOptions.filter(o => o.value == docType)?.[0]}
                                        isDisabled={disabled}
                                    />
                                </div>
                                }
                        <div className="upload__actions">
                            <button className="upload__delete" onClick={(e) => {e.preventDefault();removeDocument(i)}} >
                                <Icon name="i-trash" width={16} height={16} />
                            </button>
                        </div>
                    </div>
                )
            }
            <label htmlFor={name}>
                <input 
                    className="hidden" 
                    type="file" 
                    id={name} 
                    disabled={disabled} 
                    multiple={multiple} 
                    name={name} 
                    onChange={handleChangeValue} 
                />
                <span className="btn btn-blue btn-add-documents">Add documents</span>
            </label>
            {meta.touched && meta.error ? (
                <div className="field__error">{meta.error}</div>
            ) : null}
        </div>
    )
}

export default FormikMultiupload
