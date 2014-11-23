var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var TorrSchema=new Schema({
	//announce:String,
	//announce_list:[String],
	//comment:String,
	//comment_utf_8:String,
	creation__date:String,
	_id:String,
	encoding:String,
	createAt:{type:Date,default:Date.now},
	updateAt:{type:Date,default:Date.now},
	recvTimes:{type:Number,default:0},
	hits:{type:Number,default:0},
	info:{
		files:[{path:String,path_utf_8:String,length:Number}],
		name:String,
		name_utf_8:String,
		length:Number,
		//piece__length:Number,
		//pieces:String,
		publisher:String,
		publisher_utf_8:String,
		publisher_url:String,
		publisher_url_utf_8:String,
		ed2k:String,
		filehash:String,
		created__by:String,
		private:String
	}
});	



TorrSchema.pre("save",function(next){
	if(this.isNew){
		this.createAt=this.updateAt=Date.now;
	}else{
		this.updateAt=Date.now;
	}

	next();
})

TorrSchema.statics={
	fetch:function(cb){
		return this
			.find({})
			.sort("updateAt")
			.exec(cb);
	},
	findById:function(id,cb){
		return this
			.findOne({_id:id})
			.exec(cb)
	}
}


var Torr=mongoose.model("Torr",TorrSchema);

module.exports=Torr;