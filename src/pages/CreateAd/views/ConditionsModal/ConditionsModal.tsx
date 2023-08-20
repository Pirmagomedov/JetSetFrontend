import React from 'react'
import Icon from 'src/components/Icon/Icon'
import Modal from 'src/components/Modal/Modal'

interface IConditionsModal {
  modalIsOpen: boolean
  closeModal: () => void
}

const ConditionsModal: React.FC<IConditionsModal> = props => {
  const { modalIsOpen, closeModal } = props

  return (
    <Modal className="modal-help" modalIsOpen={modalIsOpen} onRequestClose={closeModal}>
      <div className="modal-help__close" onClick={() => closeModal()}>
        <Icon name="i-close" />
      </div>
      <div className="modal-help__title">Need some help with this step?</div>
      <div className="modal-help__content">
        <div className="modal-help__item">
          <div className="modal-help__subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit</div>
          <p className="modal-help__text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pulvinar ipsum eget urna aliquam, scelerisque laoreet nulla
            congue. Aliquam sed mi sit amet massa malesuada vehicula sit amet eu nunc. Quisque semper leo non ligula pretium, ut malesuada
            ligula elementum. Etiam arcu erat, fermentum sit amet imperdiet sit amet, placerat vel arcu. Phasellus eu eros ac orci tincidunt
            luctus ut in leo. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis quis ornare
            quam, a blandit lacus. Aenean faucibus facilisis dapibus.
          </p>
          <p className="modal-help__text">
            Integer vitae imperdiet justo, vel mollis tellus. Sed auctor nunc ut tincidunt tincidunt. Aliquam turpis nunc, facilisis eget
            sagittis non, facilisis sit amet leo. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Aliquam porttitor ullamcorper erat, ut malesuada magna. Mauris cursus dui quis leo ultrices luctus. Mauris ultricies massa ut
            malesuada dignissim. Nulla augue quam, eleifend ut luctus vel, molestie ut felis. Duis eu dolor mauris. Phasellus vitae ipsum
            velit. Aliquam consequat diam et neque rutrum ornare.
          </p>
        </div>
        <div className="modal-help__item">
          <div className="modal-help__subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit</div>
          <p className="modal-help__text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pulvinar ipsum eget urna aliquam, scelerisque laoreet nulla
            congue. Aliquam sed mi sit amet massa malesuada vehicula sit amet eu nunc. Quisque semper leo non ligula pretium, ut malesuada
            ligula elementum. Etiam arcu erat, fermentum sit amet imperdiet sit amet, placerat vel arcu. Phasellus eu eros ac orci tincidunt
            luctus ut in leo. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis quis ornare
            quam, a blandit lacus. Aenean faucibus facilisis dapibus.
          </p>
          <p className="modal-help__text">
            Integer vitae imperdiet justo, vel mollis tellus. Sed auctor nunc ut tincidunt tincidunt. Aliquam turpis nunc, facilisis eget
            sagittis non, facilisis sit amet leo. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Aliquam porttitor ullamcorper erat, ut malesuada magna. Mauris cursus dui quis leo ultrices luctus. Mauris ultricies massa ut
            malesuada dignissim. Nulla augue quam, eleifend ut luctus vel, molestie ut felis. Duis eu dolor mauris. Phasellus vitae ipsum
            velit. Aliquam consequat diam et neque rutrum ornare.
          </p>
        </div>
        <div className="modal-help__item">
          <div className="modal-help__subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit</div>
          <p className="modal-help__text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pulvinar ipsum eget urna aliquam, scelerisque laoreet nulla
            congue. Aliquam sed mi sit amet massa malesuada vehicula sit amet eu nunc. Quisque semper leo non ligula pretium, ut malesuada
            ligula elementum. Etiam arcu erat, fermentum sit amet imperdiet sit amet, placerat vel arcu. Phasellus eu eros ac orci tincidunt
            luctus ut in leo. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis quis ornare
            quam, a blandit lacus. Aenean faucibus facilisis dapibus.
          </p>
          <p className="modal-help__text">
            Integer vitae imperdiet justo, vel mollis tellus. Sed auctor nunc ut tincidunt tincidunt. Aliquam turpis nunc, facilisis eget
            sagittis non, facilisis sit amet leo. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Aliquam porttitor ullamcorper erat, ut malesuada magna. Mauris cursus dui quis leo ultrices luctus. Mauris ultricies massa ut
            malesuada dignissim. Nulla augue quam, eleifend ut luctus vel, molestie ut felis. Duis eu dolor mauris. Phasellus vitae ipsum
            velit. Aliquam consequat diam et neque rutrum ornare.
          </p>
        </div>
        <div className="modal-help__item">
          <div className="modal-help__subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit</div>
          <p className="modal-help__text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pulvinar ipsum eget urna aliquam, scelerisque laoreet nulla
            congue. Aliquam sed mi sit amet massa malesuada vehicula sit amet eu nunc. Quisque semper leo non ligula pretium, ut malesuada
            ligula elementum. Etiam arcu erat, fermentum sit amet imperdiet sit amet, placerat vel arcu. Phasellus eu eros ac orci tincidunt
            luctus ut in leo. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis quis ornare
            quam, a blandit lacus. Aenean faucibus facilisis dapibus.
          </p>
          <p className="modal-help__text">
            Integer vitae imperdiet justo, vel mollis tellus. Sed auctor nunc ut tincidunt tincidunt. Aliquam turpis nunc, facilisis eget
            sagittis non, facilisis sit amet leo. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Aliquam porttitor ullamcorper erat, ut malesuada magna. Mauris cursus dui quis leo ultrices luctus. Mauris ultricies massa ut
            malesuada dignissim. Nulla augue quam, eleifend ut luctus vel, molestie ut felis. Duis eu dolor mauris. Phasellus vitae ipsum
            velit. Aliquam consequat diam et neque rutrum ornare.
          </p>
        </div>
        <div className="modal-help__item">
          <div className="modal-help__subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit</div>
          <p className="modal-help__text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pulvinar ipsum eget urna aliquam, scelerisque laoreet nulla
            congue. Aliquam sed mi sit amet massa malesuada vehicula sit amet eu nunc. Quisque semper leo non ligula pretium, ut malesuada
            ligula elementum. Etiam arcu erat, fermentum sit amet imperdiet sit amet, placerat vel arcu. Phasellus eu eros ac orci tincidunt
            luctus ut in leo. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis quis ornare
            quam, a blandit lacus. Aenean faucibus facilisis dapibus.
          </p>
          <p className="modal-help__text">
            Integer vitae imperdiet justo, vel mollis tellus. Sed auctor nunc ut tincidunt tincidunt. Aliquam turpis nunc, facilisis eget
            sagittis non, facilisis sit amet leo. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Aliquam porttitor ullamcorper erat, ut malesuada magna. Mauris cursus dui quis leo ultrices luctus. Mauris ultricies massa ut
            malesuada dignissim. Nulla augue quam, eleifend ut luctus vel, molestie ut felis. Duis eu dolor mauris. Phasellus vitae ipsum
            velit. Aliquam consequat diam et neque rutrum ornare.
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default ConditionsModal
