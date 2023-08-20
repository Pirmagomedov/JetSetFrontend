import React, { useState } from 'react'
import ClickAwayListener from 'react-click-away-listener'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import Icon from 'src/components/Icon/Icon'
import Avatar from 'src/components/Avatar/Avatar'
import { useRevokeToken } from 'src/generated/graphql'
import { logout } from 'src/reducers/userReducer'
import { AppDispatch, RootState } from 'src/store'
import './DealOptions.scss'

interface DealOptionsProps {
    dealId?: string
}

const DealOptions: React.FC<DealOptionsProps> = React.memo((props) => {
    const { dealId } = props
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { username, avatar } = useSelector(
        (state: RootState) => state.user.profile,
    )
    const [_, revokeToken] = useRevokeToken()
    const dispatch: AppDispatch = useDispatch()
    const history = useHistory()

    const handleLogOut = (e) => {
        e.preventDefault()

        revokeToken()
        dispatch(logout())
        history.push('/')
    }

    return (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
            <div className={`dealOptions ${isOpen ? 'dealOptions--open' : ''}`}>
                <div
                    className="dealOptions__icon"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Icon name="dealOptions" />
                </div>
                <div className="dealOptions__dropdown">
                    <ul className="dealOptions__list">
                        <li className="dealOptions__item">
                            <div
                                className="dealOptions__link"
                                onClick={() =>
                                    window.open(
                                        `/deal-calendar/${dealId}`,
                                        '_blank',
                                    )
                                }
                            >
                                <span className="dealOptions__title">
                                    Calendar
                                </span>
                            </div>
                        </li>
                        <li className="dealOptions__item">
                            <div
                                className="dealOptions__link"
                                onClick={() => {}}
                            >
                                <span className="dealOptions__title">
                                    Actions
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </ClickAwayListener>
    )
})

export default DealOptions
