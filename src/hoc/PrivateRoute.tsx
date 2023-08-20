import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, Route, RouteProps, useHistory } from 'react-router-dom'
import { useVerifyToken } from 'src/generated/graphql'
import { setVerifyLoader } from 'src/reducers/loaderReducer'
import { AppDispatch, RootState } from 'src/store'

interface IPrivateRoute extends RouteProps {}

const PrivateRoute: React.FC<IPrivateRoute> = (props) => {
    const [isSuccess, setSuccess] = useState<boolean>()
    const [, verifyToken] = useVerifyToken()
    const [prevToken, setPrevToken] = useState<string>(null)
    const { isAuth, token } = useSelector((state: RootState) => state.user)
    const history = useHistory()
    const dispatch: AppDispatch = useDispatch()

    const verify = () => {
        if (isAuth === undefined) {
            return false
        }

        if (isAuth === null) {
            history.push('/login')
            return false
        }

        if (prevToken === null) {
            dispatch(setVerifyLoader(true))
        }

        verifyToken({ token })
            .then((res) => {
                setSuccess(res.data.verifyToken.success)
                if (prevToken === null) {
                    dispatch(setVerifyLoader(false))
                }
                setPrevToken(token)
            })
            .catch((err) => {
                console.error(err)
                dispatch(setVerifyLoader(false))
                history.push('/login')
            })
    }

    useEffect(() => {
        verify()
    }, [isAuth])

    if (isSuccess !== undefined) {
        return isSuccess ? <Route {...props} /> : <Redirect to="/login" />
    }

    return null
}

export default PrivateRoute
