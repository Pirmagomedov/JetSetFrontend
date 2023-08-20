import React, { useEffect } from 'react'
import ReactModal from 'react-modal'
import Icon from 'src/components/Icon/Icon'
import Button, { ButtonType } from 'src/components/Button/Button'
import './Modal.scss'

export interface IModalButton {
    onClick: () => void
    title: string
    type?: ButtonType
}

interface IModal {
    title?: string
    modalIsOpen: boolean
    icon?: string
    isCloseIcon?: boolean
    className?: string
    onRequestClose: () => void
    children?: React.ReactNode
    buttons?: IModalButton[]
}

const Modal: React.FC<IModal> = (props) => {
    const {
        title,
        icon,
        modalIsOpen,
        onRequestClose,
        children,
        isCloseIcon = true,
        className = '',
        buttons,
    } = props

    useEffect(() => {
        document.body.style.setProperty(
            '--scrollbarWidth',
            `${window.innerWidth - document.documentElement.clientWidth}px`,
        )
    }, [])

    return (
        <ReactModal
            isOpen={modalIsOpen}
            onRequestClose={onRequestClose}
            shouldCloseOnOverlayClick={true}
        >
            <div className={`modal ${className}`}>
                <div className="modal__header">
                    {title && (
                        <div className="modal__title">
                            {icon && (
                                <div className="modal__title-icon">
                                    <Icon name={icon} />
                                </div>
                            )}
                            <div className="modal__title-text">{title}</div>
                        </div>
                    )}
                    {isCloseIcon ? (
                        <div
                            className="modal__close"
                            onClick={() => onRequestClose()}
                        >
                            <Icon name="i-close" />
                        </div>
                    ) : null}
                </div>
                <div className="modal__content">{children}</div>
                {buttons && (
                    <div className="modal__footer">
                        {buttons.map((button, index) => (
                            <div
                                key={`button${index}`}
                                className="modal__button-wrapper"
                            >
                                <Button
                                    type={button.type}
                                    onClick={button.onClick}
                                >
                                    {button.title}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ReactModal>
    )
}

export default Modal
