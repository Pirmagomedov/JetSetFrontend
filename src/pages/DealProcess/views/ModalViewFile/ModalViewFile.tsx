import React from 'react'
import Modal from 'react-modal'
import Icon from 'src/components/Icon/Icon'
import { UploadedFileType } from 'src/generated/graphql'
import {
  getImageLink,
  ImageStyles
} from 'src/helper'
import './ModalViewFile.scss'

interface IModalViewFile {
  viewFile: UploadedFileType
  modalIsOpen: boolean
  closeModal: () => void
}

const ModalViewFile: React.FC<IModalViewFile> = props => {
  const { viewFile, modalIsOpen, closeModal } = props

  return (
    <Modal isOpen={modalIsOpen} onRequestClose={closeModal} shouldCloseOnOverlayClick={false}>
      <div className="modal modal-view-file">
        <div className="modal-view-file__close" onClick={() => closeModal()}>
          <Icon name="i-close" />
        </div>
        <div className="modal-view-file__content">
          <img src={getImageLink(viewFile, ImageStyles.W1280)} />
        </div>
      </div>
    </Modal>
  )
}

export default ModalViewFile
