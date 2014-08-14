

var counter = new Object();
counter.count = 0;
counter.end = 0;
counter.start = 30;
counter.counting = false;
counter.startcounting = false;
counter.intrvl = null;

//points earned has to be in same scope as the counter otherwise 
//scope will not be the same and pointEarned will be inaccssible to counter
var pointsEarned = new Object();

var spinner = null;

//holds user coordinates
var user = new Object();

//set to true to start the game
var animategame = true;
var gameplaying = false;
var drawgame = true;
var gameinitialized = false;

//output for error messages
var myfr = null;
var myfrcount = 0;




//add viewport for mobile devices
//not using
function viewPort(){
	if(Browser.makes.mobile){
		var header = document.head;
		var viewport = document.createElement("meta");
		viewport.name = "vieport";
		viewport.content ="width=1010, user-scalable=no, maximum-scale=1.0, initial-scale=1.0";
		header.appendChild(viewport);
	}
}

//viewPort();

var game = null;

var showfr = document.getElementById("fr");
var framerate = 0;

var gameContext = null;
var gameWidth = 1010;
var gameHeight = 559;

//prerender canvas
var prerender = null;
//prerender context
var precontext = null;

var points = new Array();

var imgTotal = 2;
var imgCount = 0;

//ball properties
var elasticity = .5;
var gravity = .65;
var friction = .12;
//friction of bottle pieces
var pieceFriction = .05;
var speed = 25;
var scaleinc = 1.6;

var piece_gravity = .4;
var piece_speed = 10;

var timeAdjustments = {
     framerate:60,
     minimumframerate:((Browser.makes.ios)?25:15),
     speedadjustcounter:0,
     speedsadjusted: false,
     speedadjustafter:5,
     oldtime: +new Date,
     adjustments: null, //holds os specific adjustment for time Adjust

     ios:{
          scaleinc: 2,
          speed:55,
          speedAdjustTargets: 3,
          movingadjustTargets: 2,
          opacityadjustTargets: .02, 
          reloadAdjust: 0,
          gravity:3.5
     },
     android:{
          scaleinc: 2.6,
          speed:70,
          speedAdjustTargets: 10,
          movingadjustTargets: 7,
          reloadAdjust: 100,
          opacityadjustTargets: .03, 
          gravity:7
     }
}


//limit used to calculate ball vetcor.
//if over this y coordinate - the y coordinate gets set to this.
var yCoordinateLimit = 0;
var yAutoThrowLimit = 0;

//mouse bounds to measure vectior
var mousebounds = {
     start: {
          x:0,
          y: 400,
          w:gameWidth,
          h:135
     },
     end:{
          x:0,
          y: yAutoThrowLimit,
          w:gameWidth,
          h:20 
     }
};


//difference between sinStart and sinEnd for ball to not be dropped
var ballStartEndXBeforeDrop = 5;

//var player = {x:0, y:0, speed:.01, t:0};
var formElement;

var targetReloadTime = 60*5; //5 seconds - 60 frames per second

var d = new Date();

var sprites = null;
var backgrounds = null;



//START coordinates on sprite sheets
//room object settings
var roomObjects = new Object();
roomObjects.bottlelrg = {     
     target:true,
     destroyed: false,
     points:1,
     cropx:2,
     cropy:0,
     width:41,
     height: 112,
     hitarea: {x:2,y:106,w:37,h:73}
}
roomObjects.bottlesml = {     
     target:true,
     destroyed: false,
     points:1,
     cropx:45,
     cropy:31,
     width:35,
     height: 81,
     hitarea: {x:2,y:76,w:31,h:52}
}
roomObjects.rat = {     
     target:true,
     destroyed: true,
     points:2,
     cropx:84,
     cropy:4,
     width:123,
     height: 28,
     x:gameWidth,
     y:420,
     ypositions: new Array(420,430), //difference in y between two direction
     front:true,
     speed: 4,
     keyframes:new Array(
          {
               cropx:98,cropy:427
          },
          {
               cropx:98,cropy:455
          },
          {
               cropx:98,cropy:483
          }),

     keyframedirections: new Array(
          new Array({cropx:98,cropy:427},{cropx:98,cropy:455},{cropx:98,cropy:483}),
          new Array({cropx:98,cropy:523},{cropx:98,cropy:551},{cropx:98,cropy:579})
          ),
     keyframescount: 0, //counts before frame changes
     keyframesinc: 3, //change image every 15 ticks
     keyframecurrent:0, //current key frame indice
     keyframenumber:3, //number of key frames.
     righttoleft: true,
     hitarea: {x:0,y:28,w:93,h:28}
}

/* roomObjects.ratgoright = {    
     target:true,
     destroyed: true,
     points:3,
     cropx:84,
     cropy:4,
     width:123,
     height: 28,
     x:-100,
     y:450,
     front:true,
     speed: 5,
     keyframes:new Array(
          {
               cropx:98,cropy:523
          },
          {
               cropx:98,cropy:551
          },
          {
               cropx:98,cropy:579
          }),
     keyframescount: 0, //counts before frame changes
     keyframesinc: 3, //change image every 15 ticks
     keyframecurrent:0, //current key frame indice
     keyframenumber:3, //number of key frames.
     lefttoright: true,
     hitarea: {x:0,y:28,w:93,h:28}
}
*/
roomObjects.mouseleft = {     
     target:true,
     destroyed: false,
     points:4,
     flip:false,
     cropx:148,
     cropy:40,
     width:46,
     height: 41,
     hidecount:0,
     hideat:60*(Math.ceil(Math.random()*10)+5),
     hidden: false,
     x:239,
     y:113,
     keyframes:new Array(
          {
               cropx:228,cropy:375
          },
          {
               cropx:274,cropy:375
          }),
     keyshiding: [182,136, 10],
     keysshowing:  [136,182, 10],
     keysactive:  [228,274, 4],
     keyframescount: 0, //counts before frame changes
     keyframesinc: 4, //change image every 15 ticks
     keyframecurrent:0, //current key frame indice
     keyframenumber:2, //number of key frames.

     hitarea: {x:0,y:0,w:46,h:41}
}
roomObjects.mouseright = {    
     target:true,
     destroyed: true,
     flip:true,
     points:4,
     cropx:195,
     cropy:40,
     width:46,
     height: 41,
     hidecount:0,
     hideat: 60*(Math.ceil(Math.random()*10)+5),
     hidden: true,
     x:792,
     y:286,
     keyframes:new Array(
          {
               cropx:320,cropy:375
          },
          {
               cropx:366,cropy:375
          }),
     keyshiding: [412,458, 10],
     keysshowing:  [458,412, 10],
     keysactive:  [320,366, 4],
     keyframescount: 0, //counts before frame changes
     keyframesinc: 5, //change image every 15 ticks
     keyframecurrent:0, //current key frame indice
     keyframenumber:2, //number of key frames.
     hitarea: {x:0,y:0,w:46,h:41}
}
roomObjects.box = { 
     target:false,
     front: true,
     points:1,
     cropx:1,
     cropy:113,
     width:190,
     height: 93,
     x:584,
     y:345
}
roomObjects.barrel = {   
     target:false,
     front: true,
     points:1,
     cropx:0,
     cropy:206,
     width:134,
     height: 201,
     x: 126,
     y:256
},

 roomObjects.barrelback = {   
     target:false,
     front: false,
     points:1,
     cropx:248,
     cropy:529,
     width:118,
     height: 27,
     x: 134,
     y:256
}

roomObjects.swinglrg = { 
     target:false,
     front: false,
     points:1,
     cropx:382,
     cropy:2,
     movinginc: 1,
     width:154,
     height: 370,
     x:713,
     y:-380
}
roomObjects.swingsml = { 
     target:false,
     front: false,
     points:1,
     movinginc: 2,
     cropx:244,
     cropy:2,
     width:136,
     height: 370,
     x:320,
     y:-360
}


//holds graphics settings
var hitPoints = new Array()

//1 point
hitPoints.push({
     pointamt: 1,
     width: 38,
     height: 40,
     cropx: 240,
     cropy: 564,
     opacity: 1,
     opacityinc: .008
});

//2 points
hitPoints.push({
     pointamt: 2,
     width: 38,
     height: 40,
     cropx: 278,
     cropy: 564,
     opacity: 1,
     opacityinc:.008
});

//3 points
hitPoints.push({
     pointamt: 3,
     width: 38,
     height: 40,
     cropx: 316,
     cropy: 564,
     opacity: 1,
     opacityinc: .008
});

//4 points
hitPoints.push({
     pointamt: 4,
     width: 38,
     height: 40,
     cropx: 354,
     cropy: 564,
     opacity: 1,
     opacityinc: .008
});

