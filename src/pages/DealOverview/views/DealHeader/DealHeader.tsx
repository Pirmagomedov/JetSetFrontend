import React from 'react'

interface IDealHeader {
    title: string
}

const DealHeader: React.FC<IDealHeader> = (props) => {
    const { title } = props
    return (
        <div className="dealOverview__content__header">
            <h1
                className="dealOverview__content__h1"
            >
                {title}
            </h1>
        </div>
    )
}

export default DealHeader