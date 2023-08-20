import './scss/general.scss'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import React, { Profiler } from 'react'
import ReactDOM from 'react-dom'
import Modal from 'react-modal'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import Loader from './components/Loader/Loader'
import Notification from './components/Notification/Notification'
import AuthMonitor from './helperComponents/AuthMonitor'
import ChatMatchBox from './helperComponents/ChatMatchBox'
import SilentRefresh from './helperComponents/SilentRefresh'
import ApiProvider from './hoc/ApiProvider'
import { store } from './store'

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration)
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error)
            })
    })
}

if (module.hot) module.hot.accept()

const appElement = document.getElementById('app')

Modal.setAppElement(appElement)

// const onRender = (
//     id,
//     phase,
//     actualDuration,
//     baseDuration,
//     startTime,
//     commitTime,
// ) => {
//     console.log(id, phase, actualDuration, baseDuration, startTime, commitTime)
// }

ReactDOM.render(
    <ReduxProvider store={store}>
        <ApiProvider>
            <SilentRefresh />
            <AuthMonitor />
            <ChatMatchBox />
            <Loader />
            <Notification />
            <Router>
                <ScrollToTop />
                {/* <Profiler
                    id="app"
                    onRender={onRender}
                > */}
                    <App />
                {/* </Profiler> */}
            </Router>
        </ApiProvider>
    </ReduxProvider>,
    appElement,
)