//explosion effect when rats are destroyed
var explosion = {
          cropx:363,
     cropy:422,
     width:64,
     height:56, 
     x:0,
     y:0,
     opacity: 1,
     opacityinc: .05
}


//rat angles 
var angel = {
     cropx:239,
     cropy:422,
     width:62,
     height:97, 
     x:0,
     y:0,
     opacity: Number(0.6),
     speed: 5,
keyframes:new Array(
          {
               cropx:239,cropy:422
          },
          {
               cropx:301,cropy:422
          }),
     keyframescount: 0, //counts before frame changes
     keyframesinc: 3, //change image every 15 ticks
     keyframecurrent:0, //current key frame indice
     keyframenumber:2
}



//room object placment coordinates
var bottleCoors = new Array();
//starting from left

//on barrel
bottleCoors.push({
     type:'bottlesml',
     x:155,
     y:200
});

//on barrel
bottleCoors.push({
     type:'bottlelrg',
     x:195,
     y:165
});

//on small swing
bottleCoors.push({
     type:'bottlelrg',
     couplewith: "swingsml",
     points: 1,
     x:343,
     y:(roomObjects.swingsml.y + roomObjects.swingsml.height) - 115
});

//on small swing
bottleCoors.push({
     type:'bottlelrg',
     couplewith: "swingsml",
     points: 1,
     x:394,
     y:(roomObjects.swingsml.y + roomObjects.swingsml.height) - 115
});

//on shelf
bottleCoors.push({
     type:'bottlesml',
     x:550,
     y:102
});

//on box
bottleCoors.push({
     type:'bottlelrg',
     x:602,
     y:240
});

//on box
bottleCoors.push({
     type:'bottlesml',
     x:669,
     y:271
});

//on box
bottleCoors.push({
     type:'bottlesml',
     x:712,
     y:271
});

 //on large swing
bottleCoors.push({
     type:'bottlelrg',
     couplewith: "swinglrg",
     points: 1,
     x:748,
     y:(roomObjects.swinglrg.y + roomObjects.swinglrg.height) - 119
});

//on large swing
bottleCoors.push({
     type:'bottlesml',
     couplewith: "swinglrg",
     points: 1,
     x:802,
     y:(roomObjects.swinglrg.y + roomObjects.swinglrg.height) - 88
});


var pieces = new Object();
pieces.bottlelrg = new Array();
pieces.bottlesml = new Array();

//cork
pieces.bottlelrg.push({
     cropx:16,
     cropy:412,
     width:13,
     height: 18,
     offsetx: 14,
     offsety: 1
});

//neck
pieces.bottlelrg.push({
     cropx:13,
     cropy:433,
     width:22,
     height: 17,
     offsetx: 11,
     offsety: 22
});

//left
pieces.bottlelrg.push({
     cropx:4,
     cropy:455,
     width:20,
     height: 48,
     offsetx: 2,
     offsety: 44
});

//right
pieces.bottlelrg.push({
     cropx:27,
     cropy:452,
     width:14,
     height: 39,
     offsetx: 25,
     offsety: 41
});

//bottom
pieces.bottlelrg.push({
     cropx:7,
     cropy:505,
     width:34,
     height: 13,
     offsetx: 5,
     offsety: 94
});


//start bottle small specs
//cork
pieces.bottlesml.push({
     cropx:57,
     cropy:443,
     width:13,
     height: 11,
     offsetx: 12,
     offsety: 0
});

 //neck
pieces.bottlesml.push({
     cropx:50,
     cropy:455,
     width:23,
     height: 15,
     offsetx: 5,
     offsety: 12
});

//left
pieces.bottlesml.push({
     cropx:47,
     cropy:474 ,
     width:15,
     height: 36,
     offsetx: 2,
     offsety: 31
});

//right
pieces.bottlesml.push({
     cropx:66,
     cropy:470,
     width:14,
     height: 37,
     offsetx: 21,
     offsety: 27
});

//bottom
pieces.bottlesml.push({
     cropx:47,
     cropy:511,
     width:32,
     height: 8,
     offsetx: 2,
     offsety: 68
});



//baseball
var baseball ={
     cropx:84,
     cropy:37,
     minradius: 20,
     radius:59,
     shadow: {
          cropx:149,
          cropy:85,
          width:63,
          height:21
     }
}

//wall bounds
//START HERE
//add a bounds property to each ball to increase bounds
var bounds = {
     left: 30,
     right: gameWidth  - 30,
     bottom: gameHeight - 90,
     top:-300,
     bounceat: baseball.radius - 10,
     boundsinc: 5
}

var backs = { 
     left: 53,
     middle: 905,
     right:52,
     height: 559
}

//END coordinates on sprite sheets

//the currently created ball
var currentBall = new Object();

var actions = {
     ballselected: false,
     ballthrown: false
}


var targets = new Array();
var nonTargets = new Array();


//preallocate ball objects
var balls = new Array(30);

var ballShadow = {
     cropx:149,
     cropy:85,
     width:63,
     height: 21,
     x:0,
     y:0
}


var lights = {
     changeat: 30,
     changecount: 0,
     currentindice:0,
     left: new Array(907,1015),
     right: new Array(961,1069)
}

var t_array_length = 0;
var non_t_array_length = 0;

function createBaseBalls(){
     for(var i = 0;i<balls.length;i++){
     balls[i] = {
          x:0,
          y:0,
          yLimit: yCoordinateLimit, 
          autoThrowAt: yAutoThrowLimit, 
          autoThrown: false,
          vectorStarted: false,
          sinStart:0, //x angle coordinate start
          sinEnd:0, //x angle coordinate start
          cosStart:gameHeight, //y angle coordinate start
          cosEnd:0, //y angle coordinate start
          radians:0, 
          velocityx:0, 
          velocityy:0, 
          nextX: 0,
          nextY: 0,
          radius: baseball.radius,
          gravity: gravity,
          friction: friction,
          elasticity:elasticity,
          speed: speed,
          minradius: baseball.minradius,
          destroyed: true, 
          opacity:1,
          selected: false,
          dropped: false,
          stopped:false,
          bounced: 0,
          bounds: {
               left: bounds.left,
               right:  bounds.right,
               top:  bounds.top,
               bottom:  bounds.bottom,
               bounceat:  bounds.bounceat,
               boundsinc:  bounds.boundsinc
          },
          timealive: 0,
          rotation: 0,
          rotationAmount: .3,
          canvas: document.createElement("canvas")
     };

     balls[i].canvas.width = baseball.radius;
     balls[i].canvas.height = baseball.radius;
     balls[i].context = balls[i].canvas.getContext("2d");
     }
}

function initControls(){

	game.holder.addEventListener(Browser.evt('down'),createNewBall);
	game.holder.addEventListener(Browser.evt('up'),mouseUp);
	game.holder.addEventListener(Browser.evt('over'),mouseTracker);
	game.holder.addEventListener(Browser.evt('move'),mouseTracker);
	
}


function clearCanvas(){		
	//Box
		//context.strokeStyle = '#000000';
		//context.strokeRect(1,  1, width-2, height-2);*/

	//context.clearRect(0,0,1010,559);

		//draw middle part of background
	precontext.drawImage(backgrounds,0,0,backs.middle,backs.height,backs.left,0,backs.middle,backs.height);

	/*context.fillStyle = '#EE00000';
		context.fillRect(mousebounds.start.x, mousebounds.start.y, mousebounds.start.w, mousebounds.start.h);*/

/*      		context.fillStyle = '#EEAA00';
		context.fillRect(mousebounds.end.x, mousebounds.end.y, mousebounds.end.w, mousebounds.end.h);
*/

}

function drawShelf(){
/*          context.fillStyle = '#EE0000';
     context.fillRect(52, 500, backs.middle, 59);*/

    precontext.drawImage(backgrounds,0,500,backs.middle,59,52,500,backs.middle,59);
}

function drawStackOfBalls(){
     precontext.drawImage(sprites,420,510,118,108,gameWidth-170,gameHeight-138,118,108);         
}

function drawLights(){
	lights.changecount++;
	if(lights.changecount>=lights.changeat){
		lights.changecount=0;
		lights.currentindice++;

		if(lights.currentindice>1){
			lights.currentindice=0;
		}
	}

		precontext.drawImage(backgrounds,lights.left[lights.currentindice],0,backs.left,backs.height,0,0,backs.left,backs.height);
		precontext.drawImage(backgrounds,lights.right[lights.currentindice],0,backs.right,backs.height,(backs.left + backs.middle),0,backs.right,backs.height);
}

