import React, { useEffect } from 'react'
import { useLocation, withRouter } from 'react-router-dom'

const ScrollToTop: React.FC = () => {
    const location = useLocation()

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        })
    }, [location.pathname])

    return null
}

export default withRouter(ScrollToTop)
