import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { pd } from 'src/helper'
// import SubscribeModal from '../SubscribeModal/SubscribeModal'
import './MobileMenu.scss'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from 'src/reducers/userReducer'
import { AppDispatch, RootState } from '../../store'
import Avatar from '../Avatar/Avatar'
import { useRevokeToken } from 'src/generated/graphql'
import Icon from '../Icon/Icon'
import Button from '../Button/Button'
import WorkspaceSwitcher from 'src/components/WorkspaceSwitcher/WorkspaceSwitcher'
import { Dispatch, SetStateAction } from 'react'

interface IMobileMenuProps {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

const MobileMenu: React.FC<IMobileMenuProps> = React.memo((props) => {
    const { isOpen, setIsOpen } = props

    const isAuth = useSelector((state: RootState) => state.user.isAuth)
    const profile = useSelector((state: RootState) => state.user.profile)
    const [, setIsWorkspacesOpen] = useState<boolean>(false)
    const workspaces = profile?.workspaces
    const [_, revokeToken] = useRevokeToken()
    const dispatch: AppDispatch = useDispatch()
    const history = useHistory()
    const isNewNotifications = useSelector(
        (state: RootState) => state.notifications.isNewNotifications,
    )

    const handleLogOut = (event) => {
        event.preventDefault()
        revokeToken()
        dispatch(logout())
        history.push('/')
    }

    const handleLogin = (event) => {
        event.preventDefault()
        history.push('/login')
    }

    const handleSignUp = (event) => {
        event.preventDefault()
        history.push('/register')
    }

    const handleSell = (event) => {
        event.preventDefault()
        history.push('/create-ad')
    }


    const handleOpenMenu = () => {
        setIsWorkspacesOpen(false)
        setIsOpen(
            (prev) => {
                return !prev
            }
        )
    }

    const handleClose = () => {
        setIsWorkspacesOpen(false)
        setIsOpen((prev) => !prev)
    }

    return (
        <div className={`mobile-menu ${isOpen ? 'show' : ''}`}>
            <div className="mobile-menu__nav">
                <div
                    className="mobile-menu__nav__burger"
                    onClick={() =>
                        setIsOpen((s) => !s)
                    }
                >
                    <Icon name="i-close" />
                </div>
                <div className="mobile-menu__buttons">
                    {isAuth ? (
                        <>
                            <div className="logged__user">
                                {workspaces.length > 0 && (
                                    <WorkspaceSwitcher />
                                )}
                                <div
                                    className="logged__user"
                                    onClick={handleOpenMenu}
                                >
                                    {workspaces.length == 0 && (
                                        <Avatar
                                            className="logged__avatar"
                                            profile={profile}
                                        />
                                    )}
                                </div>
                            </div>
                            <ul className="logged__list">

                                <li className="logged__item">
                                    <Link
                                        className="logged__link"
                                        to="/profile"
                                    >
                                        <Icon
                                            name="i-profile"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Workspaces
                                        </span>
                                    </Link>
                                </li>

                                <li className="logged__item">
                                    <Link
                                        className="logged__link"
                                        to="/create-ad"
                                    >
                                        <Icon
                                            name="add"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Sell my aircraft
                                        </span>
                                    </Link>
                                </li>

                                <li className="logged__item">
                                    <Link
                                        className="logged__link"
                                        to="/inventory"
                                    >
                                        <Icon
                                            name="i-inventory"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Inventory
                                        </span>
                                    </Link>
                                </li>

                                <li className="logged__item">
                                    <Link
                                        className="logged__link"
                                        to="/deals"
                                    >
                                        <Icon
                                            name="i-deals"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Deals
                                        </span>
                                    </Link>
                                </li>

                                {/* <li className="logged__item">
                                    <Link
                                        className="logged__link"
                                        to="/messages"
                                    >
                                        <Icon
                                            name="i-messages"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Messages
                                        </span>
                                    </Link>
                                </li> */}

                                <li className="logged__item">
                                    <Link
                                        className="logged__link"
                                        to="/vault"
                                    >
                                        <Icon
                                            name="i-jeto"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Vault
                                        </span>
                                    </Link>
                                </li>
                                {/* 
                                <li className="logged__item hidden">
                                    <Link
                                        className="logged__link"
                                        to="/favorites"
                                    >
                                        <Icon
                                            name="i-favorites"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Favorites
                                        </span>
                                    </Link>
                                </li> */}
                                {/* <li className="logged__item hidden">
                                    <Link
                                        className="logged__link"
                                        to="/compare"
                                    >
                                        <Icon
                                            name="i-compare"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Compare
                                        </span>
                                    </Link>
                                </li> */}
                                <li className="logged__item">
                                    <Link
                                        className="logged__link"
                                        to="/notifications"
                                    >
                                        {isNewNotifications ? (
                                            <Icon className="logged__icon" name="NotificationsBell" width={12} height={12} />
                                        ) : (
                                            <Icon className="logged__icon" name="NotificationsBellWithoutDot" width={12} height={12} />
                                        )}
                                        <span className="logged__title">
                                            Notifications
                                        </span>
                                    </Link>
                                </li>
                                <li className="logged__item"><hr /></li>
                                <li className="logged__item">
                                    <Link
                                        className="logged__link"
                                        to="/help"
                                    >
                                        <Icon
                                            name="i-help"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            About
                                        </span>
                                    </Link>
                                </li>
                                <li className="logged__item">
                                    <Link
                                        className="logged__link"
                                        to="/info"
                                    >
                                        <Icon
                                            name="i-help"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Info
                                        </span>
                                    </Link>
                                </li>
                                <li className="logged__item">
                                    <Link
                                        className="logged__link"
                                        to="/help/wf-videos"
                                    >
                                        <Icon
                                            name="i-help"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Tutorial
                                        </span>
                                    </Link>
                                </li>
                                <li className="logged__item"><hr /></li>
                                <li className="logged__item logged__item--logout">
                                    <a
                                        className="logged__link"
                                        href="#"
                                        onClick={handleLogOut}
                                    >
                                        <Icon
                                            name="i-logout"
                                            className="logged__icon"
                                        />
                                        <span className="logged__title">
                                            Log out
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </>
                    ) : (
                        <div className="unlogged">
                            <Button onClick={handleLogin}>Login</Button>
                            <Button onClick={handleSignUp}>Sign Up</Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="mobile-menu__footer">
                {isAuth ? (
                    <></>
                ) : (
                    <>
                        <div className="mobile-menu__logo">
                            <Link to="/">
                                <img
                                    src={require('assets/images/Wingform.svg')}
                                    alt="Wingform"
                                />
                            </Link>
                        </div>
                        <div className="mobile-menu__info">
                            <a
                                href="https://wingform.com/assets/docs/Privacy_Policy_Wingform.pdf"
                                target="_blank"
                            >
                                Privacy policy
                            </a>
                            <a
                                href="https://wingform.com/assets/docs/Terms_Of_Use_Wingform.pdf"
                                target="_blank"
                            >
                                Terms of use
                            </a>
                            <a
                                href="https://wingform.com/assets/docs/Terms_Of_Transactions_Wingform.pdf"
                                target="_blank"
                            >
                                Terms of transactions
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
})

export default MobileMenu