function createNonTargetsArray(){
	//ADD RAT AND MICE TO TARGET ARRAY
	for(var i in roomObjects){
		if(!Boolean(String(i).match(/bottle|rat|mouse/i))){
			nonTargets.push({
					type: i,
					moving: ((String(i).match("swing"))?roomObjects[i].movinginc:0),
					movingstarty: ((String(i).match("swing"))?roomObjects[i].y:roomObjects[i].y),
					movingendy: ((String(i).match("swing"))?roomObjects[i].y + 300:roomObjects[i].y),
					front: roomObjects[i].front,
					cropx: roomObjects[i].cropx,
					cropy: roomObjects[i].cropy,
					width: roomObjects[i].width,
					height: roomObjects[i].height,
					x:roomObjects[i].x,
					y:roomObjects[i].y
			});	
		}	
	}

}



function createTargetsArray(){
	//ADD RAT AND MICE TO TARGET ARRAY
	for(var i in roomObjects){
		if(String(i).match(/rat|mouse/i)){
			targets.push({
					type: i,
					cropx: roomObjects[i].cropx,
					cropy: roomObjects[i].cropy,
					points: roomObjects[i].points,
					movewith: false,
					flip: ((typeof roomObjects[i].flip != 'undefined')?roomObjects[i].flip:false),
					keyframes: (typeof roomObjects[i].keyframes!= 'undefined')?roomObjects[i].keyframes:false,
					keyframescount: (typeof roomObjects[i].keyframescount!= 'undefined')?roomObjects[i].keyframescount:false,
					keyframesinc: (typeof roomObjects[i].keyframesinc!= 'undefined')?roomObjects[i].keyframesinc:0,
					keyframecurrent: (typeof roomObjects[i].keyframecurrent!= 'undefined')?roomObjects[i].keyframecurrent:false,
					keyframenumber: (typeof roomObjects[i].keyframenumber!= 'undefined')?roomObjects[i].keyframenumber:0,
					front: (typeof roomObjects[i].front!= 'undefined')?true:false,
					righttoleft: (typeof roomObjects[i].righttoleft!= 'undefined')?true:false,
					lefttoright: (typeof roomObjects[i].lefttoright!= 'undefined')?true:false,
                         ypositions: (typeof roomObjects[i].ypositions!= 'undefined')?roomObjects[i].ypositions:false,
					speed: (String(i).match(/rat/))?roomObjects[i].speed:0,
					hideaction: (String(i).match(/rat/))?false:true,
					hidecount: 0,
					hideat: (typeof roomObjects[i].hideat!= 'undefined')?roomObjects[i].hideat:false,
					hidden: roomObjects[i].hidden,
					hidestate: (String(i).match(/mouse/))?1:0,
                         keyframedirections: (typeof roomObjects[i].keyframedirections!= 'undefined')?roomObjects[i].keyframedirections:false,
					keyshiding: (String(i).match(/mouse/))?roomObjects[i].keyshiding:false,
					keysshowing: (String(i).match(/mouse/))?roomObjects[i].keysshowing:false,
					keysactive: (String(i).match(/mouse/))?roomObjects[i].keysactive:false,
					goright: false,
					destroyed: (roomObjects[i].destroyed)?true:false,
					destroyed_on: 0, //side item was hit on - default is right
                         alpha:1,
					reloadTimer: 0,
                         reloadInc: 0,
                         reloadAdjust: 0,
					reloadAt: 60*Math.ceil(Math.random()*10),
					width: roomObjects[i].width,
					height: roomObjects[i].height,
					x:roomObjects[i].x,
					y:roomObjects[i].y,
					hitarea: roomObjects[i].hitarea,
					//have to define each property separately otherwise assigning
					//object will create reference to orginal object
					poweffect: {
						explode:false,
						cropx:explosion.cropx,
				     	cropy:explosion.cropy,
				     	width:explosion.width,
				     	height:explosion.height, 
				     	x:0,
				     	y:0,
				     	opacity:explosion.opacity,
				     	opacityinc: explosion.opacityinc
					},
					angeleffect: {
						show:false,
						cropx:angel.cropx,
				     	cropy:angel.cropy,
				     	width:angel.width,
				     	height:angel.height,
				     	opacity:angel.opacity,
				     	speed: angel.speed,
				     	x:0,
				     	y:0,
				     	counter: 0,
				    	keyframes:angel.keyframes,
				     	keyframescount: angel.keyframescount, //counts before frame changes
				     	keyframesinc: angel.keyframesinc, //change image every 15 ticks
				     	keyframecurrent:angel.keyframecurrent, //current key frame indice
				     	keyframenumber:angel.keyframenumber
					},
					pointeffect:{
						showpoint: false,
						cropx: hitPoints[Number(roomObjects[i].points)-1].cropx,
						cropy: hitPoints[Number(roomObjects[i].points)-1].cropy,
						width: hitPoints[Number(roomObjects[i].points)-1].width,
						height: hitPoints[Number(roomObjects[i].points)-1].height,
						opacity:1,
						opacityinc: hitPoints[Number(roomObjects[i].points)-1].opacityinc,
						x:0,
						y:0
					}

			});
		}	
	}

	//ADD BOTTLES TO TARGET ARRAY
	for(var i=0; i<bottleCoors.length;i++){
		var bottle = roomObjects[String(bottleCoors[i].type)];

		var bp = (typeof bottleCoors[i].points != 'undefined')? bottleCoors[i].points:bottle.points; //points override depdning on placement

		targets.push({
				type: bottleCoors[i].type,
				cropx: bottle.cropx,
				cropy: bottle.cropy,
				movewith: (bottleCoors[i].couplewith!='undefined')?bottleCoors[i].couplewith:false,
				keyframes: false, //not used for bottles
				keyframescount: 0,  //not used for bottles
				keyframesinc: 0,  //not used for bottles
				keyframecurrent:0, //not used for bottles
				keyframenumber: 0, //not used for bottles
				hideaction:false,
				hidestate: (String(i).match(/mouse/))?1:0,
				goright: false,  //not used for bottles
				front: (typeof bottleCoors[i].front!= 'undefined')?true:false,
				righttoleft: false,
				lefttoright: false,
				speed: 0,
				points: bp,
				destroyed: false,
				destroyed_on: 0, //side item was hit on - default is right
				reloadTimer: 0,
                    reloadAdjust: 0,
                    reloadInc: 0,
				reloadAt: targetReloadTime,
				alpha:1,
				width: bottle.width,
				height: bottle.height,
				x:bottleCoors[i].x,
				y:bottleCoors[i].y,
				hitarea: bottle.hitarea,
				poweffect: false,
				angeleffect: false,
				pointeffect:{
						showpoint: false,	
						cropx: hitPoints[Number(bp)-1].cropx,
						cropy: hitPoints[Number(bp)-1].cropy,
						width: hitPoints[Number(bp)-1].width,
						height: hitPoints[Number(bp)-1].height,
						opacity:1,
						opacityinc: hitPoints[Number(bp)-1].opacityinc,
						x:0,
						y:0
					}
			});
	}

	for(i=0; i<targets.length;i++){
		if(Boolean(targets[i].movewith)){
			for(var y =0; y<nonTargets.length;y++){
				if(targets[i].movewith==nonTargets[y].type){
					targets[i].movewithobjectindice = y;
				}
			}
		}
	}

	//add bottle bits
	for(var j=0;j<targets.length;j++){

		//if target is a bottle add explosion bits
		if(String(targets[j].type).match(/bottle/) && typeof pieces[targets[j].type] != 'undefined'){

			targets[j].pieces = new Array();
			var bits = pieces[targets[j].type];

			for(var k=0; k<bits.length; k++){
				targets[j].pieces.push({
					cropx: bits[k].cropx,
			     	cropy: bits[k].cropy,
			     	width: bits[k].width,
			     	height: bits[k].height,
			     	parentindex: j,
			     	gravity: piece_gravity,
			     	speed: piece_speed,
			     	radians:0, 
					velocityx:0, 
					velocityy:0, 
					friction: pieceFriction,
			     	startx: targets[j].x + bits[k].offsetx,
			     	starty: targets[j].y + bits[k].offsety,
			     	offsetx: bits[k].offsetx,
			     	offsety: bits[k].offsety,
			     	animating: false,
			     	alpha: 1,
			     	rotation: 0,
			     	rotationinc: .01,
			     	x: targets[j].x + bits[k].offsetx,
			     	y: targets[j].y + bits[k].offsety

				});
			}
		}
	}

}


function renderExplosions(){
	for(var h=0; h<t_array_length;h++){
		var targ = targets[h];
						
		var tmidx = targ.x + (targ.width/2);
		var tmidy = targ.y + (targ.height/2);

		var explode = targ.poweffect;

		if(explode){

			var emidx = tmidx - (explode.width/2);
			var emidy = tmidy - (explode.height/2);

			if(targ.destroyed && explode.explode){

				if(explode.opacity==1){
					targ.angeleffect.show = true;
					targ.angeleffect.counter = 0;

				}

				precontext.save();
				precontext.globalAlpha = explode.opacity;
				precontext.drawImage(sprites,explode.cropx,explode.cropy,explode.width,explode.height,emidx,emidy,explode.width,explode.height);
				precontext.restore();
				explode.opacity-=explode.opacityinc;

				if(explode.opacity<=0){
					explode.explode = false;
					explode.opacity = 1;
				}
			}
		}
	}
}

