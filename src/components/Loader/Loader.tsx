import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import LoaderView from '../LoaderView/LoaderView'
import './Loader.scss'

const Loader: React.FC = (props) => {
    const [isLoading, setLoading] = useState<boolean>(true)
    const loaders = useSelector((state: RootState) => state.loader)

    useEffect(() => {
        let loading = false

        Object.entries(loaders).map(([key, value]) => {
            if (value && key !== 'simpleLoader') {
                loading = true
            }
        })

        if (loading !== isLoading) {
            setLoading(loading)
        }
    }, [loaders])

    return isLoading ? (
        <div className="loader">
            <LoaderView />
        </div>
    ) : null
}

export default Loader
