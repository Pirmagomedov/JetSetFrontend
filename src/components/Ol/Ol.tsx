import React, { useEffect, useState } from 'react'
import './Ol.scss'

interface IOlItem {
    index: string
    text: string
}

interface IOl {
    list: Array<IOlItem>
}

const Ol: React.FC<IOl> = React.memo((props) => {
    const { list } = props

    return (
        <div className="ol">
            {list.map((li, i) => (
                <div
                    key={'li' + i}
                    className="ol__li"
                >
                    <div className="ol__li-index">{li.index}</div>
                    <div className="ol__li-text">{li.text}</div>
                </div>
            ))}
        </div>
    )
})

export default Ol