function renderPoints(){
	for(var h=0; h<t_array_length;h++){
		var ct =targets[h];
		var tmidx = ct.x + (ct.width/2);
		var tmidy = ct.y + (ct.height/2);

		tmidx -= ct.pointeffect.width/2;
		tmidy -= ct.pointeffect.height/2;

		if(ct.destroyed && ct.pointeffect.showpoint){
			precontext.save();
			precontext.globalAlpha = ct.pointeffect.opacity;
			precontext.drawImage(sprites,ct.pointeffect.cropx,ct.pointeffect.cropy,ct.pointeffect.width,ct.pointeffect.height,tmidx,tmidy,ct.pointeffect.width,ct.pointeffect.height);
			precontext.restore();
			ct.pointeffect.opacity-=ct.pointeffect.opacityinc;

			if(ct.pointeffect.opacity<=0){
				resetPointEffect(ct);
			}
		}
	}
}

function resetPointEffect(obj){
	obj.pointeffect.showpoint = false;
	obj.pointeffect.opacity = 1;
}

function renderAngels(){
	for(var h=0; h<t_array_length;h++){
		var targ = targets[h];
						
		var tmidx = targ.x + (targ.width/2);
		var tmidy = targ.y + (targ.height/2);

		var fairy = targ.angeleffect;

		if(fairy){			

			fairy.x = (fairy.counter==0)?tmidx - (fairy.width/2):fairy.x;
			fairy.y = (fairy.counter==0)?tmidy - (fairy.height/2):fairy.y;

			fairy.x -= (fairy.counter<30 || fairy.counter>60)?1:-1;

			if(targ.destroyed && fairy.show){

				if(fairy.counter==0){
				//	t(targ);
				}

				fairy.keyframescount++;
				
				if(fairy.keyframescount>=fairy.keyframesinc){
					fairy.keyframescount=0;
					fairy.keyframecurrent++;
					if(fairy.keyframecurrent>=fairy.keyframenumber){
						fairy.keyframecurrent=0;
					}
				}

				var key = fairy.keyframes[fairy.keyframecurrent];

				precontext.save();
				precontext.globalAlpha = fairy.opacity;

				precontext.drawImage(sprites,key.cropx,key.cropy,fairy.width,fairy.height,fairy.x,fairy.y,fairy.width,fairy.height);
				precontext.restore();

				fairy.y -= fairy.speed;
				fairy.counter++;

				if(fairy.y< -(fairy.height)){
					fairy.show = false;
					fairy.counter = 0;
				}
			}
		}
	}
}

function renderPieces(){

	for(var h=0; h<t_array_length;h++){

		if(targets[h].destroyed && typeof targets[h].pieces != 'undefined'){
			var target = targets[h];
			var bits = target.pieces;
			var bitsanimating = 0;
			for(var i =0; i<bits.length; i++){

				if(bits[i].animating){

					bits[i].rotation-=bits[i].rotationinc;
					bits[i].alpha -= .02;

					if(bits[i].alpha<0){
						bits[i].alpha=0;
					}

					precontext.save();
					precontext.setTransform(1, 0, 0, 1, 0, 0);
					precontext.translate(bits[i].x,bits[i].y);
					precontext.rotate(bits[i].rotation);
					precontext.globalAlpha = bits[i].alpha;
					//precontext.drawImage(sprites,bits[i].cropx,bits[i].cropy,bits[i].width,bits[i].height,bits[i].x,bits[i].y,bits[i].width,bits[i].height);
					precontext.drawImage(sprites,bits[i].cropx,bits[i].cropy,bits[i].width,bits[i].height,0,0,bits[i].width,bits[i].height);
					precontext.restore();

					bits[i].velocityy += bits[i].gravity;
		   			bits[i].velocityx -= (bits[i].velocityx*bits[i].friction);

					bits[i].x += bits[i].velocityx;
					bits[i].y += bits[i].velocityy;
				}

				if(bits[i].y>gameHeight){
					bits[i].animating = false;
					bits[i].alpha = 1;
				}
			}
		}
	}
}

function swapOutMouseKeyFrames(obj,state){
	for(var v=0, st = state;v<obj.keyframes.length; v++){
		obj.keyframes[v].cropx = state[v];
	}
	obj.keyframesinc = state[state.length-1];
}

function renderTargets(front){
	for(var i=0; i<t_array_length;i++){
		//grabs bottle specified in roomObject 
		//current target
		var ct = targets[i];

		if(ct.front==front){
			if(ct.destroyed){

				if(!ct.hideaction){
					ct.alpha = 0;
				}
				ct.reloadTimer += (1 + ct.reloadInc);

				//adjust rat
				if(ct.righttoleft || ct.lefttoright){
					ct.reloadAt = 60*Math.ceil(Math.random()*800);
                         ct.reloadAt -= ct.reloadAdjust;
				}

				if(ct.reloadTimer>=ct.reloadAt){
					ct.destroyed = false;
					resetPointEffect(ct);

                         if(ct.type=="rat"){
                              ct.righttoleft = !ct.righttoleft;
                              ct.lefttoright = !ct.lefttoright;

						if(ct.righttoleft){
							ct.x = gameWidth;
                                   ct.y = ct.ypositions[0];
                                   ct.keyframes = ct.keyframedirections[0];
                                   ct.hitarea.x = ct.width - ct.hitarea.w;
						}

						if(ct.lefttoright){
							ct.x = -(ct.width);
                                   ct.y = ct.ypositions[1];
                                   ct.keyframes = ct.keyframedirections[1];
                                   ct.hitarea.x = 0;
						}
                         }

					ct.reloadTimer = 0;

				}
			}
			else{
				if(ct.alpha<1 && !ct.hideaction){
					precontext.save();
					ct.alpha += .05;
					precontext.globalAlpha = ct.alpha;
				}

				if(ct.movewith){
					ct.y = (nonTargets[ct.movewithobjectindice].y + nonTargets[ct.movewithobjectindice].height) - ct.height;
					precontext.drawImage(sprites,ct.cropx,ct.cropy,ct.width,ct.height,ct.x,ct.y,ct.width,ct.height);
				}
				else{

					if(ct.keyframes){
						//applies to rat
						if(ct.righttoleft || ct.lefttoright){

							ct.keyframescount++;
							if(ct.keyframescount>=ct.keyframesinc){
								ct.keyframescount=0;
								ct.keyframecurrent++;
								if(ct.keyframecurrent>=ct.keyframenumber){
								ct.keyframecurrent=0;
								}
							}

							if(ct.righttoleft){
								ct.x += -(ct.speed);
								if(ct.x<-(ct.width)){
									ct.x = gameWidth;
									ct.destroyed = true;
									ct.reloadAt = 60*Math.ceil(Math.random()*800);
                                             ct.reloadAt -= ct.reloadAdjust;
								}
							}

							if(ct.lefttoright){
								//showfr.innerHTML = ct.x;
								ct.x += ct.speed;
								if(ct.x>gameWidth){
									ct.x = -(ct.width);
									ct.destroyed = true;
									ct.reloadAt = 60*Math.ceil(Math.random()*800);
                                             ct.reloadAt -= ct.reloadAdjust;
								}
							}

							precontext.drawImage(sprites,ct.keyframes[ct.keyframecurrent].cropx,ct.keyframes[ct.keyframecurrent].cropy,ct.width,ct.height,ct.x,ct.y,ct.width,ct.height);
						}

						//applies to mice
						if(ct.hideaction){

							ct.keyframescount++;
							ct.hidecount+=4;

							//if(ct.type=="mouseleft") t(ct.keyframecurrent);

							//if(ct.type=="mouseleft" && ct.hidestate==1) t(ct.keyframecurrent);

//!---------- appears to run better without state change

							if(ct.hidestate==1 && ct.keyframecurrent==0 && !ct.hidden){
								if(ct.keyframes[0].cropx != ct.keysshowing[0]){
									//if(ct.type=="mouseleft") t("SHowing");
									swapOutMouseKeyFrames(ct,ct.keysshowing);
								}
							}

							if(ct.hidestate==1 && ct.keyframecurrent==1 && !ct.hidden){	
								//if(ct.type=="mouseleft") t("Activating");
								ct.hidestate = 2;
							}

							if(ct.hidestate==2 && !ct.hidden){
								if(ct.keyframecurrent==0 && ct.keyframes[0].cropx != ct.keysactive[0]){
									swapOutMouseKeyFrames(ct,ct.keysactive);
								}

								if(ct.hidecount>=ct.hideat){
									//if(ct.type=="mouseleft") t("Hiding");
									ct.hidestate=3;
									
								}
							}


							if(ct.hidestate==3){
								if(ct.keyframes[0].cropx != ct.keyshiding[0]){
									//if(ct.type=="mouseleft") t("Hiding Keys");
									swapOutMouseKeyFrames(ct,ct.keyshiding);
								}

								if(ct.keyframecurrent==1){									
									//if(ct.type=="mouseleft") t("Hiding Finished");
									ct.hidestate = 1;
								}
							}

							if(ct.keyframescount>=ct.keyframesinc){
								ct.keyframecurrent++;
								ct.keyframescount=0;
							}

							if(ct.keyframecurrent>=2){
								ct.keyframecurrent=0;
							}
							
							if(!ct.hidden){
								precontext.drawImage(sprites,ct.keyframes[ct.keyframecurrent].cropx,ct.keyframes[ct.keyframecurrent].cropy,ct.width,ct.height,ct.x,ct.y,ct.width,ct.height);
							}

							if(ct.hidecount>=ct.hideat){
								ct.hidden = !ct.hidden;

								if(!ct.hidden) ct.hidestate = 1;

								ct.hidecount=0;
							}
						}
						
						

					}
					else{
						precontext.drawImage(sprites,ct.cropx,ct.cropy,ct.width,ct.height,ct.x,ct.y,ct.width,ct.height);		
					}
					
				}

				if(ct.alpha<1 && !ct.hideaction){
					precontext.restore();
				}
				else{
					ct.alpha = 1;
				}
			}
		}
	}//end for loop
}

