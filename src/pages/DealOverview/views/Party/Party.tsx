import React from 'react'
import CardImage from 'src/components/CardImage/CardImage'
import {
    ImageStyles,
    getImageRatio,
    getImageLink,
    FileChunk
} from 'src/helper'
import './Party.scss'

interface IParty {
    side: any
    role?: string
}

const Party: React.FC<IParty> = (props) => {
    const { side, role = 'buyer' } = props

    let img: FileChunk;
    let name;

    if (side?.role === 'INDIVIDUAL') {
        img = {
            links: side?.individual?.user?.avatar?.links,
            bucket: side?.individual?.user?.avatar?.bucket,
            key: side?.individual?.user?.avatar?.key
        }
        name = `${side?.user?.kycInfo?.firstName} ${side?.user?.kycInfo?.lastName}`
    }
    else {
        img = {
            links: side?.company?.logo?.links,
            bucket: side?.company?.logo?.bucket,
            key: side?.company?.logo?.key
        }
        name = `${side?.company?.name}`
    }

    return (
        <div className="party">
            <CardImage
                ratio={getImageRatio(ImageStyles.AVATAR_NANO)}
                src={getImageLink(img, ImageStyles.AVATAR_NANO)}
                title={name}
                mockable={true}
            />
            <div className="party__side">
                <div className="party__side--role">
                    {role === 'buyer' ? 'Buyer' : 'Seller'}
                </div>
                <div className="party__side--name">
                    {name}
                </div>
            </div>
        </div>
    )
}

export default Party