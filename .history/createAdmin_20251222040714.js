// createAdmin.js
require("dotenv").config();
const connectDB = require("./src/config/db");
const Admin = require("./src/models/Admin");

(async () => {
  try {
    await connectDB();

    // const username = "admin";
    // const email = "admin@gmail.com";
    // const password = "yourStrongPassword123";

    // const username = "admin";
    // const email = "admin@gmail.com";
    // const password = "Admin@12345";

    // find existing admin by username or email
    let admin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (!admin) {
      admin = new Admin({
        username,
        email,
        passwordHash: "temp", // placeholder until setPassword runs
      });
    }

    await admin.setPassword(password); // hashes the password
    await admin.save();

    console.log("✅ Admin ready:");
    console.log({ username, email, password });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
})();
