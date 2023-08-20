import React, { ReactNode, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import InspectionFacilityList from 'src/components/InspectionFacilityList/InspectionFacilityList'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import Button from 'src/components/Button/Button'
import Layout from 'src/hoc/Layout'
import { setCommonLoader } from 'src/reducers/loaderReducer'
import { AppDispatch, RootState } from 'src/store'
import './InspectionFacilities.scss'


const InspectionFacilities: React.FC = props => {
  const { dealId } = useParams<{ dealId: string }>()
  const dispatch: AppDispatch = useDispatch()
  const router = useHistory()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <Layout
      hideFooter={true}
    >
        <DealProcessLayout title="Inspection facilities" fixedFooter={true}
          leftButtons={[
            { title: "Return to Deal", onClick: () => router.push(`/deal-process/${dealId}`) },
          ]}
          rightButtons={[
            { title: "Fill in deal", onClick: () => router.push(`/deal-process/${dealId}?mro=${selected}`), disabled: selected === null },
          ]}
        >
          <InspectionFacilityList onSelect={setSelected} />
        </DealProcessLayout>
    </Layout>
  )
}

export default InspectionFacilities