function renderNonTargets(front){
	for(var i=0; i<non_t_array_length;i++){
		//grabs bottle specified in roomObject 
		//current target
		var ct = nonTargets[i];

		if(ct.front==front){
			if(ct.moving!=0){
				ct.y+=ct.moving;

				if(ct.y>ct.movingendy){
					ct.moving *= -1;
					ct.y = ct.movingendy;
				}
				if(ct.y<ct.movingstarty){
					ct.moving *= -1;
					ct.y = ct.movingstarty;
				}
				precontext.drawImage(sprites,ct.cropx,ct.cropy,ct.width,ct.height,ct.x,ct.y,ct.width,ct.height);
			}
			else{
				precontext.drawImage(sprites,ct.cropx,ct.cropy,ct.width,ct.height,ct.x,ct.y,ct.width,ct.height);
			}
		}
	}
}

function renderBallObj(thisBall){
	if(!thisBall.destroyed){

		thisBall.velocityy += thisBall.gravity;
		bounceOrDestroy(thisBall);

		/*if (( thisBall.y +  thisBall.radius) > height) {
				 thisBall.velocityy = -(thisBall.velocityy)* elasticity;
				 //thisBall.velocityx =  thisBall.velocityx - ( thisBall.velocityx*friction);
		}*/

        thisBall.x += thisBall.velocityx;
		thisBall.y += thisBall.velocityy;

		thisBall.nextX = thisBall.x + thisBall.velocityx;
		thisBall.nextY = thisBall.y + thisBall.velocityy;

		//reset transformation of ball
		thisBall.context.setTransform(1, 0, 0, 1, 0, 0);
		thisBall.context.translate(0,0);
		thisBall.context.clearRect(0,0,thisBall.canvas.width,thisBall.canvas.height);

		if(!thisBall.dropped){
			thisBall.rotation += thisBall.rotationAmount;
			
			if(thisBall.radius > thisBall.minradius){
				thisBall.radius -= scaleinc;
			}
		}
		else{
			thisBall.rotation += thisBall.rotationAmount/10;

			if(thisBall.y>(gameHeight+thisBall.radius)){
				thisBall.destroyed = true;
				thisBall.stopped = true;					
			}
		}

		thisBall.canvas.width = thisBall.radius;
		thisBall.canvas.height = thisBall.radius;

		/*thisBall.context.fillStyle="red";
		thisBall.context.fillRect(0,0,thisBall.canvas.width,thisBall.canvas.height);*/

		thisBall.context.translate(thisBall.canvas.width/2,thisBall.canvas.height/2);
		thisBall.context.rotate(thisBall.rotation);
		thisBall.context.drawImage(sprites,baseball.cropx,baseball.cropy,baseball.radius,baseball.radius,-(thisBall.radius/2),-(thisBall.radius/2),thisBall.radius,thisBall.radius);

		//thisBall.context.clearRect(0,0,thisBall.canvas.width,thisBall.canvas.height)

		//assigns rotation to ball object property
		precontext.drawImage(thisBall.canvas,thisBall.x - thisBall.radius/2,thisBall.y - thisBall.radius/2 ,thisBall.radius,thisBall.radius);
	}
	
	if(thisBall.stopped){

		thisBall.opacity -= .1;
		if(thisBall.opacity<0) thisBall.opacity=0;

		thisBall.context.setTransform(1, 0, 0, 1, 0, 0);
		thisBall.context.translate(0,0);
		thisBall.context.clearRect(0,0,thisBall.canvas.width,thisBall.canvas.height);

		thisBall.canvas.width = thisBall.radius;
		thisBall.canvas.height = thisBall.radius;
		
		thisBall.context.translate(thisBall.canvas.width/2,thisBall.canvas.height/2);
		thisBall.context.rotate(thisBall.rotation);
		thisBall.context.globalAlpha = 	thisBall.opacity;
		thisBall.context.drawImage(sprites,baseball.cropx,baseball.cropy,baseball.radius,baseball.radius,-(thisBall.radius/2),-(thisBall.radius/2),thisBall.radius,thisBall.radius);

		//thisBall.context.clearRect(0,0,thisBall.canvas.width,thisBall.canvas.height)

		//assigns rotation to ball object property
		precontext.drawImage(thisBall.canvas,thisBall.x - thisBall.radius/2,thisBall.y - thisBall.radius/2 ,thisBall.radius,thisBall.radius);
	}

}//end render


function showCursorHolder(){
     document.getElementById("boardwalk").style.cursor = "url(images/cursor_hold.cur),url(images/cursor_hold.gif),pointer";    
}

function showCursorGrabber(){
     document.getElementById("boardwalk").style.cursor = "url(images/cursor_grab.cur),url(images/cursor_grab.gif),pointer";    
}


function createNewBall(){

	actions.ballselected = true;

	currentBall = {
		x:0,
		y:0,
		yLimit: yCoordinateLimit, 
		autoThrowAt: yAutoThrowLimit, 
		autoThrown: false,
		vectorStarted: false,
		sinStart:0, //x angle coordinate start
		sinEnd:0,	//x angle coordinate start
		cosStart:gameHeight, //y angle coordinate start
		cosEnd:0,	//y angle coordinate start
		radians:0, 
		velocityx:0, 
		velocityy:0, 
		nextX: 0,
		nextY: 0,
		radius: baseball.radius,
		gravity: gravity,
		friction: friction,
		elasticity:elasticity,
		speed: speed,
		minradius: baseball.minradius,
		destroyed: false, 
		opacity:1,
		selected: false,
		dropped: false,
		stopped:false,
		bounced: 0,
		bounds: {
			left: bounds.left,
			right:  bounds.right,
			top:  bounds.top,
			bottom:  bounds.bottom,
			bounceat:  bounds.bounceat,
			boundsinc:  bounds.boundsinc
		},
		timealive: 0,
		rotation: 0,
		rotationAmount: .3,
		canvas: document.createElement("canvas")
	};

	currentBall.canvas.width = baseball.radius;
	currentBall.canvas.height = baseball.radius;
	currentBall.context = currentBall.canvas.getContext("2d");
	precontext.drawImage(currentBall.canvas,currentBall.x - currentBall.radius/2,currentBall.y - currentBall.radius/2 ,currentBall.radius,currentBall.radius);
}


