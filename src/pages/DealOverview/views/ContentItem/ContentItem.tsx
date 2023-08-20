import React from 'react'
import './ContentItem.scss'
import {
    formatDate,
    formatPrice
} from 'src/helper'

interface IContentItem {
    title: string
    content: IValueType
    type: ItemType
}

interface IValueType {
    contentValue: any
    currency?: string
}

type ItemType = "string" | "date" | "price"

const ContentItem: React.FC<IContentItem> = (props) => {
    const { title, content, type } = props

    const formatValue = (value: IValueType, type: ItemType): any => {
        const { contentValue, currency } = value
        if (type === "price") {
            return `${currency} ${formatPrice(contentValue)}`
        }
        else if (type === "date") {
            if (!contentValue) {
                return ""
            }
            // console.log('contentValue', contentValue)
            const parsedData = Date.parse(contentValue)
            // console.log('parsedData', parsedData)
            const extractedDateFromString: string = formatDate((new Date(parsedData)))
            // console.log('extracted data', extractedDateFromString)
            // console.log('================================')
            return extractedDateFromString
        }
        else {
            return contentValue
        }
    }

    return (
        <div className="content__item">
            <div className="content__item__title">{title}</div>
            <div className="content__item__value">{formatValue(content, type)}</div>
        </div>
    )
}

export default ContentItem