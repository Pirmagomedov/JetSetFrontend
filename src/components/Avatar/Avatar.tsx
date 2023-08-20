import React from 'react'
import { WorkspaceShort, ProfileMain } from 'src/generated/graphql'
import {
    getWorkspaceTitle,
    getWorkspaceIcon,
    ImageStyles,
    getImageLink,
} from 'src/helper'
import { useHistory } from 'react-router-dom'
import './Avatar.scss'

interface IAvatarProps {
    workspace?: WorkspaceShort
    profile?: ProfileMain
    className?: string
    showName?: boolean
    onClick?: () => void
    isBlurred?: boolean
}

const Avatar: React.FC<IAvatarProps> = React.memo((props) => {
    const { className = '', workspace, profile, showName = true, onClick, isBlurred = false } = props
    console.log('Avatar', workspace)
    const name = workspace ? isBlurred ? workspace?.user?.username : getWorkspaceTitle(workspace) : profile?.username
    const photo = workspace
        ? getWorkspaceIcon(workspace)
        : getImageLink(profile?.avatar, ImageStyles.AVATAR)
    const clickable = workspace?.id
    const router = useHistory()

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else {
            if (workspace && showName) {
                router.push(`/user/${workspace.id}`)
            }   
        }
    }

    return (
        <div
            className={`avatar ${className} 
                ${clickable ? 'clickable' : 'not-clickable'}
                ${isBlurred ? 'avatar--blurred' : ''}
            `}
            onClick={handleClick}
        >
            <div className="avatar__photo">
                {
                    photo 
                    ?   <img src={photo} alt={name} />
                    :   <span>
                            {name?.charAt(0).toUpperCase()}
                        </span>
                }
            </div>
            {showName && <div className="avatar__name">{name}</div>}
        </div>
    )
})

export default Avatar
