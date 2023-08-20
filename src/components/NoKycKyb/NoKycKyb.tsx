import React, { useEffect, useState } from 'react'


interface INoKycKyb {
    wsCheck?: boolean
    message?: string
}

const NoKycKyb: React.FC<INoKycKyb> = (props) => {
    const { wsCheck = false, message = null } = props

    return (
        <div className="no-kyc-kyb">
            <div className="no-kyc-kyb__message">
                {
                    message 
                        ? message
                        : wsCheck 
                            ? 'You have to create a workspace first' 
                            : 'KYC/KYB not passed'
                }
            </div>
        </div>
    )
}

export default NoKycKyb
