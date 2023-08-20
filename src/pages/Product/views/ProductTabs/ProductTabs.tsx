import React from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { AdFull } from 'src/generated/graphql'
import AircraftSummary from '../AircraftSummary/AircraftSummary'
import Apu from '../Apu/Apu'
import Avionics from '../Avionics/Avionics'
import Engine from '../Engine/Engine'
import Exterior from '../Exterior/Exterior'
import Maintence from '../Maintence/Maintence'

interface IProductTabs {
  product: AdFull
  isBlurred?: boolean 
}

const ProductTabs: React.FC<IProductTabs> = React.memo(props => {
  const { product, isBlurred } = props

  return (
    <Tabs className="product__tabs">
      <TabList>
        <Tab>Aircraft summary</Tab>
        <Tab>Engine</Tab>
        <Tab>APU</Tab>
        <Tab>Avionics</Tab>
        <Tab>Maintenance</Tab>
        <Tab>Exterior/Cabin</Tab>
      </TabList>
      <TabPanel>
        <AircraftSummary isBlurred={isBlurred}  aircraftSummary={product?.aircraftSummary} />
      </TabPanel>
      <TabPanel>
        <Engine engine={product?.engine} />
      </TabPanel>
      <TabPanel>
        <Apu apu={product?.apu} />
      </TabPanel>
      <TabPanel>
        <Avionics avionics={product?.avionics} />
      </TabPanel>
      <TabPanel>
        <Maintence maintence={product?.maintenance} />
      </TabPanel>
      <TabPanel>
        <Exterior exterior={product?.exteriorCabin} />
      </TabPanel>
    </Tabs>
  )
})

export default ProductTabs
