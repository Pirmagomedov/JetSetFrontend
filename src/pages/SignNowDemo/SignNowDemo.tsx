import React, { useState, useEffect } from 'react'
import Icon from 'src/components/Icon/Icon'
import Button from 'src/components/Button/Button'
import axios from 'axios'
import { useParams, useLocation } from 'react-router-dom'
import './SignNowDemo.scss'

const SignNowDemo: React.FC = React.memo(props => {
	const location = useLocation()
	const url = `https://${process.env.BACKEND_URL}/documents/verify/` 

	const jmak = () => {
		axios.post(url, {
			meta: {
	      event: "user.document.fieldinvite.signed",
	      timestamp: Math.floor(new Date().getTime() / 1000),
	      access_token: "2ae176c012c963d7db04ed56c9eeb91b92bfb5d977c8ca5b3c4ea8197eb11f60",
	      callback_url: "http://dev-jetset-1944339514.eu-central-1.elb.amazonaws.com/documents/verify/",
	      environment: "https://api.signnow.com"
	    },
	    content: {
	      signer: location.search.replace(/.*signer=([^\&]*).*/g,'$1'),
	      status: "fulfilled",
	      invite_id: location.search.replace(/.*invite_id=([^\&]*).*/g,'$1'),
	      document_id: location.search.replace(/.*document_id=([^\&]*).*/g,'$1')
	    }
		})
	}

  return (
    <div className={`document-signed`}>
      <Button onClick={jmak}>Sign</Button>
    </div>
  )
})

export default SignNowDemo
