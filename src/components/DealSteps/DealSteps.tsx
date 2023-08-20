import React, { useState } from 'react'
import { Deal } from 'src/generated/graphql'
import { getCalendarArray, calendarArrayStep, getCurrentCalendarStep, formatDate } from 'src/helper'
import './DealSteps.scss'


interface IDealSteps {
  deal: Deal
  steps?: calendarArrayStep[]
  full?: boolean
}


interface ICalendarStepType {
  step: calendarArrayStep
  full?: boolean
  deal: Deal
}

const DealStep: React.FC<ICalendarStepType> = ({ deal, step, full }) => {
  const classes = ['deal-steps__step']
  var length = 0
  step.actions.forEach(a => length += a.days)

  if (deal.status !== 'DC') {
    if (length == 0) {
      classes.push('step-virtual')
    }
    if (step.isPassed) {
      classes.push('step-passed')
    }
    if (step.isCurrent) {
      classes.push('step-current')
    }
    if (step.isExcluded) {
      classes.push('step-excluded')
    }
  }
  else {
    if (length == 0) {
      classes.push('step-virtual')
    }
    if (step.isPassed) {
      classes.push('step-passed--rejected')
    }
    if (step.isCurrent) {
      classes.push('step-current--rejected')
    }
    if (step.isExcluded) {
      classes.push('step-excluded')
    }
  }

  return (
    <div className={classes.join(' ')}>
      {full && <div className="deal-steps__step__date">{formatDate(step.date ? step.date : step.expectedDate)}</div>}
      <div className={`deal-steps__step__mark${deal.status === 'DC' ? '--rejected' : ''}`}></div>
      <div className="deal-steps__step__title">
        {step.name}
      </div>
    </div>
  )
}


const DealSteps: React.FC<IDealSteps> = (props) => {
  const { deal, steps, full = false } = props

  if (!deal?.steps?.length) return null

  const calendarArray = steps ? steps : getCalendarArray(deal)
  const currentStep = getCurrentCalendarStep(calendarArray)
  const className = 'deal-steps ' + (full ? 'deal-steps-full' : 'deal-steps-short')

  return (
    <div className={className}>
      <div className="deal-steps__steps">
        {
          calendarArray.map((step, id) =>
            <DealStep deal={deal} key={id} step={step} full={full} />
          )
        }
      </div>
      {
        !full &&
        <div className="deal-steps__status">
          {currentStep.name}
        </div>
      }
    </div>
  )
}


export default DealSteps