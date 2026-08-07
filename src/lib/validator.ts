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
    return createResponse(originalEmail, finalEmail, hasTypo, suggestedEmail, 'undeliverable', 'invalid_syntax', 0, 0, 'Bad address syntax', false, startTime);
  }

  const [_, domain] = finalEmail.split('@');
  
  try {
    // 3. DNS MX Lookup
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
        return createResponse(originalEmail, finalEmail, hasTypo, suggestedEmail, 'undeliverable', 'no_mx_records', 0, 550, 'DNS: No MX records found', false, startTime);
    }

    // Sort by priority (lowest priority number = highest priority server)
    mxRecords.sort((a, b) => a.priority - b.priority);
    
    // Limit to the top 2 MX records to prevent extremely long timeouts if all are tarpitting
    const topMxRecords = mxRecords.slice(0, 2);
    
    let smtpResult: any = null;
    let mxHost = '';

    // 4. Real SMTP Handshake
    for (const record of topMxRecords) {
        mxHost = record.exchange;
        smtpResult = await checkSMTP(finalEmail, mxHost);
        
        // If we connected and got an SMTP response (even an unexpected one), stop trying other MX servers.
        // We only continue if we couldn't connect or timed out.
        if (smtpResult.sub_status !== 'connection_error' && smtpResult.sub_status !== 'server_timeout') {
            break;
        }
    }
    
    if (!smtpResult) {
        smtpResult = { status: 'unknown', sub_status: 'connection_error', score: 0, responseCode: 0, rawMessage: 'Failed to connect to any MX server' };
    }
    
    let finalStatus = smtpResult.status;
    let finalSubStatus = smtpResult.sub_status;
    let finalScore = smtpResult.score;
    let isCatchAll = false;

    if (finalStatus === 'deliverable') {
        // Mailbox accepted, let's verify if the domain is a catch-all
        const randomEmail = `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@${domain}`;
        const randomResult = await checkSMTP(randomEmail, mxHost);
        
        if (randomResult.status === 'deliverable') {
            isCatchAll = true;
            // If the domain accepts everything, we can't be sure the real mailbox exists
            finalStatus = 'unknown';
            finalSubStatus = 'catch_all';
            finalScore = 50;
        } else {
            // Random email rejected, but real email accepted! It definitively exists.
            finalSubStatus = 'mailbox_exists';
        }
    }
    
    return createResponse(
        originalEmail, 
        finalEmail, 
        hasTypo, 
        suggestedEmail, 
        finalStatus, 
        finalSubStatus, 
        finalScore, 
        smtpResult.responseCode, 
        smtpResult.rawMessage, 
        isCatchAll,
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
        false,
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
        let buffer = '';
        
        socket.setTimeout(10000); // 10 second timeout
        
        const closeSocket = () => {
            if (!isClosed) {
                isClosed = true;
                socket.end();
                socket.destroy();
            }
        };

        socket.on('data', (data) => {
            buffer += data.toString();
            
            // SMTP responses end with CRLF. The last line has the format "XYZ " (space instead of hyphen)
            const lines = buffer.split('\r\n').filter(line => line.length > 0);
            if (lines.length === 0) return;
            
            const lastLine = lines[lines.length - 1];
            const codeMatch = lastLine.match(/^(\d{3})(?: |$)/);
            
            if (!codeMatch) {
                // Multiline response is not yet complete
                return;
            }
            
            responseCode = parseInt(codeMatch[1], 10);
            const fullResponse = buffer;
            buffer = ''; // Reset buffer for the next step
            
            // Handle errors or rejections immediately
            if (responseCode >= 400) {
                socket.write(`QUIT\r\n`);
                closeSocket();
                
                if (responseCode >= 500 && responseCode < 600) {
                    if (step === 3) {
                        resolve({ status: 'undeliverable', sub_status: 'mailbox_not_found', score: 10, responseCode, rawMessage: fullResponse.trim() });
                    } else {
                        resolve({ status: 'unknown', sub_status: 'server_rejected', score: 50, responseCode, rawMessage: fullResponse.trim() });
                    }
                } else {
                    resolve({ status: 'unknown', sub_status: 'greylisted_or_blocked', score: 50, responseCode, rawMessage: fullResponse.trim() });
                }
                return;
            }

            // State Machine
            if (step === 0 && responseCode === 220) {
                socket.write(`HELO dos.ideaclik.com\r\n`);
                step++;
            } else if (step === 1 && responseCode === 250) {
                // Use the domain part of the email for a generic HELO string to appear less spammy, but still trackable
                socket.write(`MAIL FROM:<verify@ideaclik.com>\r\n`);
                step++;
            } else if (step === 2 && responseCode === 250) {
                socket.write(`RCPT TO:<${email}>\r\n`);
                step++;
            } else if (step === 3) {
                socket.write(`QUIT\r\n`);
                closeSocket();
                
                if (responseCode === 250 || responseCode === 251 || responseCode === 252) {
                    resolve({ status: 'deliverable', sub_status: 'accepted', score: 95, responseCode, rawMessage: 'Server accepted connection' });
                } else {
                    resolve({ status: 'unknown', sub_status: 'unexpected_response', score: 50, responseCode, rawMessage: fullResponse.trim() });
                }
            } else {
                socket.write(`QUIT\r\n`);
                closeSocket();
                resolve({ status: 'unknown', sub_status: 'unexpected_response', score: 50, responseCode, rawMessage: fullResponse.trim() });
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

function createResponse(originalEmail: string, email: string, hasTypo: boolean, suggestedEmail: string, status: any, sub_status: string, score: number, response_code: number, raw_server_message: string, isCatchAll: boolean, startTime: number) {
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
            is_catch_all: isCatchAll,
            deliverability_probability_percentage: isCatchAll ? null : (status === 'deliverable' ? 100 : 0)
          },
          smtp_transparency_log: {
            mx_used: '[REDACTED]',
            response_code,
            raw_server_message
          }
        }
      };
}
