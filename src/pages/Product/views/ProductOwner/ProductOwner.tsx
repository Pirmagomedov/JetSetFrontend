import React from 'react'
import Icon from 'src/components/Icon/Icon'
import { WorkspaceShort } from 'src/generated/graphql'
import { getWorkspaceIcon, getWorkspaceTitle } from 'src/helper'
import { useHistory } from 'react-router-dom'
import './ProductOwner.scss'

interface IProductOwner {
  workspace: WorkspaceShort
  isCreator: boolean
  isBlurred?: boolean
}

const ProductOwner: React.FC<IProductOwner> = React.memo(props => {
  const { workspace, isCreator, isBlurred } = props
  const extraClassName = isBlurred ? 'product-owner-blurred' : ''
  const withIcon = !isCreator ? 'product-owner__icon' : ''
  const title = getWorkspaceTitle(workspace)
  const ownerTitle = title ? title : '@'
  const history = useHistory()
  const icon = getWorkspaceIcon(workspace)

  const handleOpen = () => {
    if (!isBlurred) {
      history.push(`/user/${workspace.id}`)
    }
  }

  return (
    <div className={`product-owner ${extraClassName} ${withIcon}`} onClick={handleOpen}>
      <div className="product-owner__avatar">
        {icon ? <img src={icon} alt="" /> : ownerTitle.charAt(0).toUpperCase()}
      </div>
      <div className="product-owner__content">
        <div className="product-owner__position">Seller</div>
        <div className="product-owner__name">
          {ownerTitle}
          {isCreator ? ' (you)' : null}
        </div>
      </div>
{/* 
      {!isCreator ?
        <div className="product-owner__icon">
          <Icon width={64} height={61} name="i-chat-icon" />
        </div>
        :
        null
      } */}

    </div>
  )
})

export default ProductOwner
