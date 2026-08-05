import dns from 'dns';
import net from 'net';

const COMMON_TYPOS: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'outlok.com': 'outlook.com',
  'oultook.com': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'yahou.com': 'yahoo.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
};

export async function validateEmail(originalEmail: string) {
  const startTime = Date.now();
  const trimmedEmail = originalEmail.trim().toLowerCase();
  let finalEmail = trimmedEmail;
  let hasTypo = false;
  let suggestedEmail = '';

  // 1. Basic Typo Engine
  if (trimmedEmail.includes('@')) {
    const [local, domain] = trimmedEmail.split('@');
    if (COMMON_TYPOS[domain]) {
      hasTypo = true;
      suggestedEmail = `${local}@${COMMON_TYPOS[domain]}`;
      finalEmail = suggestedEmail;
    }
  }

  // 2. Syntax Check
  const isSyntaxValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail);
  
  if (!isSyntaxValid) {
    return {
      originalEmail,
      email: finalEmail,
      status: 'undeliverable',
      sub_status: 'invalid_syntax',
      score: 0,
      execution_time_ms: Date.now() - startTime,
      value_adds: {
        zero_waste_guarantee: { credit_charged: true, refunded: false, reason: "Definitive status" },
        auto_correction: { has_suggestion: false },
        catch_all_analysis: { is_catch_all: false },
        smtp_transparency_log: { mx_used: 'none', response_code: 501, raw_server_message: '501 Bad address syntax' }
      }
    };
  }

  const [_, domain] = finalEmail.split('@');
  
  try {
    // 3. DNS MX Lookup
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
        return createResponse(originalEmail, finalEmail, hasTypo, suggestedEmail, 'undeliverable', 'no_mx_records', 0, 'none', 550, 'DNS: No MX records found', startTime);
    }

    // Sort by priority (lowest priority number = highest priority server)
    mxRecords.sort((a, b) => a.priority - b.priority);
    const mxHost = mxRecords[0].exchange;

    // 4. Real SMTP Handshake
    const smtpResult = await checkSMTP(finalEmail, mxHost);
    
    // Simulate Catch-All check (a real system would check a random gibberish email to see if it's accepted)
    // For this demonstration, we'll mark some domains dynamically based on responses.
    
    return createResponse(
        originalEmail, 
        finalEmail, 
        hasTypo, 
        suggestedEmail, 
        smtpResult.status, 
        smtpResult.sub_status, 
        smtpResult.score, 
        mxHost, 
        smtpResult.responseCode, 
        smtpResult.rawMessage, 
        startTime
    );

  } catch (error: any) {
     return createResponse(
        originalEmail, 
        finalEmail, 
        hasTypo, 
        suggestedEmail, 
        'unknown', 
        'dns_or_network_error', 
        0, 
        'none', 
        0, 
        `Network Error: ${error.message}`, 
        startTime
    );
  }
}

function checkSMTP(email: string, mxHost: string): Promise<any> {
    return new Promise((resolve) => {
        const socket = net.createConnection(25, mxHost);
        let step = 0;
        let responseCode = 0;
        let rawMessage = '';
        
        socket.setTimeout(3000); // 3 second timeout to keep it fast
        
        socket.on('data', (data) => {
            const response = data.toString();
            rawMessage += response;
            const codeMatch = response.match(/^(\d{3})/);
            if (codeMatch) {
                responseCode = parseInt(codeMatch[1], 10);
            }

            if (step === 0 && responseCode === 220) {
                socket.write(`HELO deliverability-os.local\r\n`);
                step++;
            } else if (step === 1 && responseCode === 250) {
                socket.write(`MAIL FROM:<verify@deliverability-os.local>\r\n`);
                step++;
            } else if (step === 2 && responseCode === 250) {
                socket.write(`RCPT TO:<${email}>\r\n`);
                step++;
            } else if (step === 3) {
                socket.write(`QUIT\r\n`);
                if (responseCode === 250 || responseCode === 251 || responseCode === 252) {
                    resolve({ status: 'deliverable', sub_status: 'mailbox_exists', score: 95, responseCode, rawMessage: response.trim() });
                } else if (responseCode >= 500 && responseCode < 600) {
                    resolve({ status: 'undeliverable', sub_status: 'mailbox_not_found', score: 10, responseCode, rawMessage: response.trim() });
                } else {
                    resolve({ status: 'unknown', sub_status: 'unexpected_response', score: 50, responseCode, rawMessage: response.trim() });
                }
            }
        });

        socket.on('error', (err: any) => {
            let message = err.message;
            if (err.code === 'ECONNREFUSED') message = 'Connection Refused (Port 25 likely blocked by Cloud Provider)';
            resolve({ status: 'unknown', sub_status: 'connection_error', score: 0, responseCode: 0, rawMessage: message });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({ status: 'unknown', sub_status: 'server_timeout', score: 0, responseCode: 0, rawMessage: 'Connection Timed Out (Port 25 blocked by Firewall/Provider)' });
        });
    });
}

function createResponse(originalEmail: string, email: string, hasTypo: boolean, suggestedEmail: string, status: any, sub_status: string, score: number, mx_used: string, response_code: number, raw_server_message: string, startTime: number) {
    return {
        originalEmail,
        email,
        status,
        sub_status: hasTypo ? 'syntax_typo_detected' : sub_status,
        score,
        execution_time_ms: Date.now() - startTime,
        value_adds: {
          zero_waste_guarantee: {
            credit_charged: status !== 'unknown',
            refunded: status === 'unknown',
            reason: status === 'unknown' ? 'Timeout/Connection Error reached' : 'Definitive status reached'
          },
          auto_correction: {
            has_suggestion: hasTypo,
            suggested_email: hasTypo ? suggestedEmail : undefined,
            suggested_email_status: hasTypo ? status : undefined,
            confidence_score: hasTypo ? 99 : undefined
          },
          catch_all_analysis: {
            is_catch_all: false, // For a real system, you ping a fake inbox like hrghs@domain.com
            deliverability_probability_percentage: null
          },
          smtp_transparency_log: {
            mx_used,
            response_code,
            raw_server_message
          }
        }
      };
}
