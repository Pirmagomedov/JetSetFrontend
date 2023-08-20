import React from 'react'
import Icon from 'src/components/Icon/Icon'
import { KycKybState, getWorkspaceKycKybState } from 'src/helper'
import { ProfileKyc, WorkspaceKyc } from 'src/generated/graphql'
import './KycFlag.scss'


interface IKycFlag {
  workspace?: WorkspaceKyc
  profile?: ProfileKyc
  title?: string
  active?: boolean
  onClick?: () => void
}

const getKycIconName = (state: KycKybState): string => {
  switch (state) {
    case KycKybState.UPDATE: return 'i-bold-pending'
    case KycKybState.NONE: return 'i-bold-arrow'
    case KycKybState.SUCCESS: return 'i-bold-success'
    case KycKybState.PENDING: return 'i-bold-pending'
    case KycKybState.FAILED: return 'i-bold-error'
    default: return 'i-bold-error'
  }
}

const KycFlag: React.FC<IKycFlag> = (props) => {
  const { active, workspace, profile, title = 'KYC', onClick } = props
  const state = getWorkspaceKycKybState(workspace, profile)
  const iconName = getKycIconName(state)

  const clickable = active && state !== KycKybState.SUCCESS

  const titleText = []
  if (state == KycKybState.PENDING) titleText.push(active ? 'Continue' : 'Pending')
  if (state == KycKybState.NONE) titleText.push(active ? 'Start' : 'No')
  if (state == KycKybState.UPDATE) titleText.push('Review')
  titleText.push(title)

  const className = ['kyc-flag']
  className.push(`kyc-${state.toLowerCase().replace(/\s/g, '_')}`)
  className.push(clickable ? 'active' : 'passive')

  return (
    <div onClick={onClick} className={className.join(' ')}>
      <Icon name={iconName} />
      {active ?
        <span>{titleText.join(' ')}</span>
        :
        <span>{title}</span>
      }
    </div>
  )
}

export default KycFlag