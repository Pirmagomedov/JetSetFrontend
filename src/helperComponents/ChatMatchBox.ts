import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
//import { useGetChoices, useMyProfile } from 'src/generated/graphql'
//import {  } from '../reducers/chatsReducer'
import { AppDispatch, RootState } from '../store'

const ChatMatchBox = () => {
    const dispatch: AppDispatch = useDispatch()
    const isAuth = useSelector((state: RootState) => state.user.isAuth)

    return null
}

export default ChatMatchBox
