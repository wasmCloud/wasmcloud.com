import React from 'react';
import Layout from '@theme/Layout';
import HubspotForm from 'react-hubspot-form'

function ContactForm() {

    return (
        <Layout
            title={`Contact`}
            description="wasmCloud - Why stop at the Edge?">
            <main>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ width: "25%" }}></div>
                    <div style={{ width: "50%", paddingTop: "5vh" }}>
                        <h1> Contact Us </h1>
                        <HubspotForm
                            portalId='20760433'
                            formId='d0790a3a-39d4-413f-a7dc-525546fafdf5'
                            onSubmit={() => console.log('Submitted form')}
                            onReady={(form) => console.log('Form ready for submit')}
                            region="na1"
                            loading={<div>Loading...</div>}
                        />
                    </div>
                </div>
            </main>
        </Layout>
    );
}
export default ContactForm;
