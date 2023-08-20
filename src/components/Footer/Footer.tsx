import React from 'react'
import Icon from 'src/components/Icon/Icon'
import './Footer.scss'
import stamp from 'src/../stamp.json'

const Footer: React.FC = React.memo((props) => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__info">
          <div className="footer__copyright">
            Digital Trading Solutions Inc.,{' '}
            {new Date().getFullYear()} <br /> All rights
            reserved
          </div>
          <div className="footer__links">
            <a
              href="https://wingform.com/assets/docs/Terms_Of_Use_Wingform.pdf"
              target="_blank"
            >
              Terms of use
            </a>
            <a
              href="https://wingform.com/assets/docs/Privacy_Policy_Wingform.pdf"
              target="_blank"
            >
              Privacy policy
            </a>
            <a
              href="https://wingform.com/assets/docs/Terms_Of_Transactions_Wingform.pdf"
              target="_blank"
            >
              Terms of transactions
            </a>
          </div>
        </div>
        {/* <div className="footer__block">
            <div className="footer__socials">
              <a className="footer__social" href="#" target="_blank">
                <Icon name="i-soc-yt" />
              </a>
              <a className="footer__social" href="#" target="_blank">
                <Icon name="i-soc-ig" />
              </a>
              <a className="footer__social" href="#" target="_blank">
                <Icon name="i-soc-m" />
              </a>
              <a className="footer__social" href="#" target="_blank">
                <Icon name="i-soc-fb" />
              </a>
              <a className="footer__social" href="#" target="_blank">
                <Icon name="i-soc-wz" />
              </a>
              <a className="footer__social" href="#" target="_blank">
                <Icon name="i-soc-tg" />
              </a>
            </div>
            <button className="footer__subscribe btn btn-link">Subscribe to newsletter</button>
          </div> */}
      </div>
      <div className="build-timestamp hidden">
        {stamp?.stamp ? `Build time: ${stamp.stamp}` : ''}
      </div>

    </footer>
  )
})

export default Footer
