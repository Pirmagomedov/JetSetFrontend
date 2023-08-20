import React, { useEffect, useState } from 'react'
import OtpInput from 'react-otp-input'
import { useHistory, useLocation } from 'react-router'
import { useConfirmEmail, useResendEmail } from 'src/generated/graphql'
import Layout from 'src/hoc/Layout'
import LoaderView from 'src/components/LoaderView/LoaderView'
import '../Recover/Recover.scss'


const Confrim: React.FC = React.memo(() => {
  const [error, setError] = useState<string>("")
  const [otp, setOtp] = useState<string>("")
  const [counter, setCounter] = useState<number>(60)
  const [isResend, setIsResend] = useState<boolean>(false)
  const [isSubmitting, setSubmitting] = useState<boolean>(false)

  const params = new URLSearchParams(useLocation().search)
  const email = params.get("email")
  const fromLogin = params.get("fromLogin")
  const history = useHistory()
  const [, confirmEmail] = useConfirmEmail()
  const [, resendEmail] = useResendEmail()

  useEffect(() => {
    if (fromLogin) {
      setCounter(0)
    }
  }, [])

  useEffect(() => {
    const timer = counter > 0 && setTimeout(() => setCounter(prevState => prevState - 1), 1000)
    return () => clearTimeout(timer)
  }, [counter])

  const handleResend = setSubmitting => {
    setIsResend(false)
    setSubmitting(true)
    setError("")

    resendEmail({ email })
      .then(res => {
        const response = res.data.resendEmail
        const runtimeError = response.runtimeError

        if (runtimeError) {
          setError(runtimeError.message)
          return false
        }

        setIsResend(true)
        setCounter(60)
      })
      .catch(err => console.error(err))
      .finally(() => setSubmitting(false))
  }

  const otpChange = (newOtp: string) => {
    if (newOtp.length === 6) {
      setSubmitting(true)
      setError("")

      confirmEmail({ code: parseInt(newOtp), email })
        .then(res => {
          const response = res.data.confirmEmail
          const fieldErrors = response.fieldErrors
          const runtimeError = response.runtimeError

          if (runtimeError) {
            setError(runtimeError.message)
            return false
          }

          if (fieldErrors) {
            let errorList = {code: "", email: ""}
            fieldErrors.map(err => (errorList[err.field] = err.message))
            errorList.code ? setError(errorList.code) : setError(errorList.email)
            return false
          }

          history.push({
            pathname: '/success',
            search: '?fromConfirm=true',
          })
        })
        .catch(err => console.error(err))
        .finally(() => setSubmitting(false))
    }

    setOtp(newOtp)
  }

  return (
    <Layout>
      <div className="recover">
        <div className="container">
          <h1 className="recover__title">Sign Up</h1>
          <div className="recover__description">
            <b>Six-digit code</b> has been sent to you at <span>{email}</span> Enter this code within 24 hours to confirm your
              registration.
          </div>
          <div className="otp__container">
            <OtpInput
              value={otp}
              shouldAutoFocus={true}
              onChange={(newOtp) => otpChange(newOtp)}
              numInputs={6}
              renderSeparator={<span></span>}
              renderInput={(props) => (
                <input {...props} type='number' style={{
                  width: "50px",
                  height: "50px",
                  textAlign: "center"
                }}
                disabled={isSubmitting}
                className="otp"/>
              )}
            />
          </div>
          <div className="error">{error}</div>
          {counter > 0 ? <div className="recover__notification">You can get new code in {counter} seconds</div> : null}
          {isResend ? <div className="recover__notification">New code has been sent</div> : null}
          <div className="recover__buttons">
            <button
              type="button"
              className="btn btn-blue"
              disabled={counter > 0 || isSubmitting}
              onClick={() => handleResend(setSubmitting)}
            >
              {isSubmitting ? <LoaderView ring /> : <span>Resend code</span>}
            </button>
          </div>
        </div>
      </div>
    </Layout> 
  )
})

export default Confrim