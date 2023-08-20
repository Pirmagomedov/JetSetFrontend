import React from 'react'
import Icon from '../../Icon'
import { IHelp } from 'src/types'

interface IHelpIcon {
    help: IHelp
}

const HelpIcon: React.FC<IHelpIcon> = (props) => {
    const { help } = props

    const handleHelp = () => {
        return window.open(help.link)
    }

    return (
        help ?
            <Icon name="i-question" onClick={handleHelp} title={help.title} />
            :
            null
    )
}

export default HelpIcon