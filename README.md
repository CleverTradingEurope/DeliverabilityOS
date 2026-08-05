# Deliverability OS

A Real-Time Deliverability Intelligence Center platform. Deliverability OS goes beyond traditional static email validation by offering predictive intelligence, real-time SMTP handshakes, and auto-correction.

## 🚀 Killer Features

* **Zero-Unknown Guarantee:** Stop paying for timeouts. If the receiving server blocks the connection, the system automatically refunds the credit.
* **Catch-All Intelligence:** Cross-references historical logs and B2B data to score the probability of actual delivery on Catch-All domains.
* **Self-Healing Lists:** Detects typos (e.g., `@gmial.com`), corrects them on the fly, validates the new address, and returns the clean contact.
* **Contextual Risk Scoring:** Adjusts validation thresholds based on campaign context (e.g., B2B cold outreach vs. B2C newsletters).
* **Zero-Friction SDK:** A lightweight script for web forms that silently corrects typos before submission.
* **Sender Health Monitor:** Audits your domain's DNS, SPF, DKIM, and Blacklist status concurrently.

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Lucide React
* **Backend:** Node.js, Express, TypeScript, native `net` and `dns` modules for SMTP
* **Infrastructure:** Docker, Docker Compose

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (runs both Vite and the Express backend):
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## 🐳 Deployment (Docker & VPS)

You can easily deploy this application to your VPS using Docker.

1. Clone or upload this repository to your VPS.
2. Navigate to the project directory.
3. Run the following command to build and start the container in detached mode:
   ```bash
   docker-compose up -d --build
   ```
4. The application will be accessible on port `80` of your VPS IP address.

### ⚠️ IMPORTANT: Port 25 Requirement

This application performs real-time SMTP handshakes to validate emails. This requires **outbound traffic on Port 25** to be open.
Most major cloud providers (AWS, DigitalOcean, Linode, Google Cloud) **block outbound Port 25 by default** to prevent spam. 

To ensure the validation engine works:
1. Contact your VPS provider's support team.
2. Request them to unblock outbound Port 25.
3. You may need to provide a justification (e.g., "I am hosting an email validation application that requires outbound SMTP handshakes to verify inbox existence").
4. Configure reverse DNS (rDNS/PTR records) for your VPS IP address to improve validation success rates.
