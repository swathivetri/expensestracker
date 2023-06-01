const uuid = require('uuid');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/users');
const Forgotpassword = require('../models/forgotpassword');

const forgotpassword = async (req, res) => {
    try {
        const { email } =  req.body;
        const user = await User.findAll({where : { email:req.body.email }});
        if(user.length>0){
            const id = uuid.v4();
            await Forgotpassword.create({ id , active: true })
                .catch(err => {
                    throw new Error(err)
                })
                console.log(user[0].id);
                console.log(user.length);
                const Sib=require('sib-api-v3-sdk');
                const client =Sib.ApiClient.instance;
          
                const apiKey = client.authentications['api-key'];
                apiKey.apiKey =process.env.API_KEY
                console.log('------------------------------------------------');

                const tranEmailApi = new Sib.TransactionalEmailsApi();
        
                const sender = {
                  email : req.body.email,
                }
                
                const receivers = [
                  {
                    email :'swathivetri1992@gmail.com',
                  },
                ]

                console.log("user found");
                tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject:  "Reset Password",
                textContent: "Send a reset password mail",
                htmlContent: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,   
            
        }).then(() => {
           // return res.status(200).json({message:"Message send successfully",Userid:user[0].id});
                // console.log(response[0].statusCode)
                // console.log(response[0].headers)
                return res.status(200).json({message: 'Link to reset password sent to your email ', sucess: true})

            })

            //send mail
        }else {
            throw new Error('User doesnt exist')
        }
    } catch(err){
        console.error(err)
        return res.status(400).json({ message: err, sucess: false });
    }

}

const resetpassword = (req, res) => {
    const id =  req.params.id;
    Forgotpassword.findAll({ where : { id }}).then(forgotpasswordrequest => {
        if(forgotpasswordrequest){
            Forgotpassword.update({ active: false},
            {where:{id}});
            console.log('i am forgotpassword');
            res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>

                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
                                )
            res.end()

        }
    })
}

const updatepassword = (req, res) => {

    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findAll({ where : { id: resetpasswordid }}).then(resetpasswordrequest => {
            User.findAll({where: { id : resetpasswordrequest.userId}}).then(user => {
                // console.log('userDetails', user)
                if(user) {
                    //encrypt the password

                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err, hash) {
                            // Store hash in your password DB.
                            if(err){
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash }).then(() => {
                                res.status(201).json({message: 'Successfuly update the new password'})
                            })
                        });
                    });
            } else{
                return res.status(404).json({ error: 'No user Exists', success: false})
            }
            })
        })
    } catch(error){
        return res.status(403).json({ error, success: false } )
    }

}


module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
}