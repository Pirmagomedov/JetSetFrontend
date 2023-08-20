import React from "react";
import { useHistory } from "react-router-dom";
import Button from "src/components/Button/Button";
import Layout from "src/hoc/Layout";
import './OnlyDesktop.scss'

const OnlyDesktop: React.FC = () => {
    const router = useHistory()

    return (
        <Layout>
            <div className="viewHide">
                <div className="viewHide__img">
                    <img src="assets/images/viewHide.svg" />
                </div>
                <div className="viewHide__title">
                    <h2>Desktop View is Required</h2>
                </div>
                <div className="viewHide__link">
                    <a style={{textDecoration: 'underline'}}>Share link in my desktop</a>
                </div>
                <div className="viewHide__button">
                    <Button onClick={() => router.goBack()}>Return</Button>
                </div>
            </div>
        </Layout>
    )
}

export default OnlyDesktop