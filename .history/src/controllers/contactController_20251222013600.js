const nodemailer = require("nodemailer");

exports.sendContactMail = async (req, res) => {
  try {
    const { name, phone, ,message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER, // ttiworldconnect@gmail.com
        pass: process.env.MAIL_PASS, // app password
      },
    });

    await transporter.sendMail({
      from: `"Website Contact" <${process.env.MAIL_USER}>`,
      to: "ttiworldconnect@gmail.com",
      subject: "New Contact Form Message",
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Contact mail error", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};
