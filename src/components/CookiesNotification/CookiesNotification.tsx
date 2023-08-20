import React from 'react'
import { useState } from 'react'
import './CookiesNotification.scss'
import Button from '../Button/Button'

const CookiesNotification: React.FC = () => {
    const [showCookies, setShowCookies] = useState(true)

    const handleClick = () => {
        setShowCookies(false)
    }

    return (
        <div
            className={`cookies__wrapper ${
                showCookies ? 'show__cookies' : 'hide__cookies'
            }`}
        >
            <div className="cookies__container">
                <div className="cookies__text">
                    This website utilizes cookies to enhance your browsing
                    experience and deliver tailored services. By continuing to
                    browse this site, you are consenting to the use of cookies
                    as described in this notice.
                </div>
                <div className="button__container">
                    <Button
                        onClick={handleClick}
                        type="white"
                        size="small"
                        className="transparent"
                    >
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CookiesNotification
