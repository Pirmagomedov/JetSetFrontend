import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGetChoices, useMyProfile } from 'src/generated/graphql'
import { setChoices } from 'src/reducers/choicesReducer'
import { setProfileLoader } from '../reducers/loaderReducer'
import { logout, setProfile } from '../reducers/userReducer'
import { AppDispatch, RootState } from '../store'

const AuthMonitor = () => {
    const dispatch: AppDispatch = useDispatch()
    const isAuth = useSelector((state: RootState) => state.user.isAuth)
    const [, getProfile] = useMyProfile()
    const [, getChoices] = useGetChoices()

    useEffect(() => {
        //TODO: переписать нормально, это грязный быстрый вариант
        const choicesKey = 'a-choices-100'
        const choicesTimeKey = `${choicesKey}Date`
        const lastChoicesUpdate = +localStorage.getItem(choicesTimeKey)
        const currentTime = new Date().getTime()
        if (
            !lastChoicesUpdate ||
            lastChoicesUpdate + 1 * 60 * 60 * 1000 < currentTime
        ) {
            getChoices()
                .then((res) => {
                    const response = res.data.getChoices
                    const runtimeError = response.runtimeError
                    if (runtimeError) {
                        console.error(
                            `$[${runtimeError.exception}]: ${runtimeError.message}`,
                        )
                        return false
                    }
                    console.log(response.choices)
                    localStorage.setItem(choicesTimeKey, `${currentTime}`)
                    localStorage.setItem(
                        choicesKey,
                        JSON.stringify(response.choices),
                    )
                    dispatch(setChoices(response.choices))
                })
                .catch((error) => console.error(error))
        } else {
            const choicesData = JSON.parse(localStorage.getItem(choicesKey))
            dispatch(setChoices(choicesData))
        }
    }, [])

    useEffect(() => {
        if (isAuth !== undefined) {
            if (isAuth) {
                getProfile().then((res) => {
                    const response = res.data.myProfile
                    const runtimeError = response.runtimeError

                    if (runtimeError) {
                        console.error(
                            `$[${runtimeError.exception}]: ${runtimeError.message}`,
                        )
                        dispatch(setProfileLoader(false))
                        return false
                    }
                    dispatch(setProfile(response.profile))
                    dispatch(setProfileLoader(false))
                })
            } else {
                dispatch(logout())
                dispatch(setProfileLoader(false))
            }
        }
    }, [isAuth])

    return null
}

export default AuthMonitor
