const mongoose=require("mongoose");
const Review = require("./review.js");
const Schema=mongoose.Schema;

const listingSchema=new Schema({
  title:{
    type:String,
    required:true,
  },
  description:String,
 
  image: {
  filename: {
    type: String,
    default: "listingimage",
  },
  url: {
    type: String,
    default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60",
 

  
    // type:String,
    // default:
    // "https://unsplash.com/photos/half-moon-over-distant-mountains-at-dawn-Lt8PWROlZNs",

    set:(v)=>
      v==="" 
    ?  "https://unsplash.com/photos/half-moon-over-distant-mountains-at-dawn-Lt8PWROlZNs"
    :v,
   },
},


  price:Number,
  location:String,
  country:String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review",
    },
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  },

  geometry: {
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: {
    type: [Number],
  },
},

 
});


listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
  }
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;