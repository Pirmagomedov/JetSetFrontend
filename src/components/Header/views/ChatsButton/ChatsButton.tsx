import React, { useState } from 'react'
import Icon from 'src/components/Icon/Icon'
import { toggleOpen } from 'src/reducers/chatsReducer'
import { AppDispatch, RootState } from 'src/store'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'src/components/Modal/Modal'
import './ChatsButton.scss'

const ChatsButton: React.FC = (props) => {
    const dispatch: AppDispatch = useDispatch()
    const chats = useSelector((state: RootState) => state.chats)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    const handleToggleChats = () => {
        if (chats.chats.length > 0) {
            dispatch(toggleOpen())
        } else {
            setIsModalOpen(true)
        }
    }

    return (
        <>
            <div
                className={`chats-button ${
                    chats.chats.length > 0 ? 'has-chats' : 'no-chats'
                }`}
                onClick={handleToggleChats}
                title="Open Chats"
            >
                <div className="chats-button__count">
                    {chats.unread > 0 ? chats.unread : null}
                </div>
                <Icon name="i-chat-icon" width={24} height={24} />
            </div>
            <Modal
                title="Info"
                className="modal verification-passed"
                modalIsOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                isCloseIcon={true}
            >
                You have no chats yet
            </Modal>
        </>
    )
}

export default ChatsButton
