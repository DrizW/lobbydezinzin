import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  // Configure un transport SMTP réel dans la VM (ex: Mailtrap, SMTP provider)
  // Variables d'env suggérées: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.SMTP_FROM || "no-reply@lobbydezinzin.com";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transporter.sendMail({ from, to, subject, html });
}


