import React from 'react'
import Icon from 'src/components/Icon/Icon'
import { NftShort } from 'src/generated/graphql'
import './NFTView.scss'

interface INFTView {
    nft?: NftShort
    isPublicPreview?: boolean
}

const NFTView: React.FC<INFTView> = (props) => {
    const { nft, isPublicPreview = false } = props
    const text = nft?.txHash
    const tokenId = nft?.tokenId
    const tokenUrl = nft?.tokenUrl

    tokenUrl ? console.log('nft token', true) : console.log('nft token', false)

    const mockTokenId = "0xb4123de2f80fc237959842bd46891e33f81792b425824b2fb5f11411ed3f60302"

    // Где встретится проверка явная - убрать
    return !!tokenUrl || isPublicPreview ? (
        <a
            target="_blank"
            className="nft-view has-icon"
            href={isPublicPreview ? null : tokenUrl}
        >
            <Icon name="i-nft" />
            <div className="nft-view__text">{isPublicPreview ? mockTokenId : text}</div>
        </a>
    ) : null
}

export default NFTView
