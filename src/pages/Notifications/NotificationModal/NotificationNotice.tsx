import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'
import Icon from 'src/components/Icon/Icon'
import { noticeClose, noticeConfirm } from 'src/reducers/notificationNoticeReducer'
import { deleteNotification, makeSingleNotificationRead } from 'src/reducers/notificationsReducer'
import { AppDispatch, RootState } from 'src/store'
import { useProfile } from 'src/hooks'
import './NotificationNotice.scss'

const NotificationNotice: React.FC = React.memo(props => {
  const { isOpen, name, text, id, extra } = useSelector((state: RootState) => state.notificationNotice)
  const path = useLocation()
  const dispatch: AppDispatch = useDispatch()
  const router = useHistory()
  const profile = useProfile()

  const handleDelete = () => {
    dispatch(deleteNotification(id));
  };
  const classname = extra?.type

  if (classname === 'document_signed') {
    return
  }

  const notificationName = name
  const notificationText = text


  const closeModal = () => {
    dispatch(noticeClose())
  }

  const handleClick = () => {
    closeModal()
    dispatch(makeSingleNotificationRead(id, profile.id))
  }

  // Для проверки того, как вмещается текст и увеличивает уведомление
  // const testVal = 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ut inventore voluptate distinctio error ipsum non aut. Soluta quo aliquam neque, quasi, aut nulla sint temporibus libero laborum eum dolore voluptatibus!'
  // const testName = 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ut inventore voluptate distinctio error ipsum non aut.'

  return isOpen && path.pathname !== '/notifications' ? (
    <div className={`notice notice__notification ${classname}`}>
      <div className='notice__ico'>
        <Icon height={20} width={20} name={`${classname}Ico`} />
        <div className='notice__texts__header'>
          {/* {testName} */}
          {notificationName}
        </div>
        <div className='notice__ico__close' onClick={() => closeModal()}>
          <Icon name="i-close" />
        </div>
      </div>
      <div className='notice__texts'>
        <p
          className='notice__texts__text'
        >
          {notificationText}
          {/* {testVal} */}
        </p>
      </div>
      <div className='notice__actionButtons'>
        <div className='notice__actionButtons__btn' onClick={() => {
          router.push('/notifications')
          closeModal()

        }}>Learn More</div>
        <div className='notice__actionButtons__btn' onClick={() => {
          handleClick()
        }}>Got It</div>
      </div>

    </div>) : null
})

export default NotificationNotice
