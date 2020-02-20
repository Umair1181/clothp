const Router = require("express").Router();
const { Vendor } = require("../../Modal");

Router.post ( "/vendor-list", (req, res)=>{
    Vendor.find()
    .then( foundVendors => {
        if ( foundVendors.length > 0 )  {
            return res.json ({ msg: "Vendors List!", Vendors: foundVendors , success:true}).status(400);
        }else{
            return res.json ({ msg : "No Vendor Found!", success:false }).status(404);
        }
    } )
    .catch( err=> {
        return res.json ({ msg: "Failed", success:false }).status(400);
    } )
} )



Router.post( "/add-vendor", (req, res)=>{
    const { vendor } = req.body;
    let errorMessage = "";
    if( vendor.name === "" ){
        errorMessage = "Invalid Name!";
    }else if( vendor.contact === "" ){
        errorMessage = "Invalid Contact!";
    }else{
        errorMessage = false;
    }
    if( errorMessage === false ){
        Vendor.findOne({ name: vendor.name })
        .then( foundVedndor =>{
            if ( foundVedndor !== null )  {
                return res.json ({ msg: "Vendor Already Exist!", success:false }).status(400);
            }else{
                let newVendor  = new Vendor({
                    name: vendor.name,
                    contact :  vendor.contact 
                })
                newVendor.save()
                .then( sVendor =>{
                    if( sVendor !== null ) {
                        return res.json ({ msg: "Vendor Added Successfully!",vendor: sVendor,  success:true }).status(200);
                    }else{
                        return res.json ({ msg : "Failed" , success:false}).status(400);
                    }
                } )
            }
        } )
        .catch( err =>{
            console.log( err );
            return res.json ({ msg: "Failed", success:false }).status(400);
        }) 
    }else{
        return res.json ({ msg: errorMessage , success:false }).status(400);
    }
})


/////////////////  DELETE vendor API STARTS HERE ////////////////////////////
Router.post("/delete-vendor", (req, res) => {
    let { vendorID } = req.body;
    let message = false;
    if (vendorID === "") {
      message = "Invalid vendorID";
    } else {
      message = false;
    }
    if (message === false) {
      Vendor.findByIdAndDelete({ _id: vendorID }).then(deletedVendor => {
        if (deletedVendor) {
          return res
            .json({
              msg: "Vendor deleted!",
              DeletedVendor: deletedVendor,
              success: true
            })
            .status(200);
        } else {
          return res
            .json({
              msg: "Invalid Vendor!",
              success: false
            })
            .status(400);
        }
      });
    } else {
      return res.json({ msg: message, success: false }).status(400);
    }
  });
  
  ////////////////// vendor register API //////////////////////////////////
  Router.post("/vendor-update", (req, res) => {
    let { vendor } = req.body;
    let message = '';
    if( vendor.name === "" ){
        message = "Invalid Name!";
    }else if( vendor.contact === "" ){
        message = "Invalid Contact!";
    }else if (vendor._id === "") {
      message = "Invalid _id!";
    } else {
      message = false;
    }
    if (message === false) {
        Vendor.findOne({ _id: vendor._id })
        .then(foundVendor => {
          if (foundVendor) {
            foundVendor.name = vendor.name;
            foundVendor.contact = vendor.contact;
            foundVendor
              .save()
              .then(savedVendor => {
                if (savedVendor) {
                  return res
                    .json({
                      msg: " Vendor Updated Successfully!",
                      SavedVendor: savedVendor,
                      success: true
                    })
                    .status(200);
                } else {
                  return res
                    .json({
                      msg: "Vendor Not Updated!",
                      success: false
                    })
                    .status(400);
                }
              })
              .catch(err => {
                console.log("err found");
                console.log(err);
                return res.json({ msg: "failed", success: false }).status(400);
              });
          } else {
            return res.json({ msg: "Not Found!", success: false }).status(400);
          }
        })
        .catch(err => {
          console.log(err);
          return res.json({ msg: "Failed!", success: false }).status(500);
        });
    } else {
      return res.json({ msg: message, success: false }).status(404);
    }
  });
module.exports = Router;