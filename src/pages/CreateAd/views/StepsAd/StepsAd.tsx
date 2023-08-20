import React from 'react'
import { Step } from 'src/types'
import './StepsAd.scss'


interface IStepsAd {
  step: number
  steps: Step[]
}

const StepsAd: React.FC<IStepsAd> = React.memo(props => {
  const { step, steps } = props

  return (
    <div className="steps-ad">
      {steps
        ? steps.map(s => {
            const currentStep = step === s.id ? 'steps-ad__item--current' : ''
            const completedStep = step > s.id ? 'steps-ad__item--completed' : ''
            const nextStep = step < s.id - 1 ? 'steps-ad__item--notNext' : ''

            return (
              <div className={`steps-ad__item ${currentStep} ${completedStep} ${nextStep}`} key={s.id}>
                <div className="steps-ad__step">Step {s.id}</div>
                <div className="steps-ad__label">{s.label}</div>
                <div className="steps-ad__progress"></div>
              </div>
            )
          })
        : null}
    </div>
  )
})

export default StepsAd
