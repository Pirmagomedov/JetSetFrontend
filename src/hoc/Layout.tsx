import React, { useEffect, useState } from 'react'
import Footer from 'src/components/Footer/Footer'
import Header from 'src/components/Header/Header'
import { useLocation } from 'react-router-dom'
import { useRevokeToken } from 'src/generated/graphql'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/store'
import { logout } from '../reducers/userReducer'
import Chats from 'src/components/Chats/Chats'

const locationClassHelper = (path: string): string => {
    const locArray = path.split('/')
    if (locArray.length > 1) {
        if (locArray[0] == '') {
            return locArray[1]
        }
        return locArray[0]
    }
    return locArray[0]
}

interface ILayout {
    landing?: boolean
    children: JSX.Element | JSX.Element[]
    hideFooter?: boolean
}

const Layout: React.FC<ILayout> = React.memo(({ children, landing, hideFooter = false }) => {
    const [scrolledDown, setScrolledDown] = useState<boolean>(false)

    const location = useLocation()
    const locationClass = landing
        ? 'landing'
        : locationClassHelper(location.pathname)
    const [inactivity, setInactivity] = useState(0)
    const [_, revokeToken] = useRevokeToken()
    const dispatch: AppDispatch = useDispatch()
    const history = useHistory()
    const { isAuth } = useSelector((state: RootState) => state.user)

    const handleLogOut = () => {
        console.log('HANDLE LOGOUT BY TIMEOUT!')
        revokeToken()
        dispatch(logout())
        history.push('/')
    }

    useEffect(() => {
        const win: Window = window

        const handleWindowScroll: EventListener = (e: Event) => {
            setInactivity((v) => 0)
            if (win.scrollY > 5) {
                setScrolledDown(true)
            } else {
                setScrolledDown(false)
            }
        }

        const handleResetInactivity: EventListener = (e: Event) => {
            setInactivity((v) => 0)
        }

        win.addEventListener('scroll', handleWindowScroll)
        win.addEventListener('click', handleResetInactivity)

        const interval = setInterval(() => {
            setInactivity((v) => v + 1)
        }, 10000)

        /*window.chatbaseConfig = {
      chatbotId: "white-paper-jetset-3-0--docx-ntzdcxtlp",
    }
    const script = document.createElement('script')
    script.src = "https://www.chatbase.co/embed.min.js"
    script.id = "white-paper-jetset-3-0--docx-ntzdcxtlp"
    script.defer = true

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }*/

        return () => {
            clearInterval(interval)
            window.removeEventListener('scroll', handleWindowScroll)
            window.removeEventListener('click', handleResetInactivity)
        }
    }, [])

    useEffect(() => {
        if (inactivity > 6 * 60 && isAuth) {
            handleLogOut()
        }
    }, [inactivity])

    return (
        <div className="container">
            <div className={`wrapper path-${locationClass}`}>
                <Header
                    landing={landing}
                    scrolledDown={scrolledDown}
                />
                {!landing && <Chats />}
                <main
                    className="main"
                    role="main"
                >
                    {children}
                </main>
                {(!landing && !hideFooter) && <Footer />}
            </div>
        </div>
    )
})

export default Layout
