import React, { useEffect } from 'react'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import { useHistory } from 'react-router-dom'
import LoaderView from 'src/components/LoaderView/LoaderView'

interface IJdun {
  onReload: () => void
}

const Jdun: React.FC<IJdun> = props => {
  const { onReload } = props
  const router = useHistory()
  
  useEffect(() => {
    const updater = setInterval(() => {
      console.log('Jdun reloaded the page')
      onReload()
      //router.go(0) //refresh
    },10000)

    return () => {clearInterval(updater)}
  },[])

  return (
    <DealProcessLayout title="Please wait" >
      <p>The deals is being processed <LoaderView ring /></p> 
    </DealProcessLayout>
  )
}

export default Jdun


