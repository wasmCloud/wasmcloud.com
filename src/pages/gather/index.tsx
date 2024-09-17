import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';

const REDIRECT_LINK = 'https://app.gather.town/app/uoWBIow9WnsTDD4u/wasmCloud%20Innovation%20Day';

function ContactForm() {
  React.useEffect(() => {
    setTimeout(() => window.location.assign(REDIRECT_LINK), 2000);
  }, []);

  return (
    <Layout title={`Contact`} description="wasmCloud - Why stop at the Edge?">
      <main style={{ margin: '0 auto', width: 'max-content', paddingTop: '10vh' }}>
        <Heading
          as="h1"
          style={{ textAlign: 'center', marginBottom: 'calc(var(--ifm-leading) * 2)' }}
        >
          Redirecting to Gather
        </Heading>

        <p>
          Thanks for joining us! We are redirecting you to wasmCloud Innovation Day Hangout on
          Gather.
        </p>
        <p>
          If you are not redirected, please use the following link:{' '}
          <Link to={REDIRECT_LINK}>Visit Gather</Link>
        </p>
      </main>
    </Layout>
  );
}
export default ContactForm;
