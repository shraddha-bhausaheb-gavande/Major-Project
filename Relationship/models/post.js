const mongoose=require("mongoose");
const {Schema}=mongoose;

main()
.then(()=>console.log("connection successfuly"))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/relationDemo');
}

const userSchema=new Schema({
 username:String,
 email:String,
});

const postSchema=new Schema({
  content:String,
  likes:Number,
  user:{
    type:Schema.Types.ObjectId,
    ref:"User"
  }
});

const User=mongoose.model("User",userSchema);
const post=mongoose.model("post",postSchema);

const getData =async()=>{
  let result=await post.findOne({}).populate("user");
  console.log(result);
};
getData();