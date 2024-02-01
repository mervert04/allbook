const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const https=require("https")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const session = require("express-session")
const alert = require("alert");


var Publishable_Key = 'pk_test_51L5PGEAnRZ2oaZEjWNWt7yXWKY3VNfZcMOOOy5ZYa4mxtuRDowexGOdhb8ZKRvNHit3YxEWp46VEbfutwvxDpNjN00Y96iOB4p'
var Secret_Key = 'sk_test_51L5PGEAnRZ2oaZEjgQ5SZuR9GZvONXrm01yIqBgsQ36G5gNgRvEunpHq3E6B0TlSVCbyDivhd37bI5LS5LWV4KRx00UmY03PCy'

const stripe = require('stripe')(Secret_Key);


app.use(bodyParser.urlencoded({
  extended: false
}))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));


//express session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))
// passport
app.use(passport.initialize())
app.use(passport.session())

//mongo conncetction
mongoose.connect("mongodb://localhost:27017/allbook")

const userSchema = mongoose.Schema({
  name:String,
  email: String,
  password: String,
  role: {
    type: String,
    default: 'user',
    enum: ["user", "admin"]
   },
})
userSchema.plugin(passportLocalMongoose)
const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//model and collectiosn


app.route("/register")
.get(function(req, res){
  res.render("register")
})
.post(function(req, res) {
  User.register({
    name:req.body.name,
    username: req.body.username,
    email: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err)
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/index2")
      })
    }
  })
})


app.route("/login")
  .get(function(req, res) {
    res.render("login")
  })
  .post(function(req, res) {

    const user = new User({
      username: req.body.username,
      passwrod: req.body.password
    })

    req.login(user, function(err) {
      if (err) {
        res.redirect("/login")

        console.log(err)
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/index2")
        })
      }
    })
  })

  app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

  const allbookSchema = mongoose.Schema({
    title:{
      type:String,
  },
  author:{
    type:String,

  },
    content:{
      type:String,
  },
    img:String,
  
     price:Number,
     genre:String,
     category:String,
     id:String,
     username:String
  })
  
  const database = mongoose.model("database",allbookSchema);
  const wishlist= mongoose.model("wishlist",allbookSchema)




//  const databaseAdd = new database({
//      title:"The love hypothesis",
//      author:"Ali Hazelwood",
//       price:"12.55$",
//      genre:"Romance",
//      category:"bestseller",
//      content:"When a fake relationship between scientists meets the irresistible force of attraction, it throws one woman's carefully calculated theories on love into chaos. As a third-year Ph.D. candidate, Olive Smith doesn't believe in lasting romantic relationships but her best friend does, and that's what got her into this situation. Convincing Anh that Olive on her way to a happily ever after was always going to be tough, scientists require proof. So, like any self-respecting woman, Olive panics and kisses the first man she sees.That man is none other than Adam Carlsen, a young hotshot professor and well-known ass. Which is why Olive is positively floored when he agrees to keep her charade a secret and be her fake boyfriend. But when a big science conference goes haywire and Adam surprises her again with his unyielding support (and his unyielding abs), their little experiment feels dangerously close to combustion.",
//      img:"https://d1w7fb2mkkr3kw.cloudfront.net/assets/images/book/lrg/9781/4087/9781408725764.jpg",
     
//  })
//  databaseAdd.save()



app.post('/payment/:id', async function(req, res){
  if(req.isAuthenticated()){
  let id = req.params.id
  let wishlist0 =  await database.findOne({_id:id})
  // Moreover you can take more details from user
  // like Address, Name, etc from form
  stripe.customers.create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken,
      name: req.user.name,
      address: req.body.stripeAddress
  })
  .then((customer) => {

      return stripe.charges.create({
          amount: wishlist0.price*100,    // Charing Rs 25
          description: 'Allbook-shop',
          currency: 'USD',
          customer: customer.id
      });
  })
  .then((charge) => {
    alert("Payment successful")// If no error occurs
  })
  .catch((err) => {
      res.send(err)    // If some error occurs
  });
}else{
  res.redirect("/register")
}
})




  
  app.post("/wishlist/:_id",async function(req,res){
    if(req.isAuthenticated()){
    let id = req.params._id
     let wishlist0 =  await database.findOne({_id:id})
     let title1=wishlist0.title
     let content1 = wishlist0.content
     let img1 = wishlist0.img
     let author1=wishlist0.author
     let genre1 = wishlist0.genre
     let price1 = wishlist0.price
     let category1 = wishlist0.category
     let id1 = wishlist0._id
     const wishlist1 = new wishlist({
       title:title1,
       content:content1,
       img:img1,
       author:author1,
       genre:genre1,
       price:price1,
       category:category1,
       username:req.user.username,
       id:id1

     })
     wishlist1.save();
     res.redirect('/wishlist')
    }
    else{
      res.redirect("/register")
    }
     });


     app.get("/wishlist", function(req,res){
      if(req.isAuthenticated()){
          wishlist.find( {username : req.user.username},function(err, wishlist){
           if(!err){
             res.render("wishlist",{wishlist:wishlist,key:Publishable_Key});
             console.log(wishlist)
          }else {
           console.log( err);
       }
        });
      }
      else{
        res.redirect("/register")
      }
       });


