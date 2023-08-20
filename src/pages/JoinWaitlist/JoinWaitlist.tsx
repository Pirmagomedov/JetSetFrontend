import React from 'react';
import Layout from 'src/hoc/Layout';
import './JoinWaitlist.scss'
import { Link } from 'react-router-dom';

const JoinWaitlist: React.FC = () => {

  return (
    <Layout>

      <div className="container first-section-background">

        <div className="section">

          <div className="button-container">

            <Link to='/landing'>
              &#60; Return
            </Link>

          </div>
          <div className="section__content">
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default JoinWaitlist;