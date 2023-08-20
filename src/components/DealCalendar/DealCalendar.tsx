import React from 'react'
import { Deal } from 'src/generated/graphql'
import { getCalendarArray, calendarArrayAction, formatDate } from 'src/helper'

import Icon from 'src/components/Icon/Icon'
import './DealCalendar.scss'

interface IDateDisplay {
    action: calendarArrayAction
}

const DealCalendarDateDisplay: React.FC<IDateDisplay> = (props) => {
    const { action } = props
    const actual = action.date
    const expected = action.expectedDate
    const overDue = actual
    const lockedDate = '--'
    const classNames = [...action.classes]
    classNames.push(`action_${action.id}`)

    return (
        <>
            <td className="calendar-action__title">{action.name}</td>

            <td className="calendar-action__date">
                {action.passed && <Icon name="i-success" />}
                <span className="calendar-action__date--date">
                    {formatDate(action.date)}
                </span>
            </td>
        </>
    )
}

interface ICalendarStepRow {
    step: any
}

const CalendarStepRow: React.FC<ICalendarStepRow> = (props) => {
    const { step } = props
    const classNames = ['deal-calendar__step']

    if (step.isExcluded) {
        classNames.push('step-hidden')
    }

    const getRowClass = (
        index: number,
        length: number,
        actionId: string,
    ): string => {
        const classList = [...classNames]
        if (index == 0) classList.push('first')
        if (index == length - 1) classList.push('last')
        if (actionId == 'FPP') classList.push('fixed')
        return classList.join(' ')
    }

    return step.actions.map((action, i) => (
        <tr
            className={getRowClass(i, step.actions.length, action.id)}
            key={i}
        >
            {i == 0 && (
                <td
                    className="deal-calendar__step__title"
                    rowSpan={step.actions.length}
                >
                    {step.name}
                </td>
            )}
            <DealCalendarDateDisplay action={action} />
            {((action.joinedDays && i == 0) || !action.joinedDays) && (
                <td
                    className="calendar-action__length"
                    rowSpan={action.joinedDays ? step.actions.length : null}
                >
                    {action.days}
                </td>
            )}
        </tr>
    ))
}

interface IDealType {
    deal: Deal
}

const DealCalendar: React.FC<IDealType> = (props) => {
    const { deal } = props
    const { steps } = deal

    if (!steps.length) return null

    const calendarArray = getCalendarArray(deal)

    return (
        <table
            className="deal-calendar"
            cellPadding={0}
            cellSpacing={0}
        >
            <thead>
                <tr>
                    <th>Deal step</th>
                    <th>Action</th>
                    <th>Expected/Actual date</th>
                    <th>Days</th>
                </tr>
            </thead>
            <tbody>
                {calendarArray.map((step) => (
                    <CalendarStepRow
                        key={step.id + step.name}
                        step={step}
                    />
                ))}
            </tbody>
        </table>
    )
}

export default DealCalendar
