import React, { useState } from 'react'   
import CardImage from 'src/components/CardImage/CardImage'
import Modal from 'src/components/Modal/Modal'
import Icon from 'src/components/Icon/Icon'
import Button from 'src/components/Button/Button'
import { useHistory } from 'react-router'
import {
  useProfile,
  useCurrentWorkspace
} from 'src/hooks'


const DemoDeal: React.FC = (props) => {
    const currentWorkspace = useCurrentWorkspace()
    const [ demoModal, setDemoModal ] = useState<boolean>(false)
    const [isAircraftDocsOpen, setIsAircraftDocsOpen] = useState(false)
    const [isSignedDocsOpen, setIsSignedDocsOpen] = useState(false)
    const router = useHistory()
    const title = 'Wright flyer'

    const handleAircraftDocs = () => {
        setIsAircraftDocsOpen(prev => !prev)
    }

    const handleSignedDocs = () => {
        setIsSignedDocsOpen(prev => !prev)
    }

    const demoUser = () => {
        setDemoModal(true)
    }

    const demoProduct = () => {
        setDemoModal(true)
    }

    const demoCalendar = () => {
        setDemoModal(true)
    }

    const demoDocument = () => {
        setDemoModal(true)
    }

    const handleWorkspacesOpen = () => {
        router.push('/profile')
    }


    return (
        <div className={'deal-card'} id={`deal-0-ad-0`}>
          <div className="deal-card__wrapper">
            <div className="deal-card__image">
              <CardImage
                ratio={1.6}
                src={'/assets/demo/flyer.gif'}
                onClick={demoProduct}
                title={title}
              />
              <div
                className="avatar deal-card__avatar clickable"
                onClick={demoUser}
              >
                <div className="avatar__photo">
                  <img
                      src={'/assets/images/og.png'}
                      alt={'wingform.com'}
                  />
                </div>
                <div className="avatar__name">Wingform.com</div>
              </div>
            </div>

            <div className="deal-card__body">
              <div className="deal-card__content">
                <div className="deal-card__title">
                  <div className="deal-card__title__main">
                    <div className={`deal-card__label deal-card-label--sell`}>
                      DEMO
                    </div>
                    <div className="deal-card__ad-title">
                      {title}
                    </div>
                  </div>
                </div>
                <div className="deal-steps deal-steps-short">
                  <div className="deal-steps__steps">
                    <div className="deal-steps__step step-virtual step-passed">
                      <div className="deal-steps__step__mark"></div>
                      <div className="deal-steps__step__title">Reservation</div>
                    </div>
                    <div className="deal-steps__step step-current">
                      <div className="deal-steps__step__mark"></div>
                      <div className="deal-steps__step__title">Terms &amp; Conditions</div>
                    </div>
                    <div className="deal-steps__step">
                      <div className="deal-steps__step__mark"></div>
                      <div className="deal-steps__step__title">Aircraft Purchase Agreement</div>
                    </div>
                    <div className="deal-steps__step">
                      <div className="deal-steps__step__mark"></div>
                      <div className="deal-steps__step__title">Pre-Purchase Inspection</div>
                    </div>
                    <div className="deal-steps__step">
                      <div className="deal-steps__step__mark"></div>
                      <div className="deal-steps__step__title">Technical Acceptance</div>
                    </div>
                    <div className="deal-steps__step step-virtual step-excluded">
                      <div className="deal-steps__step__mark"></div>
                      <div className="deal-steps__step__title">Removal of discrepancies</div>
                    </div>
                    <div className="deal-steps__step">
                      <div className="deal-steps__step__mark"></div>
                      <div className="deal-steps__step__title">Final payment</div>
                    </div>
                    <div className="deal-steps__step">
                      <div className="deal-steps__step__mark"></div>
                      <div className="deal-steps__step__title">Pre-Closing obligations</div>
                    </div>
                    <div className="deal-steps__step">
                      <div className="deal-steps__step__mark"></div>
                      <div className="deal-steps__step__title">Closing</div>
                    </div>
                  </div>
                  <div className="deal-steps__status">Terms &amp; Conditions</div>
                </div>
              </div>
              <div className="deal-card__info">
                  <div className="deal-card-title">
                    <div className="deal-card__message">
                        <Icon name="dealAction"/>

                        Waiting for the Purchaser to make suggestions on Terms and conditions
                    </div>
                  </div>
                </div>
            </div>
          </div>
          <div className="deal-card__details">
            <div className="deal-card__docs">
                <h3 className="deal-card__header" onClick={handleAircraftDocs}>
                    Aircraft docs
                    <Icon className={`deal-card__icon-${isAircraftDocsOpen ? 'open' : 'closed'}`} name="i-expand" />
                </h3>
                <div className={`deal-card__docs-wrapper-${isAircraftDocsOpen ? 'open' : 'closed'}`}>
                    <a href="#" className="private-link document-link" onClick={demoDocument}>
                        <span className="document-link__icon">
                            <Icon name="i-download"/>
                        </span>
                        Aircraft specification
                    </a>
                    <a href="#" className="private-link document-link" onClick={demoDocument}>
                        <span className="document-link__icon">
                            <Icon name="i-download"/>
                        </span>
                        Proof of ownership
                    </a>
                </div>
            </div>
            <div className="deal-card__docs">
                <h3 className="deal-card__header" onClick={handleSignedDocs}>
                    Signed docs
                    <Icon className={`deal-card__icon-${isSignedDocsOpen ? 'open' : 'closed'}`} name="i-expand" />
                </h3>
                <div className={`deal-card__docs-wrapper-${isSignedDocsOpen ? 'open' : 'closed'}`}>
                    <a href="#" className="private-link document-link" onClick={demoDocument}>
                        <span className="document-link__icon">
                            <Icon name="i-download"/>
                        </span>
                        Aircraft Purchase Agreement
                    </a>
                </div>
            </div>
                <div className="deal-card__actions">
                    <Button className="deal-card__btn" size="small" onClick={demoCalendar}>
                        Calendar
                    </Button>
                </div>
            </div>
            <Modal
                title="This is a demo deal"
                modalIsOpen={demoModal}
                onRequestClose={() => setDemoModal(false)}
                isCloseIcon={false}
                buttons={[
                    {
                        title: 'Got it',
                        onClick: () => setDemoModal(false),
                        type: 'secondary'
                    },
                    {
                        title: 'To workspaces',
                        onClick: () => handleWorkspacesOpen(),
                    },
                ]}
            >
                {
                    currentWorkspace 
                        ? 'To buy or sell an aircraft, you need to undergo the compliance check.'
                        : 'To buy or sell an aircraft, you need to create a workspace and/or undergo the compliance check.'
                }
            </Modal>
        </div>

    )
}


export default DemoDeal