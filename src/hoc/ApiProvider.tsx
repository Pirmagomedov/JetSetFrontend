import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAuth } from 'src/reducers/userReducer'
import { AppDispatch, RootState } from 'src/store'
import { createClient, Provider } from 'urql'

const ApiProvider = ({ children }) => {
    const token = useSelector((state: RootState) => state.user.token)
    const [client, setclient] = useState(null)
    const dispatch: AppDispatch = useDispatch()

    useEffect(() => {
        // Creating new client depending on token
        setclient(() =>
            createClient({
                url: '/graphql',
                fetchOptions: {
                    credentials: 'include',
                    headers: {
                        authorization: token ? `JWT ${token}` : '',
                    },
                },
            }),
        )
        // Giving information about logging state. Next logig in AuthMonitor.tsx
        if (token !== undefined) {
            dispatch(setAuth(!!token))
        }

        return () => {
            setclient(null)
        }
    }, [token])

    return client ? <Provider value={client}>{children}</Provider> : null
}

export default ApiProvider
