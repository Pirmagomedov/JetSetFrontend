import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useRefreshToken } from '../generated/graphql'
import { logout, setToken } from '../reducers/userReducer'
import { AppDispatch } from '../store'

const SilentRefresh = () => {
    const dispatch: AppDispatch = useDispatch()
    const [, refreshToken] = useRefreshToken()

    const refresh = () => {
        refreshToken()
            .then((res) => {
                const token = res?.data?.refreshToken?.token
                dispatch(setToken(token))
            })
            .catch((err) => {
                console.error(err)
                dispatch(logout())
            })
    }

    useEffect(() => {
        refresh()
        const updateTimer = setInterval(() => {
            refresh()
        }, 1000 * 60 * 30)

        return () => clearInterval(updateTimer)
    }, [])

    return null
}

export default SilentRefresh
