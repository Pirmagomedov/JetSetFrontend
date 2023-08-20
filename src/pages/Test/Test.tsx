import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Layout from 'src/hoc/Layout'
import { chatsCreateRoom } from 'src/reducers/chatsReducer'
import { AppDispatch, RootState } from 'src/store'
import Chats from 'src/components/Chats/Chats'
import './Test.scss'

const Test: React.FC = React.memo(props => {

  const dispatch: AppDispatch = useDispatch()
  const chats = useSelector((state: RootState) => state.chats)

  const createChat = () => {
    dispatch(chatsCreateRoom('696340cc-f227-4f94-8350-4e7dfd698f2c','ca0a3179-41f2-439c-a87b-5ee8aa587c8b', 'Chat title', {
        key: 'Tests tasd 14235',
        type: 'AD',
        title: 'The title'
    }))
  }

  return (
    <Layout>
        <div className="container">
          <div>
            {JSON.stringify(chats)}
            <iframe
            src="https://www.chatbase.co/chatbot-iframe/white-paper-jetset-3-0--docx-ntzdcxtlp"
            width="100%"
            height="700"
            ></iframe>
          </div>
        </div>
    </Layout>
  )
})

export default Test