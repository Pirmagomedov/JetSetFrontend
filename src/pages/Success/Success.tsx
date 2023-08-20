import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useLocation } from 'react-router-dom'
import Icon from 'src/components/Icon/Icon'
import Layout from 'src/hoc/Layout'
import './Success.scss'

const Success: React.FC = React.memo(props => {
  const [counter, setCounter] = useState<number>(5)
  const history = useHistory()
  const params = new URLSearchParams(useLocation().search)
  const fromRecover = params.get('fromRecover')
  const fromConfirm = params.get('fromConfirm')

  useEffect(() => {
    const timer = counter > 0 && setTimeout(() => setCounter(prevState => prevState - 1), 1000)
    if (counter === 0) {
      history.push('/login')
    }
    return () => clearTimeout(timer)
  }, [counter])

  return (
    <Layout>
      <div className="register-success">
        <div className="container">
          <div className="register-success__inner">
            {fromConfirm ? <h1 className="register-success__title">You have successfully registered!</h1> : null}
            {fromRecover ? <h1 className="register-success__title">You have successfully changed your password!</h1> : null}
            <p className="register-success__text">After {counter} seconds, you will be redirected to the login page.</p>
            <button onClick={() => history.push('/login')} className="register-success__btn btn btn-blue">
              Login
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
})

export default Success
