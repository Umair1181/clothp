const Router = require( "express").Router();
const bcrypt = require("bcryptjs");
const { MainBranchSignUp } = require("../../Modal")

Router.post( "/update-password", (req, res ) =>{
    const { user } = req.body;
    let RegularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    let errorMessage = "";
    if( user.email === "" ){
        errorMessage = "Invalid Email";
    }else if( user.password === "") {
        errorMessage = "Invalid Password";
    }else if (!RegularExpression.test(String(user.email).toLowerCase())) {
        errorMessage = "Invalid Email Formate!";
    }else{
        errorMessage = false;
    }

    if( errorMessage === false  ){
        
        MainBranchSignUp.findOne({ email : user.email })
        .then( fUser => {
            if( fUser === null ){
                return res.json({ msg: "Email Not Found!", success:false }).status(200);
            }else{
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                          return res
                            .json({ msg: "salt creation failed", success: false })
                            .status(400);
                    }
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if( err ){
                            return res.json ({ msg: "Failed! Hash", success: false }).status(400);
                        }else{
                            fUser.password = hash ; 
                            fUser
                            .save()
                            .then( sfUser =>{
                                   if( sfUser !== null ){
                                       return res.json ({ msg :"Successfully Updated", success:true }).status(200);
                                   }else{
                                       return res.json ({ msg: "Updation Failed!", success:false }).status(400);
                                   }
                            } )
                            .catch( err=>{
                                   console.log( err);
                                   console.log( "Catch error" ) ;
                                   return res.json ({ msg: "Failed!" , success: false }).status(400);
                            })
                        }
                    })
                })
            }
        })
        .catch( err=>{
            console.log( err );
            console.log( "Catch error" );
            return res.json ({ msg: 'Failed!', success:false }).status(400);
        })

    }else{
        return res.json({ msg: errorMessage, success:false }).status(400);
    }


})


Router.post( "/login" , (req, res) =>{
    const { login } = req.body;
    let RegularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let errorMessage = "";
    if( login.email === "" ){
        errorMessage = "Invalid Email";
    }else if( login.password === "") {
        errorMessage = "Invalid Password";
    }else if (!RegularExpression.test(String(login.email).toLowerCase())) {
        errorMessage = "Invalid Email Formate!";
    }else{
        errorMessage = false;
    }

    if( errorMessage === false ){
        MainBranchSignUp.findOne({ email : login.email })
        .then( fUser => {
            if( fUser === null ){
                return res.json({ msg: "Email Not Found!", success:false }).status(200);
            }else{
                bcrypt
                .compare(login.password, fUser.password)
                .then( matched => {
                  if ( matched ) {
                      let user =  {
                        _id: fUser._id,
                        email: fUser.email
                      }
                    return res
                      .json({
                        msg: "Login Successfully!",
                        User: user,
                        success: true
                      })
                      .status(200);
                  } else {
                    return res
                      .json({ msg: "Invalid Password", success: false })
                      .status(400);
                  }
                })
                .catch( err => {
                    console.log(err);
                  return res.json({ msg: "Failed!", success:false }).status(400);
                });
               
            }
        })
        .catch( err=>{
            console.log( "Finding Catch error" );
            return res.json ({ msg: "FAILED!", success:faklse }).status(500);
        }) 
        
    }else{
        return res.json ({ msg: errorMessage , success:false}).status( 500);
    }
} )



Router.post( "/signup", (req, res)=>{
    const  { signUp } = req.body;
    let RegularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    let errorMessage = '';
    if( signUp.email === "" ){
        errorMessage = "Invalid Email";
    }else if( signUp.password === "") {
        errorMessage = "Invalid Password";
    }else if( signUp.password.length < 8 ) {
        errorMessage = "Invalid Password Length";
    }else if (!RegularExpression.test(String(signUp.email).toLowerCase())) {
        errorMessage = "Invalid Email Formate! ";
    }else{
        errorMessage = false;
    }

    if( errorMessage === false ){
        MainBranchSignUp.findOne({ email : signUp.email })
        .then( foundEmail =>{
            if( foundEmail !== null ){
                return res.json ({ msg: "Email Already Exist!", success:false }).status(400);
            }else{
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                          return res
                            .json({ msg: "salt creation failed", success: false })
                            .status(400);
                    }
                    bcrypt.hash(signUp.password, salt, (err, hash) => {
                        if (err) {
                            return res.json({
                              msg: "hash creation failed!",
                              success: false.status(400)
                            });
                        }
                        let newMainBranchSignUp = new MainBranchSignUp({
                            email: signUp.email,
                            password: hash
                         })
        
                         newMainBranchSignUp
                         .save()
                         .then( snewMainBranchSignUp =>{
                                if( snewMainBranchSignUp !== null ){
                                    return res.json ({ msg :"Successfully Sign Up", success:true }).status(200);
                                }else{
                                    return res.json ({ msg: "Signup Failed!", success:false }).status(400);
                                }
                         } )
                         .catch( err=>{
                                console.log( err);
                                console.log( "Catch error" ) ;
                                return res.json ({ msg: "Failed!" , success: false }).status(400);
                         })
                    })
        
                })
            }
        } )
        .catch( err=>{
            console.log( err );
            return res.json ({ msg: "FAILED!", success:false }).status(400);
        })
    }else{
        return res.json({msg: errorMessage , success: false  }).status(400);
    }
} )


module.exports = Router ;