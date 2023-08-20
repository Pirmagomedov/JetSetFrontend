import React from 'react'
import { useSelector } from 'react-redux'
import { Redirect, Route } from 'react-router-dom'
import { RootState } from 'src/store'

interface IPublicRoute {
    path: string
    component: React.FC
}

const PublicRoute: React.FC<IPublicRoute> = (props) => {
    const { isAuth } = useSelector((state: RootState) => state.user)

    if (isAuth !== undefined) {
        return !isAuth ? <Route {...props} /> : <Redirect to="/" />
    }

    return null
}

export default PublicRoute
