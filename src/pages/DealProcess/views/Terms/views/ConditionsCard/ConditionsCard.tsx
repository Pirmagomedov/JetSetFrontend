import React, { useState, useEffect } from 'react'
import { isEmpty, areEqual } from 'src/helper'
import Button from 'src/components/Button/Button'
import FormikAirports from 'src/components/FormikAirports/FormikAirports'
import FormikCalendar from 'src/components/FormikCalendar/FormikCalendar'
import FormikField from 'src/components/FormikField/FormikField'
import FormikPrice from 'src/components/FormikPrice/FormikPrice'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import HelpIcon from 'src/components/Icon/views/HelpIcon/HelpIcon'
import Icon from 'src/components/Icon/Icon'
import { 
    Options,
    IHelp
} from 'src/types'
import './ConditionsCard.scss'



enum ConditionsCardState {
    ACCEPTED = 'accepted',
    SUGGESTED = 'suggested',
    COMPANIONACCEPTED = 'companion-accepted',
    COMPANIONSUGGESTED = 'companion-suggested',
    PENDING = 'pending',
}

interface IConditionsCard {
    isSeller: boolean
    onAccept?: (name: string, value: string | false, comment: string) => boolean
    name: string
    title: any
    seller: string
    buyer?: string
    accepted?: string | false
    initial?: string | false
    contracted?: string | false
    options?: Options
    message: string
    companionMessage: string
    type?: string
    isOnRenegotiation?: boolean
    iteration?: number
    formatValue?: (string) => string
    onReview: (boolean) => void
    className?: string
    readOnly: boolean
    help?: IHelp
    info?: string | JSX.Element
    noComments?: boolean
    approvedMode?: boolean
    isOnPreNegotiation?:boolean
}

interface IConditionField {
    name: string
    options?: Options
    isSeller: boolean
    value: string | false
    contracted: string | false
    sellerField: boolean
    disabled: boolean
    type?: string
    isOnRenegotiation?: boolean
    isOnPreNegotiation?:boolean
    iteration?: number
    onlyValue?: boolean
    onChange: (event: any) => void
    formatValue?: (string) => string
}

export const getOptionsLabelByValue = (value: any, options?: Options): any => {
    if (options) {
        const found = options.filter((el) => el.value == value)
        if (found.length) {
            if (found[0].label) {
                return found[0].label
            }
        }
    }
    return value
}

const ConditionField: React.FC<IConditionField> = (props) => {
    const {
        name,
        options,
        isSeller,
        value,
        sellerField,
        disabled,
        onChange,
        formatValue,
        isOnRenegotiation,
        isOnPreNegotiation,
        iteration,
        contracted,
        type,
        onlyValue
    } = props
    const editable = (isSeller && sellerField) || (!isSeller && !sellerField)
    const isSelect = options ? true : false
    const isAirport = type == 'airports'
    const isDate = type == 'date'
    const isNumber = type == 'int' || type == 'integer' || type == 'float'
    const minDate = new Date()
    const label: string = isOnRenegotiation
        ? editable
            ? 'Your offer:'
            : 'Suggested:'
        : sellerField
            ? "Seller's offer:"
            : "Buyer's offer:"

    const handleChange = (event: Event) => {
        const element = event.target as HTMLInputElement
        onChange(element.value)
    }

    const dateChange = (d: Date) => {
        onChange(d)
    }

    return editable && !disabled ? (
        isAirport ? (
            !isSeller && (
                <FormikAirports
                    changeHandler={onChange}
                    className="airports"
                    name={name}
                />
            )
        ) : isSelect ? (
            <FormikSelect
                changeHandler={onChange}
                className="select"
                name={name}
                options={options}
            />
        ) : isDate ? (
            <FormikCalendar
                changeHandler={dateChange}
                name={name}
                minDate={minDate}
            />
        ) : isNumber ? (
            <FormikPrice
                changeHandler={handleChange}
                typeHandler={handleChange}
                name={name}
            />
        ) : (
            <FormikField
                changeHandler={handleChange}
                typeHandler={handleChange}
                name={name}
            />
        )
    ) : (
        <div className="value">
            {(!isOnRenegotiation ||
                contracted != value ||
                (isOnRenegotiation && iteration > 0 && !editable)) && (
                    <>
                        {!isEmpty(value) && !onlyValue && <span>{label}&nbsp;</span>}

                        {formatValue(value)}
                    </>
                )}
        </div>
    )
}

