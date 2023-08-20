import React, { useState } from 'react'
import ClickAwayListener from 'react-click-away-listener'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import Icon from 'src/components/Icon/Icon'
import Avatar from 'src/components/Avatar/Avatar'
import { useRevokeToken } from 'src/generated/graphql'
import { logout } from 'src/reducers/userReducer'
import { AppDispatch, RootState } from 'src/store'
import WorkspaceSwitcher from 'src/components/WorkspaceSwitcher/WorkspaceSwitcher'
import { useProfile } from 'src/hooks'
import ChatsButton from 'src/components/Header/views/ChatsButton/ChatsButton'

import './Logged.scss'

const Logged: React.FC = React.memo((props) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isWorkspacesOpen, setIsWorkspacesOpen] = useState<boolean>(false)
    const profile = useProfile()
    const workspaces = profile?.workspaces
    const [_, revokeToken] = useRevokeToken()
    const dispatch: AppDispatch = useDispatch()
    const history = useHistory()
    const isNewNotifications = useSelector(
        (state: RootState) => state.notifications.isNewNotifications,
    )

    const handleClose = () => {
        setIsWorkspacesOpen(false)
        setIsOpen(false)
    }

    const handleOpenSwitcher = () => {
        setIsWorkspacesOpen(!isWorkspacesOpen)
        setIsOpen(false)
    }

    const handleOpenMenu = () => {
        setIsWorkspacesOpen(false)
        setIsOpen(!isOpen)
    }

    const handleLogOut = (e) => {
        e.preventDefault()

        revokeToken()
        dispatch(logout())
        history.push('/')
    }

    const goToNotifications = () => {
        history.push('/notifications')
    }

    const goToDeals = () => {
        history.push('/deals')
    }

    return (
        <ClickAwayListener onClickAway={handleClose}>
            <div className={`logged ${isOpen ? 'logged--open' : ''}`}>
                <div className="logged__buttons">

                    <div
                        className="logged__deals"
                        onClick={() => goToDeals()}
                        title="Open Deals"
                    >
                        <Icon name="i-deals" width={20} height={20} />
                    </div>
                    <ChatsButton />
                    <div
                        className="logged__notifications"
                        onClick={() => goToNotifications()}
                        title="Open Notifications"
                    >
                        {/* <Avatar className="logged__avatar" name={username} photo={avatar?.link} /> */}
                        {isNewNotifications ? (
                            <Icon name="NotificationsBell" width={16} height={16} />
                        ) : (
                            <Icon name="NotificationsBellWithoutDot" width={16} height={16} />
                        )}
                    </div>
                </div>
                {workspaces.length > 0 && (
                    <WorkspaceSwitcher
                        onSwitch={handleClose}
                        onClick={handleOpenSwitcher}
                        open={isWorkspacesOpen}
                    />
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
                    <Icon name="i-menu" />
                </div>

                <div className="logged__dropdown">
                    <ul className="logged__list">
                        <li className="logged__item">
                            <Link
                                className="logged__link"
                                to="/profile"
                            >
                                {/*<Icon
                                    name="i-profile"
                                    className="logged__icon"
                                />*/}
                                <span className="logged__title">
                                    Workspaces
                                </span>
                            </Link>
                        </li>
                        <li className="logged__item">
                            <Link
                                className="logged__link"
                                to="/inventory"
                            >
                                {/*<Icon
                                    name="i-inventory"
                                    className="logged__icon"
                                />*/}
                                <span className="logged__title">Inventory</span>
                            </Link>
                        </li>
                        <li className="logged__item">
                            <Link
                                className="logged__link"
                                to="/deals"
                            >
                                {/*<Icon
                                    name="i-deals"
                                    className="logged__icon"
                                />*/}
                                <span className="logged__title">Deals</span>
                            </Link>
                        </li>
                        <li className="logged__item">
                            <Link
                                className="logged__link"
                                to="/vault"
                            >
                                {/*<Icon
                                    name="i-jeto"
                                    className="logged__icon"
                                />*/}
                                <span className="logged__title">Vault</span>
                            </Link>
                        </li>
                        <li className="logged__item hidden">
                            <Link
                                className="logged__link"
                                to="/favorites"
                            >
                                {/*<Icon
                                    name="i-favorites"
                                    className="logged__icon"
                                />*/}
                                <span className="logged__title">Favorites</span>
                            </Link>
                        </li>
                        <li className="logged__item hidden">
                            <Link
                                className="logged__link"
                                to="/compare"
                            >
                                {/*<Icon
                                    name="i-compare"
                                    className="logged__icon"
                                />*/}
                                <span className="logged__title">Compare</span>
                            </Link>
                        </li>
                        <li className="logged__item"><hr /></li>
                        <li className="logged__item">
                            <Link
                                className="logged__link"
                                to="/help"
                            >
                                {/*<Icon
                                    name="i-help"
                                    className="logged__icon"
                                />*/}
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
                                {/*<Icon
                                    name="i-help"
                                    className="logged__icon"
                                />*/}
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
                                {/*<Icon
                                    name="i-play"
                                    className="logged__icon"
                                />*/}
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
                                {/*<Icon
                                    name="i-logout"
                                    className="logged__icon"
                                />*/}
                                <span className="logged__title">Log out</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </ClickAwayListener>
    )
})

export default Logged
