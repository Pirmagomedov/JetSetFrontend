import React from 'react'
import { Link } from 'react-router-dom'
import Icon from 'src/components/Icon/Icon'
import './CabinetNav.scss'

interface ICabinetNavProps {
    page: string
}

const links: Array<{ label: string; link: string }> = [
    //{ label: 'Profile', link: 'profile' },
    { label: 'Inventory', link: 'inventory' },
    { label: 'Deals', link: 'deals' },
    { label: 'Vault', link: 'vault' },
    // { label: 'Messages', link: 'messages' },
    // { label: 'Settings', link: 'settings' },
]

const CabinetNav: React.FC<ICabinetNavProps> = React.memo((props) => {
    const { page } = props
    return (
        page !== 'profile' && (
            <div className="cabinet-nav">
                <div className="cabinet-nav__inner">
                    {links.map(({ label, link }) => {
                        return (
                            <Link
                                key={label}
                                to={`/${link}`}
                                className={`cabinet-nav__item ${link.toLowerCase() === page ? 'active' : ''
                                    }`}
                            >
                                {/* <Icon className="cabinet-nav__icon" name={`i-${label.toLowerCase()}`} /> */}

                                <div className="cabinet-nav__text">{label}</div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        )
    )
})

export default CabinetNav