app.get("/", function(req, res){
  database.find({category:"bestseller"},function(err,bestseller){
    if(!err){
      res.render('index',{bestseller:bestseller})
      
    }
    else{
      console.log('Failed to retrieve the News: ' + err);
    }
  })
  })
 
  app.get("/about", function(req, res){
    if(req.isAuthenticated()){
      if(req.user.role === 'admin'){ 
      database.find(function(err, wishlist){
       if(!err){
         res.render("about",{wishlist:wishlist});
         console.log(wishlist)
      }else {
       console.log( err);
   }
    });
  }else{
    alert("you don't have access")
  }
}
  else{
    res.redirect("/register")
  }
  })


  app.get("/addbooks", function(req, res){
    if(req.isAuthenticated()){
      if(req.user.role === 'admin'){
    res.render("addbooks")}
  else{
    res.redirect('/index2')
  }
  }
    else{
      res.redirect('/register')
    }
  })


  app.post('/addbook',function(req,res){
    if(req.isAuthenticated()){
    const bookAdd = new database({
      
      title:req.body.title,
       author:req.body.author,
      content:req.body.content,     
      genre:req.body.genre,      
      img:req.body.urlToImage,
      category:req.body.category,
      price:req.body.price,
    })
    bookAdd.save()
    console.log(req.body)
    res.redirect("/about")}
     
    else{
      res.redirect("/")
    }
  })

  app.post('/delete/:id',function(req,res){
    if(req.isAuthenticated()){
      database.findByIdAndRemove(req.params.id, (err, ) => {
        if (!err) {
            res.redirect('/about');
        } else {
          res.send('<h1>404 not found</h1>')
            console.log('Failed to Delete news: ' + err);
        }
    });}
    else{
      res.redirect("/")
    }
    })
  app.get('/edit/:id',function(req,res){
    if(req.isAuthenticated()){
      database.findById(ObjectId(req.params.id), function(err,news1) {
        if (!err) {
            res.render("edit", {
                books:news1,
                });
        } else {
          res.send('<h1>404 not found</h1>');
            console.log('Failed to retrieve the News: ' + err);
        }
    })}
    else{
      res.redirect("/")
    }
  })
  
  app.post('/edit/:id',function(req,res){
    if(req.isAuthenticated()){
    database.findOneAndUpdate({_id: ObjectId(req.params.id)},
   { $set :
          { "title":req.body.title,              
            "content":req.body.content,
            "category":req.body.category,
            "img":req.body.urlToImage, 
            "genre":req.body.genre,
            "author":req.body.author,
            "price":req.body.price,
          }},          
            function(err){
                if(err){
                    res.send("error")
                    console.log(err)
                    
                }
                else{
                    res.redirect("/about")
                }
            })}
            else{
              res.redirect("/")
            }
  })


  app.get("/index2",  function(req, res){
    if(req.isAuthenticated()){
    database.find({category:"bestseller"},function(err,bestseller){
      if(!err){
        res.render('index2',{bestseller:bestseller})
        
      }
      else{
        console.log('Failed to retrieve the News: ' + err);
      }
    })}
    else{
      res.redirect("/")
    }
  })
  
  app.get("/:route", (req, res)=>{
      database.find({genre:req.params.route}, function(err,books) {
        if (!err) {
            res.render("fiction", {
                books:books,
                route:req.params.route,
                key:Publishable_Key
                });
                
        } else {
          res.send('<h1>404 not found</h1>')
            console.log('Failed to retrieve the News: ' + err);
        }
    });
    })
    var ObjectId = require('mongodb').ObjectID;
    
    app.get("/:route/:id", async function(req, res){
      let books = await database.find({genre:req.params.route})
      database.findById(ObjectId(req.params.id), function(err,book) {
        if (!err) {
            res.render("read", {
                book:book,
                key:Publishable_Key,
                books:books
                });
                console.log(book)
        } else {
          res.send('<h1>404 not found</h1>')
            console.log('Failed to retrieve the News: ' + err);
        }
    });
    })
    
    
    

    app.post('/remove/:id',function(req,res){
      if(req.isAuthenticated()){
        wishlist.findByIdAndRemove(req.params.id, (err, ) => {
          if (!err) {
              res.redirect('/wishlist');
          } else {
            res.send('<h1>404 not found</h1>')
              console.log('Failed to Delete news: ' + err);
          }
      });}
      else{
        res.redirect("/")
      }
      })

      app.post("/search", function(req,res){
           database.find({author:req.body.author}, function(err, search){
            if(!err){
              res.render("search",{books:search,
              route:req.body.author,
              key:Publishable_Key});
              console.log(search)
           }else {
            console.log('Failed to retrieve the News: ' + err);
        }
         });
         
        });



        
    app.listen(3000, function(){
      console.log("project at 3000 port")
    })
