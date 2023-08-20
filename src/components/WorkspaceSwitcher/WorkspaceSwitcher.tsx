import React, { useCallback, useEffect, useState } from 'react'
import Avatar from 'src/components/Avatar/Avatar'
import { WorkspaceShort, AppWorkspaceRoleChoices } from 'src/generated/graphql'
import { useWorkspaceSwitcher, useSimpleLoader } from 'src/hooks'
import { AppDispatch, RootState } from 'src/store'
import { useDispatch, useSelector } from 'react-redux'
import { getWorkspaceTitle, getWorkspaceIcon, ImageStyles } from 'src/helper'
import LoaderView from 'src/components/LoaderView/LoaderView'
import './WorkspaceSwitcher.scss'

interface IWSIndividual {
    workspace: WorkspaceShort
    onClick?: (id: string) => void
    role?: string
    loader?: boolean
}

interface IWorkspaceSwitcher {
    onClick?: () => void
    onSwitch?: () => void
    open?: boolean
    loader?: boolean
}

const WorkspaceSwitcherIndividual: React.FC<IWSIndividual> = (props) => {
    const { workspace, onClick, role, loader } = props
    
    return (
        <div
            className="ws ws-individual"
            onClick={() => onClick(workspace.id)}
        >
            {loader ? (
                <LoaderView ring />
            ) : (
                <div className="ws__item--image">
                    <img
                        className="ws-individual-image"
                        src={getWorkspaceIcon(
                            workspace,
                            ImageStyles.AVATAR_NANO,
                        )}
                    />
                </div>
            )}
            <div className="ws__item ws-individual-title">
                <div className="ws__item--text">
                    {getWorkspaceTitle(workspace)}
                </div>
                <div className="ws__item--role">{role}</div>
            </div>
        </div>
    )
}

const WorkspaceSwitcherCorporate: React.FC<IWSIndividual> = (props) => {
    const { workspace, onClick, role, loader } = props
    return (
        <div
            className="ws ws-corporate"
            onClick={() => {
                onClick(workspace.id)
            }}
        >
            {loader ? (
                <LoaderView ring />
            ) : (
                <div className="ws__item--image">
                    <img
                        className="ws__item ws-corporate-image"
                        src={getWorkspaceIcon(workspace, ImageStyles.LOGO_NANO)}
                    />
                </div>
            )}
            <div className="ws__item ws-corporate-title">
                <div className="ws__item--text">
                    {getWorkspaceTitle(workspace)}
                </div>
                <div className="ws__item--role">{role}</div>
            </div>
        </div>
    )
}

const WorkspaceSwitcherItem: React.FC<IWSIndividual> = (props) => {
    const { workspace, onClick, loader } = props
    if (workspace?.role == AppWorkspaceRoleChoices.REPRESENTATIVE) {
        if (workspace.company?.id) {
            return (
                <WorkspaceSwitcherCorporate
                    workspace={workspace}
                    onClick={onClick}
                    role="Representative"
                    loader={loader}
                />
            )
        } else {
            return (
                <WorkspaceSwitcherIndividual
                    workspace={workspace}
                    onClick={onClick}
                    role="Representative"
                    loader={loader}
                />
            )
        }
    }
    if (workspace?.role == AppWorkspaceRoleChoices.CORPORATE) {
        return (
            <WorkspaceSwitcherCorporate
                workspace={workspace}
                onClick={onClick}
                role="Authorized executive"
                loader={loader}
            />
        )
    }
    return (
        <WorkspaceSwitcherIndividual
            workspace={workspace}
            onClick={onClick}
            role="Individual account"
            loader={loader}
        />
    )
}

const WorkspaceSwitcher: React.FC<IWorkspaceSwitcher> = (props) => {
    const { onClick, onSwitch, open } = props
    const dispatch: AppDispatch = useDispatch()
    const profileStored = useSelector((state: RootState) => state.user.profile)
    const switchWorkspace = useWorkspaceSwitcher()
    const { simpleLoader, setSimpleLoaderState } = useSimpleLoader()

    const handleSwitch = (id: string) => {
        setSimpleLoaderState(true)
        onClick()
        switchWorkspace(id).then((res) => {
            setSimpleLoaderState(false)
        })
    }

    return (
        <div className={`workspace-switcher ${open ? 'open' : 'closed'}`}>
            <div className="workspace-switcher__current">
                {
                    profileStored?.currentWorkspace 
                    ?
                        <WorkspaceSwitcherItem
                            workspace={profileStored?.currentWorkspace}
                            onClick={onClick}
                            loader={simpleLoader}
                        />
                    :
                        <Avatar
                            onClick={onClick}
                            className="logged__avatar"
                            profile={profileStored}
                        />
                }
            </div>
            {open && (
                <div className="workspace-switcher__list">
                    {profileStored.workspaces.map((workspace) => {
                        if (
                            profileStored?.currentWorkspace?.id !== workspace.id
                        ) {
                            return (
                                <WorkspaceSwitcherItem
                                    key={workspace.id}
                                    workspace={workspace}
                                    onClick={handleSwitch}
                                />
                            )
                        }
                        return null
                    })}
                </div>
            )}
        </div>
    )
}

export default WorkspaceSwitcher
