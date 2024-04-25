const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/send", upload.array("attachments"), async (req, res) => {
  const { host, port, user, pass, from, to, subject, body, bodyType } =
    req.body;

  const transporter = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass: pass ?? user,
    },
    tls: {
      rejectUnauthorized: false, // Ignore TLS/SSL certificate errors
    },
  });

  const mailOptions = {
    from,
    to,
    subject,
    [bodyType]: body,
    attachments: req.files.map((file) => ({
      filename: file.originalname,
      path: file.path,
    })),
  };

  try {
    await transporter.sendMail(mailOptions);
    //res.redirect("/");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