function getVector(){

	if(!currentBall.thrown){
		actions.ballselected = false;
		currentBall.thrown = true;

		currentBall.sinEnd = user.x;
		currentBall.cosEnd = (currentBall.y<currentBall.yLimit)?currentBall.y:currentBall.yLimit - 10;

		var diffX = currentBall.sinStart - currentBall.sinEnd;
		if(diffX<0){
			diffX *= -1;
		}

		var diffY = currentBall.cosStart - currentBall.cosEnd;
		if(diffY<0){
			diffY *= -1;
		}

		if((currentBall.cosEnd >= yCoordinateLimit) || diffY<ballStartEndXBeforeDrop || diffX<ballStartEndXBeforeDrop || currentBall.sinStart==0){
			//currentBall.sinEnd = currentBall.x + currentBall.velocityx;
			currentBall.dropped = true;
		}

		if(!currentBall.dropped){
			var tempY = (currentBall.cosStart - currentBall.cosEnd)*2;
			var tempX = (currentBall.sinStart - currentBall.sinEnd)*2;
			var distance = Math.sqrt(tempY + tempX);

			if(isNaN(distance)){
				distance = 0;
			}

			var modifierSpeed = distance/currentBall.speed;

			var infinityCheck = .2/modifierSpeed;
			var modifierGravity = (isFinite(infinityCheck))?infinityCheck:0;

			if(!currentBall.autoThrown){
				currentBall.speed += modifierSpeed;
			}
			
			currentBall.gravity += (modifierGravity + .4);	
			

			// var x =  user.x;
			// var y =  user.y;
			// y = game.getHeight()/2 + 50;

			//http://stackoverflow.com/questions/3309617/calculating-degrees-between-2-points-with-inverse-y-axis
			//answer 14 which uses atan2 function
			
			//subtract ship positions from mouse positions and return angle in radians usin atan2
			//var tempRadians = Math.atan2(y - p1.y,x - p1.x);

			var tempRadians = Math.atan2(currentBall.cosEnd - currentBall.cosStart,currentBall.sinEnd - currentBall.sinStart);

			//gets new increment along each access for vector
			var tempvelocityx = Math.cos(tempRadians) * currentBall.speed;
			var tempvelocityy  = Math.sin(tempRadians) * currentBall.speed;

			currentBall.radians = tempRadians;
			currentBall.velocityx = tempvelocityx; 
			currentBall.velocityy = tempvelocityy;
			currentBall.nextX = user.x + tempvelocityx;
			currentBall.nextY = user.y + tempvelocityy;
		}

		canvasRotation(currentBall,true);
	}
}


function mouseUp(e){

	if(!currentBall.autoThrown){
		getVector();		
	}
}

function canvasRotation(obj,createNew){

	var sqr = {w:10,h:30};

     if(typeof obj != 'undefined' && typeof obj.context != "undefined"){

     	if(!createNew){
     		obj.context.setTransform(1, 0, 0, 1, 0, 0);
     		obj.context.translate(0,0);
     		obj.context.clearRect(0,0,obj.canvas.width,obj.canvas.height)
     	}

     	obj.context.translate(obj.canvas.width/2,obj.canvas.height/2);
     	obj.context.rotate(obj.radians-Math.PI);

     	//assigns rotation to ball object property
     	//obj.rotation = obj.radians-Math.PI;

     	var sliceOfPie = (Math.PI*2)/8;

     	if(obj.radians > -(Math.PI/2)){
     		obj.context.scale(1,-1);
     	}

     	if(obj.radians > (Math.PI/2)){
     		obj.context.scale(1,-1);
     	}

     	if(obj.radians > sliceOfPie*6 && obj.radians < sliceOfPie*10){
     		obj.context.scale(1,-1);
     	}

     	if(obj.radians > sliceOfPie*14 && obj.radians < sliceOfPie*17){
     		obj.context.scale(1,-1);
     	}

     	//obj.context.fillStyle = "blue";
     		//obj.context.fillRect(-(5), -(15), sqr.w, sqr.h);

     	obj.context.drawImage(sprites,baseball.cropx,baseball.cropy,baseball.radius,baseball.radius,-(baseball.radius/2),-(baseball.radius/2),baseball.radius,baseball.radius);

     	//obj.context.strokeStyle = '#000000';
     		//obj.context.strokeRect(1,  1, spaceShip.width-2, spaceShip.height-2);

     	if(createNew){

     		var count = 0;
     		try{
     			while(!balls[count].destroyed && balls[count].opacity>0 && count<29){
     			count++;
     			}
     			balls[count] = obj;
     		}
     		catch(e){
     			console.log(e.message);
     		}
     	}
     }// end if(typeof obj != 'undefined'){
}

function removeDestroyedBalls(){

	for(var i =0;i<balls.length;i++){
		//if(balls[i].destroyed && balls[i].timealive>60){
		if(balls[i].destroyed && balls[i].stopped){
			//balls.splice(i,1);
			balls[i].destroyed = false;
		}
	}
}

function drawBallShadow(){
     ballShadow.x = (currentBall.x - ballShadow.width/2);
     ballShadow.y = 510; //always the same
     precontext.drawImage(sprites,ballShadow.cropx,ballShadow.cropy,ballShadow.width,ballShadow.height,ballShadow.x,ballShadow.y ,ballShadow.width,ballShadow.height);
}

function drawMouseBall(){

		//if a ball has been created start following user with ball
     	if(actions.ballselected){

     		currentBall.x = Math.round(user.x);
	     	currentBall.y = Math.round(user.y);


     		//if the current ball is in the pre throw zone
     /*		if(currentBall.y<currentBall.yLimit && !currentBall.vectorStarted){
     			currentBall.vectorStarted = true;
     			currentBall.sinStart = currentBall.x;
     			currentBall.cosStart = height;
     		}

     		if(currentBall.y>currentBall.yLimit && currentBall.vectorStarted){
     			currentBall.sinStart = currentBall.x;
     			currentBall.cosStart = height;
     		}*/

     		if(currentBall.y>mousebounds.start.y){
     			//t(currentBall.sinStart + " " + currentBall.x);

     			currentBall.sinStart = currentBall.x;
     			currentBall.cosStart = gameHeight;
     		}


			if(currentBall.x<=0){
				currentBall.x= 0;
			}
			
			if(currentBall.x>=gameWidth - currentBall.radius){
				currentBall.x = gameWidth - currentBall.radius;
			}

			currentBall.context.fillStyle = "blue";
			currentBall.context.fillRect(0,0, baseball.width, baseball.height);
			currentBall.context.drawImage(sprites,baseball.cropx,baseball.cropy,baseball.radius,baseball.radius,0,0,baseball.radius,baseball.radius);
               drawBallShadow();
			precontext.drawImage(currentBall.canvas,currentBall.x - currentBall.radius/2,currentBall.y - currentBall.radius,currentBall.radius,currentBall.radius);

			if(currentBall.y < currentBall.autoThrowAt){
				currentBall.autoThrown = true;
     			currentBall.cosStart = gameHeight;
				getVector();
			}

		}

}




function targetHitTest(cible,ball){

	var ballmidx = ball.x + (ball.radius/2);
	var ballmidy = ball.y + (ball.radius/2);

	var ciblemidx = cible.x + (cible.width/2);
	var ciblemidy = cible.y + (cible.height/2);

	var ciblestartx = 0;
	var ciblestarty = 0;

	if(cible.hitarea.x==0){
		ciblestartx = cible.x;
	}
	else{
		ciblestartx = (cible.x + cible.hitarea.x) + (cible.width - cible.hitarea.w - cible.hitarea.x);
	}

	if(cible.hitarea.y==0){
		ciblestarty = cible.y;
	}
	else{
		ciblestarty = cible.y + (cible.hitarea.y - cible.hitarea.h);
	}


	/*context.fillStyle="red";
	context.fillRect(ciblestartx,ciblestarty,cible.hitarea.w,cible.hitarea.h);*/

//used when target was a ball

/*		var dx = ballmidx - ciblemidx;
	var dy = ballmidy - ciblemidy;

	var distance = Math.sqrt(dx * dx + dy * dy);
	var compare = ball.minradius;

   if (distance <= compare && ball.radius<=ball.minradius ){

   		if(cible.type=='rat'){
   			t(ciblestartx + " " + ciblestarty);
   		}



   		addPoints(cible.points); 
  		ball.destroyed = true;
  		ball.stopped = true;
		return true;
   }
   else{
   		return false;
   }*/

	//if(ballwidth >= cible.x && ballwidth <= ciblewidth && ballheight>=cible.y && ballheight <= cibleheight){

	if(!cible.destroyed && (cible.hidestate==0 || cible.hidestate==2)){
		if(ballmidx >= ciblestartx && ballmidx <= (ciblestartx + cible.hitarea.w) && ballmidy >= ciblestarty && ballmidy <= (ciblestarty + cible.hitarea.h) && ball.radius <= ball.minradius && ball.bounced==0){
		//if(ballmidx >= ciblestartx && ballmidx <= (ciblestartx + cible.hitarea.w) && ballmidy >= ciblestarty && ballmidy <= (ciblestarty + cible.hitarea.h) && ball.radius <= ball.minradius){

	  		addPoints(cible);
	  		cible.destroyed = true;
	  		cible.pointeffect.showpoint = true;
	  		cible.poweffect.explode = true;

	  		if(ball.velocityx<0){
	  			//t(ballmidx + " " + ciblestartx);

	  			cible.destroyed_on = 2;	//destroyed on right 
	  		}
	  		else{
	  			cible.destroyed_on = 1;	//destroyed on left 
	  		}
	  		
	  		ball.destroyed = true;
	  		ball.stopped = true;

	  		if(typeof cible.pieces != 'undefined') calculatePieces(cible);
			return true;
	  	}
	  	else{ 
	  		return false;
	  	}
	}
	else{
		return false;
	}

}

