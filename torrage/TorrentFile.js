(
function TorrentFileInfo(){
	this.path="";
	this.pathUTF8="";
	this.MD5Sum="";
	this.de2k="";
	this.fileHash="";

}

function TorrentFile(torr_str){
	this.openError               ="";
	this.openFile                =false;
	this.TorrentAnnouce          ="";
	this.TorrentAnnounceList     =[];
	this.torrentCreateTie        ="";
	this.torrentCodePage         =0;
	this.torrentComment          ="";
	this.torrentCommentUTF8      ="";
	this.torrentCreateBy         ="";
	this.torrentEncoding         ="";
	this.torrentFileInfos        =[];
	this.torrentName             ="";
	this.torrentUTF8             ="";
	this.torrentPieceLength      =0;
	this.torrentPieces           =[];
	this.torrentPublisher        ="";
	this.torentPublisherUTF8     ="";
	this.torrentPublisherURL     ="";
	this.torrentPublisherURLUTF8 ="";
	this.torrentNote             =[];
	this.torrentString           =torr_str;

	try{
		int startIndex=1;
		while(1)
		{
			var test=torrentString.subStr(startIndex,torrentString.length-startIndex>500?500:torrentString.length-startIndex);

		}
	}catch{

	}
}
TorrentFile.prototype.getKeyText=function(startIndex){
	var torr_str=this.torrentString;
	var numb=0,leftNumb=0;
	for(int i=startIndex;i!=torr_str.length;i++)
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
	}
}


)();