const { Resend } = require('resend');

let resend = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'skip_for_now') {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM = process.env.RESEND_FROM || 'GSSS NextStep <noreply@nextstep.gsss.edu>';

async function send(to, subject, html) {
  const r = getResend();
  if (!r) { console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`); return; }
  try {
    await r.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
}

async function sendLORRequest(facultyEmail, facultyName, student, lor) {
  await send(facultyEmail, `New LOR Request from ${student.name}`,
    `<p>Dear ${facultyName},</p>
     <p><b>${student.name}</b> (USN: ${student.usn}, Branch: ${student.branch}) has submitted a Letter of Recommendation request.</p>
     <p><b>Purpose:</b> ${lor.purpose}<br/>
     <b>Institution:</b> ${lor.institution_name || 'Not specified'}<br/>
     <b>Program:</b> ${lor.program_name || 'Not specified'}</p>
     <p>Please log in to GSSS NextStep to review and respond.</p>`
  );
}

async function sendLORApproved(studentEmail, studentName, lor, pdfUrl) {
  await send(studentEmail, 'Your LOR has been Approved ✅',
    `<p>Dear ${studentName},</p>
     <p>Great news! Your Letter of Recommendation for <b>${lor.institution_name || lor.purpose}</b> has been <b>approved</b>.</p>
     ${pdfUrl ? `<p><a href="${pdfUrl}" style="background:#2563EB;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">Download Your LOR</a></p>` : ''}
     <p>Best wishes for your journey ahead!</p>
     <p>— GSSS NextStep</p>`
  );
}

async function sendLORRejected(studentEmail, studentName, lor, remarks) {
  await send(studentEmail, 'Update on Your LOR Request',
    `<p>Dear ${studentName},</p>
     <p>Your LOR request for <b>${lor.institution_name || lor.purpose}</b> could not be approved at this time.</p>
     ${remarks ? `<p><b>Remarks:</b> ${remarks}</p>` : ''}
     <p>Please contact your faculty for further guidance.</p>
     <p>— GSSS NextStep</p>`
  );
}

module.exports = { sendLORRequest, sendLORApproved, sendLORRejected };