function calculatePieces(target){

	//target mid points
	var mx = target.x + target.width/2; 
	var my = target.y + target.height/2; 

	for(var i =0; i<target.pieces.length; i++){

		var nx = mx;
		var ny = my;
		var amtx = Math.ceil(Math.random()*10);
		var amty = Math.ceil(Math.random()*10);
		var multiplier = 1;
		//target destroyed on left
		if(target.destroyed_on==1){
			nx += amtx;
		}	
		else{
			multiplier = -1;
			nx -= amtx;
		}

		ny += amty;

		var tempRadians = Math.atan2(ny - my,nx - mx);

		//gets new increment along each access for vector
		var tempvelocityy = Math.cos(tempRadians) * target.pieces[i].speed;
		var tempvelocityx  = Math.sin(tempRadians) * target.pieces[i].speed/10;

		target.pieces[i].radians = tempRadians;
		target.pieces[i].velocityy = (tempvelocityy<0)?tempvelocityy *= -1:1;
		target.pieces[i].velocityx = tempvelocityx * multiplier; 

		target.pieces[i].x = target.x + target.pieces[i].offsetx;
		target.pieces[i].y = target.y + target.pieces[i].offsety;
		target.pieces[i].animating = true;


	}

}


 function targetCollide(){
	var currentball;

		for (var i=0; i<balls.length; i++) {
    	currentball = balls[i];

    	for(var g=0; g<t_array_length;g++){
    		if(!currentball.destroyed){
    			targetHitTest(targets[g],currentball);
    		}
    	}
    }
}

function bounceOrDestroy(thisBall){
	if(thisBall.radius <= thisBall.bounds.bounceat && !thisBall.dropped){
	     if (thisBall.x > thisBall.bounds.right) {
	     	thisBall.x = thisBall.bounds.right;
            thisBall.velocityx = -(thisBall.velocityx);
            //thisBall.destroyed = true;
            updateVector(thisBall,true,"right");

         }else if (thisBall.x < thisBall.bounds.left) {
         	thisBall.x = thisBall.bounds.left;
            thisBall.velocityx = -(thisBall.velocityx);
            updateVector(thisBall,true,"left");
            //thisBall.destroyed = true;
         } else if (thisBall.y > thisBall.bounds.bottom) {
			thisBall.y = thisBall.bounds.bottom;
            thisBall.velocityy = -(thisBall.velocityy)*elasticity;
            updateVector(thisBall,false,"bottom");
            //thisBall.destroyed = true;  
         } else if (thisBall.y < thisBall.bounds.top) {
      /*   	thisBall.y = thisBall.bounds.top;
         	updateVector(thisBall,false,"top");*/
         }
     }
     else{
     	 if (thisBall.x > thisBall.bounds.right) {
     	 	thisBall.y = thisBall.bounds.right;
            thisBall.destroyed = true;
         }else if (thisBall.x < thisBall.bounds.left ) {
         	thisBall.y = thisBall.bounds.left;
            thisBall.destroyed = true;
         }
         else if(thisBall.y < thisBall.bounds.top) {
         	/*thisBall.y = thisBall.bounds.top;
         	updateVector(thisBall,false,"top");*/
         }
 		
 		/*
         else if(balls[i].y  < 0) {
            //balls[i].velocityy = balls[i].velocityy*-1;
            //updateVector(balls[i],false,"top");
            balls[i].destroyed = true;
         }*/
     }

     if(thisBall.bounced>3){
		thisBall.velocityx = thisBall.velocityx - (thisBall.velocityx*friction);
		thisBall.velocityy = thisBall.velocityy - (thisBall.velocityy*friction);

		if(thisBall.velocityy<0){
			thisBall.velocityy=0;
		}

     }

     if(thisBall.bounced>10){
     	thisBall.destroyed = true;
     	thisBall.stopped = true;
     }
}


function updateVector(obj, xaxis, collidedAt){

	//var angle = obj.radians * (180/Math.PI);
	//var newangle = 180 - angle;

	var newradian = null;
	if(xaxis){
		newradian = Math.PI - obj.radians;
	}
	else{
		newradian = (Math.PI*2) - obj.radians;	
	}

	//bounce counter
	//six bounces ball is removed

     obj.bounced++;
	//adjust bounds to give ball effect of bouncing into room

/*	obj.bounds.left+=obj.bounds.boundsinc;
	obj.bounds.right-=obj.bounds.boundsinc;
	obj.bounds.bottom-=obj.bounds.boundsinc;*/

	//descrease rotation amount of ball
	obj.rotationAmount -= .05;
	if(obj.rotationAmount<=0){
		obj.rotationAmount = 0;
	}
	obj.radians = newradian;
	//obj.velocityx = Math.cos(newradian) * obj.speed;

	if(collidedAt.match(/top/i) && obj.velocityy>0){
	obj.velocityy = Math.sin(newradian) * obj.speed;
}
canvasRotation(obj,false);

	//var newerangle = newradian * (180/Math.PI);
	
}

function drawPrerenderToCanvas(){
     gameContext.drawImage(prerender,0,0,gameWidth,gameHeight);
}


function drawScreen() {

	clearCanvas();
	showFrameRate();

	renderNonTargets(false);
	//mouseTracker();
     if(animategame){
        //if(!counter.counting && counter.startcounting){
          //counter.counting = true;
          //startGame();
        //}  
	   renderTargets(false);
     }

	renderNonTargets(true);

	renderTargets(true);

	renderPoints();

	if(animategame){

     	renderPieces();
     	renderExplosions();
     	renderAngels();

          drawShelf();

     	for(var i =0;i<balls.length;i++){
			renderBallObj(balls[i]);
     	}
     }
     
     drawStackOfBalls();

     if(gameplaying){
   		drawMouseBall();
	}

	drawLights();

     drawPrerenderToCanvas();

	if(animategame){
		targetCollide();
          game.ticker = window.ticker(drawScreen);
	}		

}

function adjustTargetSpeeds(){
	var speedadjust = timeAdjustments.adjustments.speedAdjustTargets;
	var movingadjust = timeAdjustments.adjustments.movingadjustTargets;
	var opacityadjust = timeAdjustments.adjustments.opacityadjustTargets;
     var reloaderadjust = timeAdjustments.adjustments.reloadAdjust;


	for(var g=0; g<t_array_length;g++){

		if(typeof targets[g].speed != 'undefined'){
			targets[g].speed += speedadjust;

			if(typeof targets[g].pieces != 'undefined'){
				for(var i=0; i<t_array_length;i++){
					targets[g].pieces.speed += speedadjust;
				}
			}

               if(typeof targets[g].reloadAdjust != 'undefined'){
                    targets[g].reloadAt -= reloaderadjust;
               }

			if(typeof targets[g].angeleffect != 'undefined'){
				targets[g].angeleffect.speed += speedadjust;
			}

			if(typeof targets[g].poweffect != 'undefined'){
				targets[g].poweffect.opacityinc += movingadjust;
			}

			if(typeof targets[g].pointeffect != 'undefined'){
				targets[g].pointeffect.opacityinc = opacityadjust;
			}
		
		}
	}

	for(g=0; g<non_t_array_length;g++){

		if(typeof nonTargets[g].moving != 'undefined' && nonTargets[g].moving>0){
			nonTargets[g].moving += movingadjust;
		}
	}

}

function showFrameRate(){
     var newtime = +new Date;
     timeAdjustments.framerate = 1000/(newtime-timeAdjustments.oldtime)
     timeAdjustments.oldtime = newtime;

     //if(!timeAdjustments.speedsadjusted) showfr.innerHTML = timeAdjustments.framerate + " " + timeAdjustments.speedadjustcounter + " " + timeAdjustments.speedadjustafter;

     //adjust the ball speed for low frame rates

     if(Browser.makes.mobile && timeAdjustments.framerate<timeAdjustments.minimumframerate && !timeAdjustments.speedsadjusted){

     	timeAdjustments.speedadjustcounter++;

     	//if(timeAdjustments.speedadjustcounter>=timeAdjustments.speedadjustafter){
          if(Browser.makes.ios || Browser.makes.surface || Browser.makes.android){
               //showfr.innerHTML = "Speed Adjusted";
               t("Adjusting Speed");

               if(Browser.makes.ios || Browser.makes.surface){
                    timeAdjustments.adjustments = timeAdjustments.ios;
               }
               else{
                    timeAdjustments.adjustments = timeAdjustments.android;
               }

               /*showfr.innerHTML =  timeAdjustments.adjustments.scaleinc + "<br/>";
               showfr.innerHTML +=  timeAdjustments.adjustments.speed + "<br/>";
               showfr.innerHTML +=  timeAdjustments.adjustments.gravity;*/

     		scaleinc = timeAdjustments.adjustments.scaleinc;
     		speed = timeAdjustments.adjustments.speed;
     		gravity = timeAdjustments.adjustments.gravity;
     		timeAdjustments.speedsadjusted = true;
               adjustTargetSpeeds();
     	}
     }
}


