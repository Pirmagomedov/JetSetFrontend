import React, { lazy, Suspense, useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import Loader from './components/Loader/Loader'
import PrivateRoute from './hoc/PrivateRoute'
import PublicRoute from './hoc/PublicRoute'
import Notifications from './pages/Notifications/Notifications'
const Confrim = lazy(() => import('./pages/Confirm/Confirm'))
const CreateAd = lazy(() => import('./pages/CreateAd/CreateAd'))
const DealProcess = lazy(() => import('./pages/DealProcess/DealProcess'))
const Deals = lazy(() => import('./pages/Deals/Deals'))
const DealOverview = lazy(() => import('./pages/DealOverview/DealOverview'))
const Home = lazy(() => import('./pages/Home/Home'))
const Login = lazy(() => import('./pages/Login/Login'))
const Product = lazy(() => import('./pages/Product/Product'))
const SumSubProfile = lazy(() => import('./pages/SumSubProfile/SumSubProfile'))
const PublicProfile = lazy(() => import('./pages/SumSubProfile/PublicProfile'))
const Recover = lazy(() => import('./pages/Recover/Recover'))
const RecoverPassword = lazy(() => import('./pages/RecoverPassword/RecoverPassword'))
const Register = lazy(() => import('./pages/Register/Register'))
const Search = lazy(() => import('./pages/Search/Search'))
const Success = lazy(() => import('./pages/Success/Success'))
const documentConstructor = lazy(() => import('./pages/DocumentConstructor/docCons'))
const Inventory = lazy(() => import('./pages/Inventory/Inventory'))
const CreateAdPublicOffer = lazy(() => import('./pages/CreateAd/views/CreateAdPublicOffer/CreateAdPublicOffer'))
const Prepayment = lazy(() => import('./pages/DealProcess/views/Prepayment/Prepayment'))
const DealCalendarPage = lazy(() => import('./pages/DealCalendarPage/DealCalendarPage'))
const InspectionFacilities = lazy(() => import('./pages/InspectionFacilities/InspectionFacilities'))
const Vault = lazy(() => import('./pages/Vault/Vault'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions/TermsAndConditions'))
const DocTemplatePage = lazy(() => import('./pages/DocTemplatePage/DocTemplatePage'))
const Landing = lazy(() => import('./pages/Landing/Landing'))
const Help = lazy(() => import('./pages/Help/Help'))
const DocumentSigned = lazy(() => import('./pages/DocumentSigned/DocumentSigned'))
const SignNowDemo = lazy(() => import('./pages/SignNowDemo/SignNowDemo'))


const Test = lazy(() => import('./pages/Test/Test'))

console.log('DONENV LOADED', {
  "process.env.BACKEND_URL": process.env.BACKEND_URL,
  "process.env.SUMSUB_BACKEND": process.env.SUMSUB_BACKEND,
  "process.env.DOC_CONS_DEAL": process.env.DOC_CONS_DEAL
})

const App = () => {

  return (
    <Suspense fallback={<Loader />}>
      {
        window?.location?.host == 'wingform.com' || window?.location?.host == 'landing.wingform.com' ?
          <Switch>
            <Route path="*" component={Landing} />
          </Switch>
          :
          <Switch>
            <PrivateRoute path="/test" component={Test} />
            <PrivateRoute path="/create-ad/:id" component={CreateAd} />
            <PrivateRoute path="/create-ad" component={CreateAd} />
            <PrivateRoute path="/favorites" component={Inventory} />
            <PrivateRoute path="/profile" component={SumSubProfile} />
            <PrivateRoute path="/workspace/:id" component={SumSubProfile} />
            <PrivateRoute path="/deals/:dealId/overview" component={DealOverview} />
            <PrivateRoute path="/deals" component={Deals} />
            <PrivateRoute path="/prepayment/:id" component={Prepayment} />
            <PrivateRoute path="/inventory" component={Inventory} />
            <PrivateRoute path="/deal-process/:dealId" component={DealProcess} />
            <PrivateRoute path="/deal-calendar/:dealId" component={DealCalendarPage} />
            <PrivateRoute path="/deal-terms/:dealId" component={TermsAndConditions} />
            <PrivateRoute path="/facilities/:dealId" component={InspectionFacilities} />
            <PrivateRoute path="/deal-process" component={DealProcess} />
            <PrivateRoute path="/notifications" component={Notifications} />
            <PrivateRoute path="/vault" component={Vault} />
            <PrivateRoute path="/user/:id" component={PublicProfile} />
            <PublicRoute path="/register" component={Register} />
            <PublicRoute path="/login" component={Login} />
            <PublicRoute path="/password-recover" component={Recover} />
            <PublicRoute path="/recover-password" component={RecoverPassword} />
            <PublicRoute path="/confirm" component={Confrim} />
            <PublicRoute path="/success" component={Success} />
            <Route path="/publicoffer/:id" component={CreateAdPublicOffer} />
            <Route path="/" exact component={Home} />
            <PrivateRoute path="/product/:id/public-preview" component={Product} />
            <Route path="/product/:id" component={Product} />
            <Route path="/search" component={Search} />
            <Route path="/editor" component={documentConstructor} />
            <Route path="/docTemplate/:docType" component={DocTemplatePage} />
            {/* Здесь повтор компонента landing существует для локальной разработки, так как в коде выше проверяется */}
            <Route path="/landing" component={Landing} />
            <Route path="/help/:page/:section" component={Help} />
            <Route path="/help/:page" component={Help} />
            <Route path="/help" component={Help} />
            <Route path="/info/:page" component={Help} />
            <Route path="/info" component={Help} />
            <Route path="/document_signed" component={DocumentSigned} />
            <Route path="/signNowDemo" component={SignNowDemo} />

          </Switch>
      }
    </Suspense>
  )
}

export default App
