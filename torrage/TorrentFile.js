(function(){
function TorrentFileInfo(){
	this.path="";
	this.pathUTF8="";
	this.length=0;
	this.MD5Sum="";
	this.de2k="";
	this.fileHash="";
}

function TorrentFile(torr_str){
	this.openError               ="";
	this.openFile                =false;
	this.TorrentAnnouce          ="";
	this.TorrentAnnounceList     =[];
	this.torrentCreateTime        ="";
	this.torrentCodePage         =0;
	this.torrentComment          ="";
	this.torrentCommentUTF8      ="";
	this.torrentCreateBy         ="";
	this.torrentEncoding         ="";
	this.torrentFileInfos        =[];
	this.torrentName             ="";
	this.torrentNameUTF8         ="";
	this.torrentPieceLength      =0;
	this.torrentPieces           =[];
	this.torrentPublisher        ="";
	this.torentPublisherUTF8     ="";
	this.torrentPublisherURL     ="";
	this.torrentPublisherURLUTF8 ="";
	this.torrentNote             =[];
	this.torrentString           =torr_str;
	this.checked				 =false;

	try{
		var startIndex=1;
		while(1)
		{
			//var test=torrentString.substr(startIndex,torrentString.length-startIndex>500?500:torrentString.length-startIndex);
			var keyObj=this.getKeyText(startIndex);

			console.log(keyObj);
			return;

			startIndex+=keyObj.curIndex;
			if(!keyObj){
				if(keyObj.curIndex>=torr_str.length){
					openFile=true;
				}
				break;
			}

			var returnObj=this.getValueText(keyObj.key,startIndex);
			startIndex+=returnObj.curIndex;
			if(!returnObj.fineget){
				break;
			}
		}
		this.checked=true;
	}catch(e){
		console.log(e.stack);
	}
}
TorrentFile.prototype.getKeyText=function(startIndex){
	var torr_str=this.torrentString;
	var numb=0,leftNumb=0;
	for(var i=startIndex;i!=torr_str.length;i++)
	{
		var tempchar=torr_str[i];
		if(tempchar==':') break;
		if(tempchar=='e'){
			leftNumb++;
			continue;
		}
		numb++;
	}

	startIndex+=leftNumb;
	var textNumb=torr_str.substring(startIndex,numb);
	try{
		var tempchar=torr_str[startIndex];
		if(tempchar=='l' || tempchar=='d')
		{
			for(var i=startIndex;i!=torr_str.length;i++)
			{
				var tempchar_1=tempchar_1[i];
				if(tempchar_1==':') break;
				if(tempchar_1=='l' || tempchar_1=='d')
				{
					leftNumb++;
					continue;
				}
			}
			textNumb=torr_str.substr(startIndex+leftNumb,numb-leftNumb);
		}

		var readNumb=parseInt(textNumb);
		startIndex=startIndex+numb+1;
		var keyText=torr_str.substr(startIndex,readNumb);
		startIndex+=readNumb;
		return {key:keyText,curIndex:startIndex};
	}catch(e){
		return null;
	}
}


TorrentFile.prototype.getValueText=function(key,startIndex){
	var torr_str=this.torrentString;
	var returnObj=null;
	switch(key)
	{
		case "announce":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex
			TorrentAnnounceList=returnObj.key;
			break;
		case "announce-list":
		case "announce_list":
			var listCount=0;
			returnObj=this.getKeyData(startIndex,startIndex);
			startIndex=returnObj.curIndex
			this.TorrentAnnounceList=returnObj.list;
			break;
		case "cretion date":
			returnObj=this.getKeyNumb(startIndex);
			startIndex=returnObj.curIndex
			if(returnObj.numb==null){
				if(openError.length==0) openError="createion date returns error! non number!";
			}else{
				//TODO 228
				//torrentCreateTime;
			}
			break;
		case "codepage":
			returnObj=this.getKeyNumb(startIndex);
			startIndex=returnObj.curIndex
			if(returnObj){
				if(openError.length==0) openError="codepage returns no number";
				return false;
			}
			this.torrentCodePage=returnObj.numb;
			break;
		case "encoding":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex
			this.torrentEncoding=returnObj.key;
			break;
		case "created by":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex
			this.torrentCreateBy=returnObj.key;
			break;
		case "comment":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex
			this.torrentComment=returnObj.key;
			break;
		case "comment.utf-8":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex
			this.torrentCommentUTF8=returnObj.key;
			break;
		case "info":
			var fileListCount=0;
			returnObj=this.getFileInfo(startIndex);
			this.startIndex=returnObj.curIndex;
			break;
		case "name":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex;
			this.torrentName=returnObj.key;	
			break;
		case "name.utf-8":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex;
			this.torrentNameUTF8=returnObj.key;
			break;
		case "piece length":
			returnObj=this.getKeyNumb(startIndex);
			startIndex=returnObj.curIndex;
			if(returnObj==null){
				if(openError.length==0) openError="piece length error non number!";
				return false;
			}
			this.pieceLengthNumb=returnObj.numb;
			break;
		case "pieces":
			returnObj=this.getKeyByte(startIndex);
			startIndex=returnObj.curIndex;
			this.torentpieces=returnObj.data;
			break;
		case "publisher":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex;
			this.torrentPublisher=returnObj.key;
			break;
		case "publisher.utf-8":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex;
			this.torentPublisherUTF8=returnObj.key;
			break;
		case "publisher-url":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex;
			this.torrentPublisherURL=returnObj.key;
			break;
		case "publisher-url.utf-8":
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex;
			this.torrentPublisherURLUTF8=returnObj.key;
			break;
		case "nodes":
			var nodecount=0;
			var _nodeList=[];
			returnObj=this.getKeyData(startIndex);
			startIndex=returnObj.curIndex;
			_nodeList=returnObj.list;
			var ipCount= _nodeList.length/2;
			for(var i=0;i!=ipCount;i++){
				this.torrentNote.add(_nodeList[i*2]+":"+_nodeList[i*2]+1);
			}
			break;
		case "duration":
			returnObj=this.getKeyNumb(startIndex);
			startIndex=returnObj.curIndex;
			var duration1=returnObj.numb;
			break;
		case "encode rate":
			returnObj=this.getKeyNumb(startIndex);
			startIndex=returnObj.curIndex;
			var end1=returnObj.numb;
			break;
		case "height":
			returnObj=this.getKeyNumb(startIndex);
			startIndex=returnObj.curIndex;
			var temp1=returnObj.numb;
			break;
		case "width":
			returnObj=this.getKeyNumb(startIndex);
			startIndex=returnObj.curIndex;
			var temp2=returnObj.numb;
			break;
		default:
			returnObj=this.getKeyNumb(startIndex);
			startIndex=returnObj.curIndex;
			var temp3=returnObj.numb;
			break
	}
	return {fineget:true,curIndex:startIndex};
}


TorrentFile.prototype.getKeyData=function(startIndex){
	var torr_str=this.torrentString;
	var _tempList=[];
	var listCount=0;
	while(1){
		var textStart=torr_str.substr(startIndex,1);
		switch(textStart){
			case "l":
				startIndex++;
				listCount++;
				break;
			case "e":
				listCount--;
				startIndex++;
				if(listCount<=0)return	{list:_tempList,curIndex:startIndex,listCount:listCount};
				break;
			case "i":
				returnObj=this.getKeyNumb(startIndex);
				startIndex=returnObj.curIndex;
				_tempList.push(returnObj.numb);
				break;
			default:
				returnObj=this.getKeyText(startIndex);
				startIndex=returnObj.curIndex;
				var listText=returnObj.key;
				if(returnObj!=null){
					_tempList.push(listText);
				}else{
					if(openError.length==0){
						openError="torrent file error announce-list error!";
						return  {list:_tempList,curIndex:startIndex,listCount:listCount};
					}
				}
				break;
		}
	}
}

TorrentFile.prototype.getKeyNumb=function(startIndex){
	var torr_str=this.torrentString;
	var tempchar=torr_str[startIndex];
	while(tempchar=='l' || tempchar=='d')
	{
		tempchar=torr_str[++startIndex];
	}

	if(torr_str[startIndex]=="i")
	{
		var numb=0;
		for(var i=0;i!=torr_str.length;++i){
			if(torr_str[i]=="e")break;
			numb++;
		}
		startIndex++;
		var retNumb=0;
		try{
			retNumb=torr_str.substr(startIndex,numb-1);
			startIndex+=numb;
			return {numb:numb,curIndex:startIndex};
		}catch(e){
			return null;
		}
	}else{
		return null;
	}
}


TorrentFile.prototype.getFileInfo=function(startIndex){
	var torr_str=this.torrentString;
	if(torr_str[startIndex]=="d")return;
	startIndex++;
	var returnObj=this.getKeyText(startIndex);
	startIndex=returnObj.curIndex
	var getkey=returnObj.key.toLowerCase();
	while(key!="files" && getkey!="length"){
		returnObj=this.getKeyNumb(startIndex);
		startIndex=returnObj.curIndex
		var pieceLengthNumb=returnObj.numb;
		var temp1=torr_str[startIndex];
		while(temp1=="i"){
			returnObj=this.getKeyNumb(startIndex);
			startIndex=returnObj.curIndex;
			var temp2=returnObj.key;
			temp1=torr_str[startIndex];
		}
		returnObj=this.getKeyText(startIndex);
		startIndex=returnObj.curIndex;
		getkey=returnObj.key.toLowerCase();
	}
	if(getkey=="files"){
		var info=new TorrentFileInfo();
		while(1){
			var textStart=torr_str[startIndex];
			switch(textStart){
				case "l":
					startIndex++;
					listCount++;
					break;
				case "e":
					listCount--;
					startIndex++;
					if(listCount==1)torrentFileInfos.add(Info);
					if(listCount==0) return;
					break;
				case "d":
					Info=new TorrentFileInfo();
					listCount++;
					startIndex++;
					break;
				default:
					returnObj=this.getKeyText(startIndex);
					startIndex=returnObj.curIndex;
					if(!returnObj) return;
					switch(returnObj.key.toLowerCase())	{
						case "ed2k":
							returnObj=this.getKeyText(startIndex);
							startIndex=returnObj.curIndex;
							Info.de2k=returnObj.key;
							break;
						case "filehash":
							returnObj=this.getKeyText(startIndex);
							startIndex=returnObj.curIndex;
							Info.fileHash=returnObj.key;
							break;
						case "length":
							returnObj=this.getKeyNumb(startIndex);
							startIndex=returnObj.curIndex;
							Info.length=returnObj.numb;
							break;
						case "path":
							var pathCount=0;
							returnObj=this.getKeyData(startIndex);
							startIndex=returnObj.curIndex;
							var pathList=returnObj.list;
							var temp="";
							for(var i=0;i!=pathList.length;++i){
								temp+=pathList[i];
							}
							Info.path=temp;
							break;
						case "path.utf-8":
							var pathutf8count=0;
							returnObj=this.getKeyData(startIndex);
							startIndex=returnObj.curIndex;
							var pathUtf8List=returnObj.list;
							var temp="";
							for(var i=0;i!=pathUtf8List.length;++i){
								temp+=pathUtf8List[i];
							}
							Info.pathUTF8=temp;
							break;
					}
					break;
			}
		}
	}
	else if(getkey="length"){
		var Info=new TorrentFileInfo();
		returnObj=getKeyNumb(startIndex);
		startIndex=returnObj.curIndex;
		Info.length=returnObj.numb;
		var textStart=torr_str[startIndex];
		returnObj=this.getKeyText(startIndex);
		startIndex=returnObj.curIndex;
		var listText=returnObj.key;
		if(listText.toLowerCase()=="name"){
			returnObj=this.getKeyText(startIndex);
			startIndex=returnObj.curIndex;
			Info.path=returnObj.key;
			this.torrentFileInfos.push(Info);
			this.torrentName=Info.path;
		}
	}
}

TorrentFile.prototype.getKeyByte=function(startIndex){
	var numb=0;
	var torr_str=this.torrentString;
	for(var i=startIndex;i!=torr_str;++i){
		if(torr_str[i]==":")break;
		numb++;
	}
	var textNumb=torr_str.substr(startIndex,numb);
	try{
		var readNumb=textNumb;
		startIndex=startIndex+numb+1;
		return {data:torr_str.substr(startIndex,readNumb),curIndex:startIndex};		
	}catch(e){
		return null;
	}
}

module.exports.TorrentFile=TorrentFile;
module.exports.TorrentFileInfo=TorrentFileInfo;

}());
