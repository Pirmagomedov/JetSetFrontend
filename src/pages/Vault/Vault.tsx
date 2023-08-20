import React from 'react'
import Layout from 'src/hoc/Layout'
// import { useHistory } from 'react-router'
import DealProcessLayout from 'src/pages/DealProcess/views/DealProcessLayout/DealProcessLayout'
import Wallet from 'src/components/Vault/Vault'
import './Vault.scss'
import CabinetNav from 'src/components/CabinetNav/CabinetNav'


const Vault: React.FC = props => {
  // const router = useHistory()

  return (
    <Layout>
      <div className="vault__container">
        <CabinetNav page="vault" />
        <DealProcessLayout
          title=""
        // links={[
        //   {title: "Help", onClick: () => console.log('Нажали кнопку HELP')},
        // ]}
        // leftButtons={[
        //   {title: "Return to Deals", onClick: () => router.push('/deals')},
        // ]}
        >
          <Wallet />
        </DealProcessLayout>
      </div>
    </Layout>
  )
}

export default Vault
