import React, { useEffect, useState, MouseEvent } from 'react'
import Button from 'src/components/Button/Button'
import Sticky from 'react-sticky-el'
import './DealProcessLayout.scss'


export enum TButtonType {
  submit = 'submit',
  button = 'button'
}

export interface ILinkProp {
  title: string
  onClick?: (e: MouseEvent) => void
  disabled?: boolean
  display?: boolean
  type?: TButtonType
  href?: string
}

interface IDealProcessLayout {
  title: string
  subTitle?: Array<string>
  links?: Array<ILinkProp | JSX.Element>
  leftButtons?: Array<ILinkProp>
  rightButtons?: Array<ILinkProp>
  children: JSX.Element
  fixedFooter?: boolean
  center?: boolean
  noAccess?: string | boolean
}


const DealProcessLayout: React.FC<IDealProcessLayout> = (props) => {
  const {
    title,
    subTitle,
    links,
    leftButtons,
    rightButtons,
    fixedFooter = false,
    center = false,
    noAccess = false
  } = props

  const className = ['deal']
  if (center) className.push('deal-centered')

  return (
    <div className={className.join(' ')}>
      {
        noAccess &&
        <div className="deal__no-access">
          <div className="deal__no-access--text">
            {
              noAccess === true ?
                'You have no permissions to make actions on this step'
                :
                noAccess
            }
          </div>
        </div>
      }
      <div className="deal__header">

        <h1 className="deal__title">{title}</h1>
        {
          links &&
          <div className="deal__links">
            {
              links.map((l, i) =>
                'display' in l || 'href' in l || 'onClick' in l
                  ? (l.display == undefined || l.display) && l.title !== 'Help'
                    ? <a key={'link' + i} href={l.href} onClick={l.onClick}>{l.title}</a>
                    : null
                  : <>{l}</>
              )
            }
          </div>
        }
      </div>
      {
        subTitle &&
        <div className="deal__sub">
          {
            subTitle.map((text, i) => <div key={i} className="deal__sub-title">{text}</div>)
          }
        </div>
      }

      <div className="deal__content">
        {props.children}
      </div>

      <div className="deal__footer">
        {
          leftButtons ?
            <div className="deal__actions-left">
              {
                leftButtons.map((b, i) =>
                  <Button key={'lb' + i} btnType={b.type ? b.type : 'button'} type="secondary" onClick={b.onClick} disabled={b.disabled}>
                    {b.title}
                  </Button>
                )
              }
            </div> : <div></div>
        }
        {
          rightButtons &&
          <div className="deal__actions-right">
            {
              rightButtons.map((b, i) =>
                (b.display == undefined || b.display)
                  ?
                  <Button key={'rb' + i} btnType={b.type ? b.type : 'button'} onClick={b.onClick} disabled={b.disabled}>
                    {b.title}
                  </Button>
                  :
                  null
              )
            }
          </div>
        }
      </div>
    </div>
  )
}

export default DealProcessLayout
