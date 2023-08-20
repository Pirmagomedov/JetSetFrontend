import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import MediaQuery from 'react-responsive'
import { Link } from 'react-router-dom'
import NotificationNotice from 'src/pages/Notifications/NotificationModal/NotificationNotice'
import ProductNotice from 'src/pages/Product/views/ProductNotice/ProductNotice'
import { RootState } from 'src/store'
import Icon from '../Icon/Icon'
import MobileMenu from '../MobileMenu/MobileMenu'
import './Header.scss'
import Logged from './views/Logged/Logged'

interface IHeaderProps {
    scrolledDown: boolean
    landing?: boolean
}

const Header: React.FC<IHeaderProps> = React.memo(
    ({ scrolledDown, landing }) => {
        const [isOpen, setIsOpen] = useState<boolean>(false)
        const isAuth = useSelector((state: RootState) => state.user.isAuth)
        const className: string =
            'header ' + (scrolledDown ? 'scrolled' : 'unscrolled')

        return (
            <div className={className}>
                <div className="container">
                    <div className="header__inner">
                        <div className="header__logo">
                            <Link to="/">
                                <img
                                    src={require('assets/images/Wingform.svg')}
                                    alt="Wingform"
                                    title="Home"
                                />
                            </Link>
                        </div>
                        {!landing && (
                            <>
                                <div className="header__menu">
                                    <div className="header__links">
                                        <Link to="/create-ad">
                                            Sell aircraft
                                        </Link>
                                        <Link to="/search">
                                            Buy aircraft
                                        </Link>
                                    </div>
                                    <div className="header__buttons">
                                        {isAuth ? (
                                            <Logged />
                                        ) : (
                                            <Link
                                                to="/login"
                                                className="btn btn-small"
                                            >
                                                Login
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                {!isOpen &&
                                    <div
                                        className="header__burger"
                                        onClick={() =>
                                            setIsOpen((s) => !s)
                                        }
                                    >
                                        <Icon name="i-menu" />
                                    </div>
                                }
                            </>
                        )}
                    </div>
                </div>
                {!landing && (
                    <>
                        <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
                        <ProductNotice />
                        <NotificationNotice />
                    </>
                )}
            </div>
        )
    },
)

export default Header
