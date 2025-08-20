// routes/authRoutes.js
import express from 'express';
import { userSchema } from '../validator/userValidator.js';
import { auth, db } from '../config/fireBase.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { sendOTPEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const userData = req.body;
        console.log("Received signup request:", userData);

        // ✅ Validate input
        await userSchema.validate(userData);
        console.log("User data is valid:", userData);

        const { email, password, name, gender, dob, otp } = userData;
        console.log("Extracted user data:", { email, password});
        // get the otp from the database using user email 
        const otpDoc = await db.collection('otp').doc(email).get();
        console.log("Fetched OTP document for email:", email);
        if (!otpDoc.exists) {
            throw new Error('OTP not found for this email');
        }
        const storedOtp = otpDoc.data().otp;
        console.log("Stored OTP for email:", email, "is", storedOtp);
        if (otp !== storedOtp) {
            throw new Error('Invalid OTP');
        }
        console.log("OTP is valid for email:", email);


        // generate the otp 

        // // ✅ Create user in Firebase Auth
        console.log("Creating user with email:", email);
        const userCredential = await auth.createUser({
            email,
            password,
            displayName: name
        })
        const uid = userCredential.uid;
        console.log("User created successfully with UID:", uid);

        // ✅ Store additional user data in Firestore
        await db.collection('users').doc(uid).set({
          name,
          gender,
          dob,
          email,
          createdAt: new Date()
        });

        res.status(201).json({ message: 'User signed up successfully', uid });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({ error: error.message });
    }
});

router.get('/otpGenerate', async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Received OTP generation request for email:", email);

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Invalid email format');
        }
        console.log("Email is valid:", email);
        // ✅ Generate OTP (for simplicity, using a random number here)
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log("Generated OTP:", otp);
        await sendOTPEmail(email, otp);
        console.log("OTP sent to email:", email);
        // ✅ Store OTP in Firestore for verification later

        const otpDoc = db.collection('otp').doc(email);
        await otpDoc.set({
            otp,
            createdAt: new Date()
        });
        console.log("OTP stored in Firestore for email:", email);
        res.status(200).json({ message: 'OTP sent successfully', otp });
    } catch (error) {
        console.error('OTP generation error:', error);
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Received login request for email:", email);

        // ✅ Validate input
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        console.log("Input validation passed for email:", email);

        // ✅ Authenticate user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User logged in successfully with UID:", userCredential.user.uid);

        res.status(200).json({ message: 'User logged in successfully', uid: userCredential.user.uid });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: error.message });
    }
});
export default router;
