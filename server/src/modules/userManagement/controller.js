const { validateUserData, getUserDetails, sendVerificationEmail,fileupload} = require('./helper');
const { createUser, findUser, updateUser, findResetDetails, deleteResetDetails} = require('./dto');
const {loginTokenExpiry} = require('./constants');
require('dotenv').config();
const path = require('path');


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const getuser= async (req,res) =>{
  const user=req.user;
  return res.json({user})
}


const signin = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;
        const user = await findUser({ username: usernameOrEmail, email: usernameOrEmail });
        if (!(user)) {
          throw new Error('User not found! Signup!');
      }
        if (!(await bcrypt.compare(password, user.password))) {
          throw new Error('Password is wrong.');
      }
        if (user.emailVerify ==false) {
          throw new Error('Please verify email. Check registered mail inbox!!');
        }
        const userDetails = await getUserDetails(user);
        const token = jwt.sign(userDetails, process.env.SECRET_KEY, { expiresIn: loginTokenExpiry });
        return res.json({ user, token });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

const signup = async (req, res) => {
    try {
      const userDetails = await validateUserData(req.body);
      const user = await createUser(userDetails);
      try {
        const mailer = await sendVerificationEmail(user.username, user.email, false)
        return res.status(200).json({
          success: true,
          message: 'User Created and Email Sent to registered Id for verification',
        });
      } catch (error) {
        console.error('Error sending mail:', error);
        return res.status(500).json({ success: false, error: 'An error occurred.' });
      }
    } catch (error) {
      // Handle validation errors here
      console.error('Validation error:', error);
      return res.status(400).json({ success: false, error: error.message });
    }
  };
  

  const updateuserdetails = async (req, res) => {
    try {
      console.log(req.body);
      const user=req.user;
        const {firstName,
          lastName,
          rollNo,
          institute,
          profileType,
          brandName,
          brandLink,
          brandLogo,
          brandFavicon}=req.body;
        const updatedUserData = await updateUser({email:user.email, firstName,
          lastName,
          rollNo,
          institute,
          profileType,
          brandName,
          brandLink,
          brandLogo,
          brandFavicon})
        return res.status(200).json({ success: true, message: 'Details updated' });      
    } catch (error) {
      // Handle validation errors here
      console.error('Validation error:', error);
      return res.status(400).json({ success: false, error: error.message });
    }
  };

const updatepassword = async(req,res)=>{
  try{
  const {token} = req.query;
  if (token)
  {
    const pass = req.body; // Get the updated user data from the request body
    const user = await findResetDetails(token);
    const newuser =  await updateUser({password:pass.password, email:user.email});
    await deleteResetDetails(user.username);
    return res.status(200).json({ success: true, message: 'Details updated' });
  }
  else{
    return res.json({success:false, message:'Token not found'});
  }
} catch (error) {
  res.status(500).json({ success: false, message: 'An error occurred while updating password! Try forgot password option after some time!' });
}
};

  const verifymail = async (req, res) => {
    try {
      const { token } = req.query;
      
      const resetPass = await findResetDetails(token); 
      const user = await findUser({ username: null, email: resetPass.email });
      
      const resetTokenExpirationTimestamp = new Date(resetPass.resetTokenExpiration);
      const numericTimestamp = resetTokenExpirationTimestamp.getTime();
      const currentTimestamp = Date.now();
      
      if (resetPass.resetToken === token && numericTimestamp > currentTimestamp)
       {
        console.log('condition passed')
        if (!resetPass.passwordReset) {
          if (!user.emailVerify) {
            user.emailVerify = true;
            await user.save();
            res.status(250).json({ success: true, message: 'Email successfully verified!' });
          } else {
            res.status(251).json({ success: true, message: 'Email already verified.' });
          }
        } else {
          resetPass.passwordReset = false;
          await resetPass.save();
          res.status(210).json({ success: true, message: 'Email verified for password reset!' });
        }
      } else {
        res.status(400).json({ success: false, message: 'Verification failed. Token expired or invalid.' });
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ success: false, message: 'An error occurred while verifying the email.' });
    }
  };
  

const forgotpassword = async (req, res) => {  
    const {username,email} = req.body;
    try {
      const user = await findUser({ username, email });
      if (user) {
             await sendVerificationEmail(user.username,user.email,true);          
            res.status(210).json({success:true, message:'Verification mail sent successfully'});
      } else {
        throw new Error('User not found!');
     }
    } catch (error) {
     return res.status(400).json({ error: error.message });
    }
  };

  const uploadbrandlogo = async (req, res) => {
    // Handle file upload here
    const filefolder='branding/'
   
   await fileupload(req,filefolder);
    const file = req.file;
    console.log(file);
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    // You can access the file properties using `file` object
    const { originalname, filename, path } = file;
    const newpath= `${process.env.MEDIA_URL}/`+path;
    return res.json({ message: 'File uploaded successfully', originalname, filename, newpath });
  };
  
  
const getbrandlogo = async(req,res)=>{
  try
  {
  const filename = req.params.filename;
  console.log(filename);
  const imagePath = path.join(__dirname, '../../../uploads/branding', filename);
  console.log(imagePath);
  res.sendFile(imagePath);
  }catch(err){
    
    throw err;
  }
}

const verifycaptcha = async(req,res)=>{
  const { token } = req.body;

  // Define the verification data as a URL-encoded string
  const verificationData = new URLSearchParams({
    secret: "6Le3-xQoAAAAAMpviLPLrejkRhJcNLPiTmOH2IHy",
    response: token,
  }).toString();

  try {
    const verificationResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: verificationData,
      }
    );

    const verificationResult = await verificationResponse.json();

    if (verificationResult.success) {
      res.json({ score: verificationResult.score });
    } else {
      res.json({ score: 0 });
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

  module.exports = {
    signin,
    signup,
    getuser,
    verifymail,
    forgotpassword,
    updateuserdetails,
    uploadbrandlogo,
    getbrandlogo,
    updatepassword,
    verifycaptcha
  }