import React, { ReactNode, useState } from 'react'
import './FilterItem.scss'

interface IFilterItem {
    icon: string
    label: string
    children?: ReactNode
}

const FilterItem: React.FC<IFilterItem> = React.memo((props) => {
    const [isOpen, setOpen] = useState<boolean>(false)
    const { icon, label, children } = props

    return (
        <div className={`filter-item ${isOpen ? 'filter-item--open' : ''}`}>
            <div
                className="filter-item__header"
                onClick={() => setOpen(!isOpen)}
            >
                <div className="filter-item__icon">
                    <img
                        src={`assets/images/${icon}.svg`}
                        alt=""
                    />
                </div>
                <div className="filter-item__name">{label}</div>
                <div className="filter-item__arrow"></div>
            </div>
            <div className="filter-item__content">{children}</div>
        </div>
    )
})

export default FilterItem
