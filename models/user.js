 const mongoose = require('mongoose');

 const user = mongoose.Schema({
     name: { type: String, required: true },
     email: { type: String, required: true },
     password: { type: String, required: true },
     favourites: [
        {
            imdbID : {
                type : String
            },
            comments:[
            {
                type:String,
            }
            ],
            reviews:
                {
                    type:Number,
                }
            
        }
     ],
    
    type: {type: String, default: "USER" },
    created: { type: Date, default: Date.now },
 });

 module.exports = mongoose.model("user", user);
