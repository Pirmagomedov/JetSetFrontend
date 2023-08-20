import React, { useState, useEffect } from 'react'
import Icon from 'src/components/Icon/Icon'
import './AddressView.scss'

interface IAddressView {
    address?: string
}

export const AddressView: React.FC<IAddressView> = (props) => {
    const { address } = props
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setCopied(false), 3000)
        return () => {
            clearTimeout(t)
        }
    }, [copied])

    const copyToClipboard = () => {
        if (navigator?.clipboard) {
            console.log('copyToClipboard', address)
            navigator.clipboard.writeText(address)
        } else {
            console.log('old copyToClipboard', address)
            var textArea = document.createElement('textarea')
            textArea.value = address
            textArea.style.top = '0'
            textArea.style.left = '0'
            textArea.style.position = 'fixed'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            try {
                document.execCommand('copy')
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err)
            }
            document.body.removeChild(textArea)
        }
        setCopied(true)
    }

    if (!address) return null

    return (
        <div
            className={'address-view can-copy'}
            onClick={copyToClipboard}
        >
            <div className="address-view__text">
                {copied ? 'copied to clipboard' : address}
            </div>
            <Icon
                name={copied ? 'i-success' : 'i-chain'}
                className="address-view__copy"
            />
        </div>
    )
}

export default AddressView
