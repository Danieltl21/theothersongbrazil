import { Resend } from 'resend';

let resendInstance = null;

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
};

/**
 * Envia um e-mail transacional via Resend API
 * @param {Object} options
 * @param {string} options.to - E-mail do destinatário
 * @param {string} options.subject - Assunto do e-mail
 * @param {string} options.html - Conteúdo HTML da mensagem
 * @param {string} [options.text] - Texto puro alternativo
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'The Other Song Brasil <onboarding@resend.dev>';

  if (!resend) {
    console.log(`[MAILER SIMULATION] Resend API Key não configurada no env. Simulação de envio para ${to}:`);
    console.log(`Assunto: ${subject}`);
    console.log(`Corpo: ${text || html}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: subject,
      html: html,
      text: text
    });

    console.log(`[MAILER SUCCESS] E-mail enviado com sucesso via Resend para ${to}. ID: ${data?.id}`);
    return { success: true, data };
  } catch (error) {
    console.error(`[MAILER ERROR] Falha ao enviar e-mail via Resend para ${to}:`, error);
    throw error;
  }
};
