import React, { useState } from 'react'
import LoaderView from 'src/components/LoaderView/LoaderView'
import Icon from 'src/components/Icon/Icon'
import { useText2Pdf } from 'src/generated/graphql'
import './Text2Pdf.scss'

interface IText2Pdf {
    text: string
    className?: string
    fileName: string
    icon?: boolean
    children?: JSX.Element[] | JSX.Element | string
}

const Text2Pdf: React.FC<IText2Pdf> = (props) => {
    const { text, children, className, fileName, icon } = props
    const [downloading, setDownloading] = useState<boolean>(false)
    const [html, setHtml] = useState<string>(text)
    const [, text2Pdf] = useText2Pdf()

    const handleDownload = (e) => {
        e.preventDefault()
        setDownloading(true)
        const filetered = text ? text.replace(/{{[^}]*}}/g, '') : null
        text2Pdf({ text: filetered }).then(res => {
            if (res?.data?.convertTextToPdf?.fileBase64) {
                const windowUrl = window.URL || window.webkitURL
                const fileUrl = 'data:application/pdf;base64,' +
                    res.data.convertTextToPdf.fileBase64
                const anchorElement = document.createElement('a')
                document.body.appendChild(anchorElement)
                anchorElement.style.display = 'none'
                anchorElement.href = fileUrl
                anchorElement.download = fileName
                anchorElement.click()
            } else {
                console.error('Text to PDF conversion failed!')
            }
            setDownloading(false)
        })
    }

    return (
        text
            ?
                <a href="#" className={`test2pdf-link ${className}`} onClick={handleDownload}>
                    {
                        downloading ?
                            <LoaderView ring />
                            :
                            <>
                                {
                                    icon &&
                                    <span className="document-link__icon">
                                        <Icon name="i-download" />
                                    </span>
                                }
                            </>
                    }
                    {children}
                </a>
            : null
    )
}

export default Text2Pdf
