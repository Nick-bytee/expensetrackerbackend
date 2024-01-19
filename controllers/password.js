const sib = require("sib-api-v3-sdk");
const UUID = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const ForgotPasswordRequest = require("../models/forgotPasswordRequests");
require("dotenv").config();

exports.sendMail = async (req, res, next) => {
  const email = req.body.email;
  const client = sib.ApiClient.instance;
  const apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.EMAIL_API;

  const tranMailApi = new sib.TransactionalEmailsApi();

  const sender = {
    email: "noreply@nick.com",
    name: "Nick",
  };
  try {
    //finding user which created request
    const user = await User.findOne({ email: email });
    console.log(user);
    if (user) {
      //creating request
      const uuid = UUID.v4();
      const forgotPasswordRequest = new ForgotPasswordRequest({
        uuid: uuid,
        userId: user,
        isActive: true,
      });
      await forgotPasswordRequest.save();

      const reciever = {
        email: email,
      };

      await tranMailApi.sendTransacEmail({
        sender,
        to: [reciever],
        subject: "Reset Your Password",
        htmlContent: `<h1>Hello</h1>
                <p>Click On the Below Link To Reset Your Password</p>
                <p><a href="http://localhost:3000/password/resetPassword/${uuid}">Reset Password</a></p>
                <p>Thank You</p>`,
      });
      res.status(200).json({
        message: "Link has been sent.",
      });
    } else {
      res.status(502).json({ message: "User Not Found" });
    }
  } catch (err) {
    console.log(err);
    res.status(502).json({ message: "An error Occured" });
  }
};

exports.resetPassword = async (req, res) => {
  const uuid = req.params.uuid;
  console.log(uuid);
  try {
    const data = await ForgotPasswordRequest.findOne({ uuid: uuid });
    if (data.isActive) {
      await ForgotPasswordRequest.findOneAndUpdate(
        { uuid: uuid },
        {
          isActive: false,
        }
      );
      const options = {
        headers: {
          uuid: uuid,
        },
      };
      res.status(200).send(`<html>
            <head>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
                <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
                <title>Forgot Passowrd</title>
            </head>
    
            <body style="height: fit-content;">
                <div class="containers" id="container" style="display: grid; justify-content: center;">
                    <h3 class="heading">Reset Your Passowrd</h3>
                    <form method="post" id='email-form' method="get">
                            <div class="mb-3">
                            <label class="form-label">Enter Your New Password</label>
                            <input type="password" class="form-control" id="password">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Confirm Your Password</label>
                                <input type="password" class="form-control" id="password2" name="newPassword" onkeyup="checkPasswordMatch()">
                            </div>
                            <p id="message"></p>
                            <button type="submit" class="btn btn-primary" id="submit" disabled>Submit</button>
                            <button class="btn btn-primary" id="forgot-psk" style="position: absolute; margin-left: 10px; display: none;">Forgot Password?</button>
                    </form>
                </div>
                <script>
                const password = document.getElementById('password')
                const password2 = document.getElementById('password2')
                const message = document.getElementById('message')
                const button = document.getElementById('submit')
                function checkPasswordMatch(){
                        if(password.value !== password2.value){
                                console.log('working')
                                password.style.borderColor = "red"
                                password2.style.borderColor = "red"
                                message.innerHTML = 'Passwords Does Not Match'
                                message.style.color = 'red'
                                button.setAttribute("disabled", "")
                        }else {
                                password.style.borderColor = "black"
                                password2.style.borderColor = "black"
                                message.innerHTML = ""
                                button.removeAttribute("disabled")
                        }
                }
                const form = document.getElementById('email-form');
                form.addEventListener('submit', formsubmitted);
                async function formsubmitted(e){
                    e.preventDefault();
                    const my_obj = {
                        password : password.value
                    }
                    try{
                        const data = await axios.post('http://localhost:3000/password/updatePassword/${uuid}',my_obj)
                        message.innerHTML = data.data.message
                        message.style.color = "green" 
                    }catch(err){
                        console.log(err)
                    }
                }
            </script>
    </body>
        </html>`);
      res.end();
    } else {
      res.send("<h1>Link Not Valid</h1>");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.updatePassword = async (req, res) => {
  const uuid = req.params.id;
  const password = req.body.password;
  try {
    const data = await ForgotPasswordRequest.findOne({ uuid: uuid });
    // update Password
    const hash = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(data.userId, {
      password: hash,
    });
    if (user) {
      res
        .status(200)
        .json({ message: "Success! You can login via new password" });
    } else {
      throw new Error();
    }
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "An Error Occured" });
  }
};
