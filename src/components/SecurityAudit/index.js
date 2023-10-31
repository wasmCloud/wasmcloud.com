import React from 'react';
import styles from './styles.module.css';

export default function SecurityAudit() {
    return (
        <div className={styles.securityContainer}>
            <h1>wasmCloud Security Assessment</h1>
            <p className={styles.securityDescription}><i>"WasmCloud is a well reviewed project, with lots of diligence in its security posture. This has paid off, as evidenced by this audit, which had no severe or high issues to resolve."</i> - <a href="https://ostif.org/ostif-has-completed-a-security-audit-of-wasmcloud/">OSTIF Blog Post </a></p>
            <embed className={styles.securityPdf} src="https://docs.google.com/gview?embedded=true&url=https://wasmcloud.com/pdf/wasmcloud-audit-ostif-trail-of-bits-final.pdf" />
        </div>
    );
}
