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
    return createResponse(originalEmail, finalEmail, hasTypo, suggestedEmail, 'undeliverable', 'invalid_syntax', 0, 0, 'Bad address syntax', startTime);
  }

  const [_, domain] = finalEmail.split('@');
  
  try {
    // 3. DNS MX Lookup
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
        return createResponse(originalEmail, finalEmail, hasTypo, suggestedEmail, 'undeliverable', 'no_mx_records', 0, 550, 'DNS: No MX records found', startTime);
    }

    // Sort by priority (lowest priority number = highest priority server)
    mxRecords.sort((a, b) => a.priority - b.priority);
    const mxHost = mxRecords[0].exchange;

    // 4. Real SMTP Handshake
    const smtpResult = await checkSMTP(finalEmail, mxHost);
    
    return createResponse(
        originalEmail, 
        finalEmail, 
        hasTypo, 
        suggestedEmail, 
        smtpResult.status, 
        smtpResult.sub_status, 
        smtpResult.score, 
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
        0, 
        `Network Error Encountered`, 
        startTime
    );
  }
}

function checkSMTP(email: string, mxHost: string): Promise<any> {
    return new Promise((resolve) => {
        const socket = net.createConnection(25, mxHost);
        let step = 0;
        let responseCode = 0;
        let isClosed = false;
        
        socket.setTimeout(2500); // 2.5 second timeout to keep it fast
        
        const closeSocket = () => {
            if (!isClosed) {
                isClosed = true;
                socket.end();
                socket.destroy();
            }
        };

        socket.on('data', (data) => {
            const response = data.toString();
            const codeMatch = response.match(/^(\d{3})/);
            if (codeMatch) {
                responseCode = parseInt(codeMatch[1], 10);
            }

            if (step === 0 && responseCode === 220) {
                socket.write(`HELO deliverabilityos.local\r\n`);
                step++;
            } else if (step === 1 && responseCode === 250) {
                socket.write(`MAIL FROM:<verify@deliverabilityos.local>\r\n`);
                step++;
            } else if (step === 2 && responseCode === 250) {
                socket.write(`RCPT TO:<${email}>\r\n`);
                step++;
            } else if (step === 3) {
                socket.write(`QUIT\r\n`);
                closeSocket();
                
                if (responseCode === 250 || responseCode === 251 || responseCode === 252) {
                    // We cannot state the mailbox definitively exists just because it accepted the connection (Catch-All)
                    resolve({ status: 'unknown', sub_status: 'catch_all_unverified', score: 50, responseCode, rawMessage: 'Server accepted connection, unverified existence' });
                } else if (responseCode >= 500 && responseCode < 600) {
                    resolve({ status: 'undeliverable', sub_status: 'mailbox_not_found', score: 10, responseCode, rawMessage: 'Mailbox not found' });
                } else {
                    resolve({ status: 'unknown', sub_status: 'unexpected_response', score: 50, responseCode, rawMessage: 'Unexpected server response' });
                }
            }
        });

        socket.on('error', (err: any) => {
            closeSocket();
            resolve({ status: 'unknown', sub_status: 'connection_error', score: 0, responseCode: 0, rawMessage: 'Connection failed or blocked' });
        });

        socket.on('timeout', () => {
            closeSocket();
            resolve({ status: 'unknown', sub_status: 'server_timeout', score: 0, responseCode: 0, rawMessage: 'Connection Timed Out' });
        });
    });
}

function createResponse(originalEmail: string, email: string, hasTypo: boolean, suggestedEmail: string, status: any, sub_status: string, score: number, response_code: number, raw_server_message: string, startTime: number) {
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
            is_catch_all: sub_status === 'catch_all_unverified',
            deliverability_probability_percentage: sub_status === 'catch_all_unverified' ? null : 0
          },
          smtp_transparency_log: {
            mx_used: '[REDACTED]',
            response_code,
            raw_server_message
          }
        }
      };
}