interface IConditionFieldValue {
    value: string | false
    message: string
}

const ConditionsCard: React.FC<IConditionsCard> = (props) => {
    const {
        isSeller,
        onAccept,
        name,
        title,
        seller,
        buyer,
        accepted,
        initial,
        message,
        companionMessage,
        iteration,
        options,
        formatValue,
        onReview,
        type,
        isOnRenegotiation,
        isOnPreNegotiation,
        contracted,
        className,
        readOnly,
        help,
        info,
        noComments,
        approvedMode
    } = props

    const isFilled = !isEmpty(buyer) && !isEmpty(seller)
    const isAccepted = isFilled && areEqual(buyer, seller)
    const initialState = !isFilled
        ? ConditionsCardState.PENDING
        : isAccepted
            ? ConditionsCardState.COMPANIONACCEPTED
            : ConditionsCardState.COMPANIONSUGGESTED
    const [state, setState] = useState<ConditionsCardState>(initialState)
    const [lastState, setLastState] = useState<ConditionsCardState>(null)
    const [lastValue, setLastValue] = useState<string | false>(false)
    const [revised, setRevised] = useState<boolean>(false)
    /*const [newMessage, setMessage] = useState<string>(message)
  const [newValue, setNewValue] = useState<string>(isSeller ? sellerSideValue : buyerSideValue)*/
    const sellerSideValue: string | false = isSeller ? accepted : seller
    const buyerSideValue: string | false = !isSeller ? accepted : buyer

    const [newValues, setNewValues] = useState<IConditionFieldValue>({
        value: isSeller ? sellerSideValue : buyerSideValue,
        message: message,
    })
    const [error, setError] = useState<boolean>(false)

    const canAccept: boolean =
        !error &&
        ((isSeller && !isEmpty(buyer)) || (!isSeller && !isEmpty(seller)))
    const wantSuggest: boolean =
        !error &&
        !isEmpty(accepted) &&
        !areEqual(accepted, isSeller ? buyer : seller)
    const solved: boolean = state !== ConditionsCardState.PENDING
    const needReview: boolean = !(
        state !== ConditionsCardState.PENDING &&
        state !== ConditionsCardState.COMPANIONSUGGESTED
    )

    const revisedClass: string = revised ? 'revised' : 'unrevized'
    const externalClass: string = className ? className : ''
    const isAirport: boolean = type == 'airports'
    const canReset: boolean = accepted != initial
    const offerLabel: string = accepted == initial ? 'Offer' : 'Edit'
    const ownILabelSegment: string = isOnRenegotiation
        ? 'Your'
        : isSeller
            ? "Seller's"
            : "Buyer's"

    const renderValue = (v: string | false): string => {
        if (v === false) return ''
        if (formatValue) return formatValue(v)
        return v
    }

    useEffect(() => {
        onReview((prev) => ({
            ...prev,
            [name]: !needReview, //is revized = no need review
        }))
    }, [needReview])

    const handleAccept = () => {
        if (onAccept(name, isSeller ? buyer : seller, newValues.message)) {
            setState(ConditionsCardState.ACCEPTED)
            setRevised(true)
        }
    }

    const handleReject = () => {
        onAccept(
            name,
            false,
            newValues.message.trim() == '' ? 'REJECTED' : newValues.message,
        )
        setState(ConditionsCardState.SUGGESTED)
        setRevised(true)
    }

    const handleSuggest = () => {
        if (onAccept(name, accepted, newValues.message)) {
            setState(ConditionsCardState.SUGGESTED)
            setRevised(true)
        }
    }

    const handleReturn = () => {
        setState(lastState)
        onAccept(name, lastValue, newValues.message)
    }

    const handleReset = () => {
        console.log('handleReset', { contracted, seller, buyer })
        if (contracted == seller && contracted == buyer) {
            setState(ConditionsCardState.ACCEPTED)
        } else {
            setState(ConditionsCardState.SUGGESTED)
        }
        onAccept(name, contracted, newValues.message)
    }

    const handleChange = (value) => {
        setNewValues((v) => {
            return { ...v, value }
        })

        //onAccept(name, value, newMessage)
    }

    const handleCommentChange = (e) => {
        setNewValues((v) => {
            return { ...v, message: e.target.value }
        })
        //setMessage(e.target.value)
    }

    useEffect(() => {
        if (type == 'int' || type == 'integer' || type == 'float') {
            if (
                newValues.value !== false &&
                newValues.value !== null &&
                newValues.value.replace(/[\s&nbsp;]{1,}/g, '').match(/^[0-9\.]*$/)
            ) {
                onAccept(name, newValues.value, newValues.message)
                setError(false)
            } else {
                setError(true)
            }
        } else {
            setError(false)
            onAccept(name, newValues.value, newValues.message)
        }
    }, [newValues])

    const handleEdit = () => {
        setLastState(state)
        setLastValue(accepted)
        setState(ConditionsCardState.PENDING)
        setRevised(true)
    }

    return (
        <div
            className={`conditions-card ${state} ${revisedClass} ${externalClass}`}
        >
            {/*<div className="unhidden debug">
                {JSON.stringify({solved, wantSuggest, canAccept, canReset, revised, newValues, state, lastState, lastValue})}
            </div>*/}
            <div className="conditions-card__head">
                <div className="conditions-card__head__titleIcon">
                    <div className="conditions-card__icon">
                        {(state == ConditionsCardState.COMPANIONACCEPTED ||
                            state == ConditionsCardState.ACCEPTED) && (
                                <Icon
                                    name="check"
                                    className="conditions-card__icon icon__green"
                                />
                            )}
                        {(state == ConditionsCardState.COMPANIONSUGGESTED ||
                            state == ConditionsCardState.SUGGESTED) && (
                                <Icon
                                    name="pending"
                                    className="conditions-card__icon icon__red"
                                />
                            )}
                    </div>
                    <div className="conditions-card__title">
                        {title}
                        <HelpIcon help={help} />
                    </div>
                </div>
                {
                    info &&
                    <div className="conditions-card__info">
                        {info}
                    </div>
                }
            </div>

            {
                approvedMode &&
                <div className="approvedValue">
                    <ConditionField
                        sellerField={!isSeller}
                        formatValue={renderValue}
                        value={
                            isSeller ? buyerSideValue : sellerSideValue
                        }
                        iteration={iteration}
                        contracted={contracted}
                        onChange={handleChange}
                        isSeller={isSeller}
                        options={options}
                        type={type}
                        name={name}
                        isOnRenegotiation={false}
                        disabled={true}
                        onlyValue={true}
                    />
                </div>
            }

            {
                !approvedMode &&
                <>
                    <div className="conditions-card__actions">
                        {!solved && lastState != null && (
                            <Button
                                type="white"
                                onClick={handleReturn}
                                disabled={readOnly}
                            >
                                Return
                            </Button>
                        )}

                        {/*solved && isOnRenegotiation && accepted !== contracted  &&
                    <Button type="white" onClick={handleReset} >Reset</Button>*/}
                        {(!revised || !solved) && isAirport && isSeller && (
                            <Button
                                type="white"
                                onClick={handleReject}
                                disabled={readOnly}
                            >
                                Reject
                            </Button>
                        )}

                        {!solved && wantSuggest && !(isAirport && isSeller) && (
                            <Button
                                onClick={handleSuggest}
                                disabled={readOnly}
                            >
                                Suggest
                            </Button>
                        )}

                        {((!solved && canAccept && !wantSuggest) ||
                            (solved && canAccept && needReview) ||
                            (!solved && isAirport && isSeller)) && (
                                <Button
                                    onClick={handleAccept}
                                    disabled={readOnly}
                                >
                                    Accept
                                </Button>
                            )}

                        {solved && (
                            <Button
                                type="white"
                                onClick={handleEdit}
                                disabled={readOnly}
                            >
                                {offerLabel}
                            </Button>
                        )}

                    </div>

                    {isOnRenegotiation && (
                        <div className="conditions-card__contracted-values">
                            <div className="conditions-card__contracted-value">
                                {isOnPreNegotiation ? 'Pre-approved term' : 'Contracted term'}: {renderValue(contracted)}
                            </div>
                        </div>
                    )}

                    {isOnRenegotiation &&
                        solved &&
                        buyerSideValue == sellerSideValue &&
                        buyerSideValue !== contracted && (
                            <div className="conditions-card__approved-values">
                                <div className="conditions-card__approved-value">
                                    Approved term: {renderValue(buyerSideValue)}
                                </div>
                            </div>
                        )
                    }

                    {(!isOnRenegotiation ||
                        (isOnRenegotiation &&
                            (!solved || buyerSideValue !== sellerSideValue))) && (
                            <div className="conditions-card__values">
                                <div className="conditions-card__value">
                                    {(!isOnRenegotiation ||
                                        (isOnRenegotiation && contracted !== isSeller
                                            ? buyerSideValue
                                            : sellerSideValue) ||
                                        !solved) && (
                                            <ConditionField
                                                sellerField={!isSeller}
                                                formatValue={renderValue}
                                                value={
                                                    isSeller ? buyerSideValue : sellerSideValue
                                                }
                                                iteration={iteration}
                                                contracted={contracted}
                                                onChange={handleChange}
                                                isSeller={isSeller}
                                                options={options}
                                                type={type}
                                                name={name}
                                                isOnRenegotiation={isOnRenegotiation}
                                                disabled={solved}
                                            />
                                        )}
                                </div>
                                <div className="conditions-card__value">
                                    <ConditionField
                                        sellerField={isSeller}
                                        formatValue={renderValue}
                                        value={isSeller ? sellerSideValue : buyerSideValue}
                                        iteration={iteration}
                                        contracted={contracted}
                                        onChange={handleChange}
                                        isSeller={isSeller}
                                        options={options}
                                        type={type}
                                        name={name}
                                        isOnRenegotiation={isOnRenegotiation}
                                        disabled={solved || readOnly}
                                    />
                                </div>
                            </div>
                        )
                    }
                    {(companionMessage || !isEmpty(message) || !solved) && !noComments && (
                        <div className="conditions-card__comments">
                            <div className="split__comment">
                                {!isEmpty(companionMessage) && (
                                    <div className="comment_title">
                                        {isSeller
                                            ? "Buyer's comment"
                                            : "Seller's comment"}
                                    </div>
                                )}
                                <div className="comment_value">{companionMessage}</div>
                            </div>
                            <div className="split__input">
                                {(!isEmpty(message) || !solved) &&
                                    (
                                        <div className="comment_title">{`${ownILabelSegment} comment`}</div>
                                    )}
                                {solved ? (
                                    !isEmpty(message) && (
                                        <div className="comment_value">{message}</div>
                                    )
                                ) : (
                                    // Мы проверяем, не пустое ли сообщение, но, между тем, на 293 строке задаем message
                                    <FormikField
                                        name={name + 'Message'}
                                        readonly={solved || readOnly}
                                        isTextarea={true}
                                        placeholder={'Your comments'}
                                        changeHandler={handleCommentChange}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </>
            }
        </div>
    )
}

export default ConditionsCard