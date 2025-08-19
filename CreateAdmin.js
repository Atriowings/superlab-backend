const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin'); // Adjust path to your Admin model
require('dotenv').config(); // Make sure you have dotenv installed

// --- Connection to your Database ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB Connected...');
  createAdmin();
}).catch(err => console.log(err));


// --- Function to Create the Admin ---
const createAdmin = async () => {
  try {
    // Check if an admin with this username already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user "admin" already exists.');
      // Optionally, you can update the password here if needed
      // existingAdmin.password = 'newSecurePassword123!';
      // await existingAdmin.save();
      // console.log('Admin password updated.');
      mongoose.connection.close();
      return;
    }

    // Create a new admin instance
    const newAdmin = new Admin({
      username: 'admin', // or whatever username you want
      password: 'Password123!', // The password you want to use for login
      name: 'Admin',
    });

    // Save the new admin to the database
    // The pre-save hook in your schema will automatically hash the password
    await newAdmin.save();

    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: Password123!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};
