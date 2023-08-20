import {
    Currency
} from 'src/generated/graphql'
import { getBankAccount } from 'src/helper'
import React, { useState } from 'react'
import Icon from '../Icon/Icon'
import './BankData.scss'


interface IBankData {
    currency: Currency
}

const BankData: React.FC<IBankData> = (props) => {
    const { currency } = props
    const account = getBankAccount(currency)
    const [copied, setCopied] = useState(false)
    const titles = {
        accName: 'Account Name',
        account: 'Account Number',
        currency: 'Account Currency',
        bank: 'Bank Name',
        address: 'Bank Address',
        iban: 'IBAN',
        swift: 'Branch Swift Code',
        sort: 'Branch Sort Code',
        cover: 'Cover At',
        attn: 'Attn',
    }
    const copyToClipboard = async () => {
        let text = ''
        Object.keys(account).forEach((key) => {
            text +=
                titles[key] +
                ':\t' +
                account[key].replaceAll('\n', '\n\t') +
                '\n'
        })
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1000)
    }

    return (
        <div className="payment__bank">
            <div
                className={`payment__bank--copy ${copied ? 'copied' : 'waiting'
                    }`}
                onClick={copyToClipboard}
            >
                <Icon name="i-copy" />
            </div>
            <div className="payment__bank--row">
                <span>Account Name:</span>
                <span>{account.accName}</span>
            </div>
            <div className="payment__bank--row">
                <span>Account Number:</span>
                <span>{account.account}</span>
            </div>
            <div className="payment__bank--row">
                <span>Account Currency:</span>
                <span>{account.currency}</span>
            </div>
            <div className="payment__bank--row">
                <span>Bank Name:</span>
                <span>{account.bank}</span>
            </div>
            <div className="payment__bank--row">
                <span>Bank Address:</span>
                <span>
                    {account.address.split('\n').map((t) => (
                        <>
                            {t}
                            <br />
                        </>
                    ))}
                </span>
            </div>
            <div className="payment__bank--row">
                <span>IBAN:</span>
                <span>{account.iban}</span>
            </div>
            <div className="payment__bank--row">
                <span>Branch Swift Code:</span>
                <span>{account.swift}</span>
            </div>
            {account.sort && (
                <div className="payment__bank--row">
                    <span>Branch Sort Code:</span>
                    <span>{account.sort}</span>
                </div>
            )}
            {account.cover && (
                <div className="payment__bank--row">
                    <span>Cover At:</span>
                    <span>{account.cover}</span>
                </div>
            )}
            <div className="payment__bank--row">
                <span>Attn:</span>
                <span>{account.attn}</span>
            </div>
        </div>
    )
}

export default BankData