function addPoints(target){
     if(!target.type.match(/bottle/i)){
           pointsEarned.rats++;
     }
     pointsEarned.bottles += Number(target.points);
     pointsEarned.obj_score_bottles.innerHTML = pointsEarned.bottles;
}

function startCount(func){
	counter.count = counter.start;
	clearInterval(counter.intrvl);
	counter.intrvl = null;
	counter.intrvl = setInterval(func,1000,pointsEarned);
	pointsEarned.obj_score_timer.innerHTML = counter.start;

}


function resetGame(){
     pointsEarned.bottles = 0;
     pointsEarned.rats = 0;
     pointsEarned.obj_score_bottles.innerHTML = 0;
     pointsEarned.obj_score_timer.innerHTML = 0;
     animategame = true;
}

function resultsFacebookPost(){
     postToFeed(resultsMessaging.facebook[resultsScoreKey].title,resultsMessaging.facebook[resultsScoreKey].body);
}

function resultsTwitterPost(){
     postToTwitter(sharemessaging.twitter.display);  
}

//share and results copy lives in general.js
var resultsScoreKey = null;
var resultsObject = null;

function showResults(){

     //determines score key word
     if(Number(pointsEarned.bottles) >= 15) resultsScoreKey = "highscore";
     else resultsScoreKey = "lowscore";

     //determines score messaging object
     //alreadyEnteredToday lives in entry.js
     if(alreadyEnteredToday) resultsObject = resultsMessaging.repeat_play;
     else resultsObject = resultsMessaging.first_play;

     $(".results_title").text(resultsMessaging.title[resultsScoreKey]);
     $(".results_total").text("Results: " + Number(pointsEarned.bottles) + " Points");
     $(".results_description").text(resultsObject[resultsScoreKey]);

     sharemessaging.twitter.display = resultsMessaging.twitter[resultsScoreKey];

     alreadyEnteredToday = true;

}


function theCount(){
	counter.count--;

	if(counter.count<=counter.end){
		clearInterval(counter.intrvl);
		counter.intrvl = null;
		gameplaying = false;
          showGameOverMessage();
          showResults();
          resetGame();
          stopGame();
	}
     else{
          pointsEarned.obj_score_timer.innerHTML = counter.count;     
     }
	
}

function countImages(){
	imgCount++;
    // t(imgCount);
	if(imgCount == imgTotal){
          $("#gameintro").find(".playgame").show();
          stopSpinner();
          gameGraphicsLoaded = true;
          //	initControls(); 
	//	game.ticker = window.ticker(drawScreen);
         //startGame();
	}
}

function stopGame(){
     animategame = false;
}

function startGame(){
     animategame = true;
     getMouseCorrections();
     gameplaying = true;
     resetGame();
     startCount(theCount);
}

//INSERTING LOAD EVENT LISTENER WITHIN OTHER LOAD EVENT LISTENER GETS LOST IN IE9 & 10
//HAVE TO COUNT ALL IMAGE AND THEN INITIALIZE CANVAS


//start animation used by all functions

/* HELPFUL MATH

//General PIE math
Math.PI/2 = 90 degrees
Math.PI = 180 degrees

//Conversions
degrees = radians * (180/Math.PI);
radians = degrees * (Math.PI/180);

//get Y coordiate of vector from radian
Math.cos(radians);
Math.cos(radians) * speed; //get increment value along Y access for vector

//get X coordiate of vector from radian
Math.sin(radians);
Math.sin(radians) * speed; //get increment value along X access for vector

*/


 function mouseTracker(e){
 //    getMouseCorrections(true);

    /* if(myfrcount==3){
          for(var i in e){
               t(i + " " + e[i]);
          }
     }*/

     if(Browser.makes.mobile){
          e.preventDefault();
     }         

     if(Browser.makes.ios || Browser.makes.android){
          user.x = e.targetTouches[0].pageX;
          user.y = e.targetTouches[0].pageY;
     }
     else if(Browser.makes.ie9 || Browser.makes.ie10){
          user.x =  e.clientX;
          user.y =  e.clientY;

          if(Browser.makes.arm && Browser.makes.touch){
               user.y = e.pageY;
              // user.y -= user.boundsrect.top;
          }
     }
     else{
          user.x =  (e.x)?e.x:e.pageX;
          user.y =  (e.y)?e.y:e.pageY;
     }    

     user.x -= user.scrollCorrection.x;     
     user.y -= user.scrollCorrection.y;

 }



function getMouseCorrections(print){

          myfrcount++;

          if(window.pageXOffset>0 && !Browser.makes.mobile){
               user.scrollCorrection.x = -(window.pageXOffset);   
          } 
          else if(Browser.makes.ie9 || Browser.makes.ie10){
          	user.scrollCorrection.x = $("#gameArea").offset().left;
          	user.scrollCorrection.y = $(window).scrollTop();
          }
          else{
               user.scrollCorrection.x =  $("#gameArea").offset().left;
          }

          if(Browser.makes.mobile && window.pageYOffset>0){
               user.scrollCorrection.y = user.gameTopMargin;
          }
          else{
               user.scrollCorrection.y =  user.gameTopMargin - $(window).scrollTop();
               //if(Browser.makes.firefox && user.scrollCorrection.y<0){

               //need special mathematics for firefox     
               if(Browser.makes.firefox){
                    var diff = user.gameTopMargin - $(window).scrollTop();
                    if(diff<0){
                         diff *= -1;
                    }

                    if($(window).scrollTop()<=user.gameTopMargin){
                         user.scrollCorrection.y = ($(window).scrollTop() + diff);
                    }
                    else{
                         user.scrollCorrection.y = $(window).scrollTop() - diff;    
                    }
               }
          }

          if(print){
             /*  myfr.innerHTML = myfrcount + "<br/>";
               // myfr.innerHTML += window.pageXOffset + "<br/>";
               // myfr.innerHTML += $("#gameArea").offset().left + "<br/>";
               myfr.innerHTML += "Correction: " + user.scrollCorrection.y + "<br/>";
               myfr.innerHTML += "Scrolltop: " + $(window).scrollTop()+ "<br/>";*/
          }
}

function initGame(){

     if(!gameinitialized){
          game = new Game(1010,559,"boardwalk");
          game.attachGame("gameArea");
          //turn canvas selectability off for IE10
          game.unselectable="on";

          gameContext = game.context;
          gameWidth = game.getWidth();
          gameHeight = game.getHeight();

          prerender = document.createElement("canvas");
          prerender.id="prerenderer";
          prerender.width = game.getWidth();
          prerender.height = game.getHeight();

          precontext = prerender.getContext("2d");

          yCoordinateLimit = gameHeight - (Browser.makes.mobile)?150:100;
          yAutoThrowLimit = gameHeight/2;

          user.x = 0;
          user.y = 0;
          user.bounds = document.getElementById("boardwalk");
          user.boundsrect = user.bounds.getBoundingClientRect();
          user.gameTopMargin = 177;
          user.scrollCorrection = {
               x:0,
               y:user.gameTopMargin
          };

          pointsEarned = {
               bottles: 0,
               rats: 0,
               time: 30,
               obj_score_bottles: document.getElementById("score_bottles"),
               obj_score_timer: document.getElementById("score_timer")
          }

          createBaseBalls();

          createNonTargetsArray();
          createTargetsArray();
          t_array_length = targets.length;
          non_t_array_length = nonTargets.length;

          initControls(); 

          //startGame();

          getMouseCorrections();

          myfr = document.getElementById("fr");

          $(window).resize(function(evt){
               getMouseCorrections();
          });

          $(window).scroll(function(evt){
               getMouseCorrections();
          });
          
     }

     animategame = true;
     game.ticker = window.ticker(drawScreen);
     gameinitialized = true;
}


function preloadGameGraphics(){

     if(!gameGraphicsLoaded){
          sprites = new Image();
          sprites.src = "images/ptb_sprite_sheet_pt1.png?t=" + d.getTime();

          backgrounds = new Image();
          backgrounds.src = "images/ptb_sprite_sheet_pt2.jpg?t=" + d.getTime();

          //start animation used by all functions
          sprites.addEventListener("load",function(e){
               countImages();
          });

          backgrounds.addEventListener("load",function(e){
               countImages();
          });
     }
}
