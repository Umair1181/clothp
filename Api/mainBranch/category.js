const Router = require("express").Router();
const { Category } = require("../../Modal");

Router.post( "/category-list", (req, res ) =>{
    Category.find()
    .then ( catList =>{
        if( catList.length > 0 ){
            return res.json({ msg: "Category List",Categories: catList,  success:true }).status(400);
        }else{
            return res.json ({ msg: "No Category Exist!", success: false }).status(404);
        }
    } )
    .catch( err =>{
        console.log( err );
        console.log( "Catch error" );
        return res.json({ msg: "Failed!", success:false }).status(500);

    } )
})



Router.post ( "/add-category", (req, res)=>{
    const { category }  = req.body;  
    
    let errorMessage = "" ;

    if( category.categoryName === "" ){
        errorMessage = "Invalid Category Name!";
    }else if( category.name === "" ){
        errorMessage = "Invalid Name!";
    }else{
        errorMessage = false;
    }

    if( errorMessage === false ){
        Category.findOne({ categoryName : category.categoryName })
        .then( foundCtageroy =>{
            if( foundCtageroy !== null ){
                return res.json({ msg: "Category Name Already Exist!", success:false }).status(400);
            }else{
                newCategory = new Category({
                    categoryName: category.categoryName,
                    name: category.name
                })

                newCategory.save()
                .then( snewCategory => {
                    if( snewCategory !== null ){
                        return res.json ({ msg: "Category Added Succesfullty!",category: snewCategory,  success : true }).status(200);
                    }else{
                        return res.json ({ msg: "Failed!",  success : false }).status(400);
                    }
                })
                .catch( err => {
                    console.log( err );
                    return res.json({ msg: "Failed!", success:false }).status(400);

                } )
            }
        } )
        .catch( err=>{
            console.log( err );
            console.log( "Catch error" );
            return res.json ({ msg: "Failed", success:false }).status( 400 ) ;
        })
    }else{
        return res.json ({ msg: errorMessage, success: false }).status(400);
    }   
})


// catgory updaate
////////////////// category register API //////////////////////////////////
Router.post("/category-update", (req, res) => {
    let { category } = req.body;
    let message = '';
    if( category.categoryName === "" ){
        message = "Invalid Category Name!";
    }else if( category.name === "" ){
        message = "Invalid Category name!";
    }else if (category._id === "") {
      message = "Invalid _id!";
    } else {
      message = false;
    }
    if (message === false) {
        Category.findOne({ _id: category._id })
        .then(foundCtageroy => {
          if (foundCtageroy) {
            foundCtageroy.categoryName = category.categoryName;
            foundCtageroy.name = category.name;
            foundCtageroy
              .save()
              .then(savedCategory => {
                if (savedCategory) {
                  return res
                    .json({
                      msg: " Category Updated Successfully!",
                      savedCategory: savedCategory,
                      success: true
                    })
                    .status(200);
                } else {
                  return res
                    .json({
                      msg: "Category Not Updated!",
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



  ////////////////  DELETE vendor API STARTS HERE ////////////////////////////
Router.post("/delete-category", (req, res) => {
    let { catgeoryID } = req.body;
    let message = false;
    if (catgeoryID === "") {
      message = "Invalid Category Id!";
    } else {
      message = false;
    }
    if (message === false) {
      Category.findByIdAndDelete({ _id: catgeoryID }).then(deletedCategory => {
        if (deletedCategory) {
          return res
            .json({
              msg: "Category deleted!",
              deletedCategory: deletedCategory,
              success: true
            })
            .status(200);
        } else {
          return res
            .json({
              msg: "Invalid Catgeory!",
              success: false
            })
            .status(400);
        }
      });
    } else {
      return res.json({ msg: message, success: false }).status(400);
    }
  });
  
module.exports = Router;