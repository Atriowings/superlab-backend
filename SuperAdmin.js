const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SuperAdmin = require('./models/SuperAdmin'); // Adjust path to your Admin model
require('dotenv').config(); // Make sure you have dotenv installed

// --- Connection to your Database ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB Connected...');
  createSuperAdmin();
}).catch(err => console.log(err));


// --- Function to Create the Admin ---
const createSuperAdmin = async () => {
  try {
    // Check if an admin with this username already exists
    const existingAdmin = await SuperAdmin.findOne({ username: 'superadmin' });
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
    const newSuperAdmin = new SuperAdmin({
      username: 'superadmin', // or whatever username you want
      password: 'SuperAdmin@123!', // The password you want to use for login
      name: 'SuperAdmin',
    });

    // Save the new admin to the database
    // The pre-save hook in your schema will automatically hash the password
    await newSuperAdmin.save();

    console.log('Admin user created successfully!');
    console.log('Username: superadmin');
    console.log('Password: SuperAdmin@123!');

  } catch (error) {
    console.error('Error creating Superadmin user:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

