var font;
var font2;
var currentFont;
var path;
var fontPath;
var pathArray;
var targetArray = [];
var shapeArray = [];
var x = -1;
var i;
var flag = false;
var first = true;
var mod = 0;
var index = 0;
var boxes = []
var moving = false;
var wordsIndex = 1;
var words = ["",""];
var currentWord;
var wordsCount = 0;
var frameCount = 0;
var staticArrayVal;
var tempLetters = [];
var tempTargets = [];
var tl = false;
var speed = 0.15;
var interval = 500;
var a = 20;
var fSize = 10;
var textColor = '#FF0000'
var ringColor = '#FFFFFF'
var circleColor = '#201d1d'
var c,c2,c3;
var fontWeight = 1.75;
var spacing;

//sound vars
var started = false;
var averagePeak;
var sound, sound2,currSound, fft, peakDetect, peaks;
var amplitude;
var level;
var sensitivity = 0.05;

//Splines vars
var vertices = [];
var originalPos = [];
var vertObjects = [];
var spline_size;
var weight = 1;
var numPoints = 0.15;
var lastNumPoints = 0.15;
var splineWidth = 3;

//UI vars
var gui, bu, inp;

function preload(){
    sound = loadSound('data/lofi.mp3');
    sound2 = loadSound('data/EatSleep.mp3');
    currSound = sound;
}

function setup(){

    c = color(textColor);
    c2 = color(ringColor);
    c3 = color(circleColor);
    //fft = new p5.FFT();
    //peakDetect = new p5.PeakDetect(-10, 23000, 0.01,0.01); // set decay .99 for faster response
    peaks = currSound.getPeaks(); // for debugging

    averagePeak = peaks.reduce( ( p, c ) => p + c, 0 ) / peaks.length;

    for(let i=0; i<averagePeak.length; i++){ //remap peaks (-1 to 1) to levels (0 to 1)
        averagePeak[i] = map(averagePeak[i],-1,1,0,1);
    }

    amplitude = new p5.Amplitude();

    stroke(255);
    strokeWeight(0.5);
    textAlign(CENTER);
    width = window.innerWidth;
    height = window.innerHeight;
    createCanvas(width, height);

    //create GUI
    createUI();
  
    textAlign(CENTER);
    textSize(50);


    background(255);
    opentype.load('data/VectFont.ttf', function(err, f){ // issues with A B D AND P 
        if(err){
            console.log(err);
        } else {
            font = f;
        }
    });

    opentype.load('data/BigBoy.otf', function(err, f){ // issues with A B D AND P 
        if(err){
            console.log(err);
        } else {
            font2 = f;
        }
    });

    spacing = width/50; // approximate line spacing formula
    spline_size = width/1.65;
    resetSpline(spline_size);

    currFont = font;
    fontSelector();
    musicSelector();
}

function draw(){

    if(numPoints != lastNumPoints){
        resetSpline(spline_size);
        lastNumPoints = numPoints;
    }
    c = color(textColor);
    c2 = color(ringColor);
    c3 = color(circleColor);
    //fft.analyze();
    //peakDetect.update(fft);

    level = amplitude.getLevel();

    fill(255);
    background(0,0,0,a);
    drawEllipse();
    drawSplines();

    if(started){
        
        flag = false;
        mod = 0;
        currentWord = words[wordsIndex]

        if(first){  //create shape array
        currFont = font;
        shapeArray = newArr(words[0]);
        targetArray = newArr(words[wordsIndex]);
        first = false;
        currSound.play();
        start();
        }

        push();
        translate((width/2)-((width/fSize)-spacing)*(shapeArray.length/2), height/2+((width/fSize)/2));
        drawLineMessage();
        pop();

        if(moving){
            stepTowards();
        }

        // if ( peakDetect.isDetected ) {
        //     weight = 10;
        //     start()
        // }

        if (level>averagePeak-sensitivity) {
                 splineWidth = 10;
                 start()
             }
    }
    
    splineWidth -=0.5;
    
}

function start(){
    resizeArray();
    moving = true;
    originalPos.forEach(o => {
        let vals = [0,1];
        o.dir = random(vals);
    });
}

function drawEllipse(){
    noStroke();
    fill(c3,10);
    ellipse(width/2,height/2,(amplitude.getLevel()*2000));
}

function drawMessage(){
    for(let i = 0; i < shapeArray.length; i++){ // does not handle 'i' 'j' or '!'
        beginShape();
        for(let j = 0; j < shapeArray[i].length; j++){
            if(i == 0){} // if no previous shape do nothing
                else if(shapeArray[i][j].x > MaxX(shapeArray[i-mod-1])){
                fill(c);
                flag = false; // flag and mod handle letters with multiple holes such as 'B' and '8';
                } else if (shapeArray[i][j].y < MinY(shapeArray[i-mod-1])){
                    fill(c);
                    flag = true;
                } else {
                    fill(0);
                    flag = true;
                }
        if(shapeArray[i][j].type == "L" || shapeArray[i][j].type == "M"){
            vertex(shapeArray[i][j].x, shapeArray[i][j].y);
        }  else if(shapeArray[i][j].type == "C"){
            bezierVertex(shapeArray[i][j].x1, shapeArray[i][j].y1,shapeArray[i][j].x2, shapeArray[i][j].y2, shapeArray[i][j].x, shapeArray[i][j].y);
        } else if(shapeArray[i][j].type == "Q"){
            quadraticVertex(shapeArray[i][j].x1, shapeArray[i][j].y1,shapeArray[i][j].x, shapeArray[i][j].y);
        }
        }
        endShape(CLOSE);
        if(flag){
            mod+=1;
        } else {
            mod = 0
        }
    }

    if(tl){
        for(let i = 0; i < tempLetters.length; i++){ // does not handle 'i' 'j' or '!'
            beginShape();
            for(let j = 0; j < tempLetters[i].length; j++){
                if(i == 0){} // if no previous shape do nothing
                    else if(tempLetters[i][j].x > MaxX(shapeArray[i-mod-1])){
                    fill(c);
                    flag = false; // flag and mod handle letters with multiple holes such as 'B' and '8';
                    } else if (tempLetters[i][j].y < MinY(tempLetters[i-mod-1])){
                        fill(c);
                        flag = true;
                    } else {
                        fill(c);
                        flag = true;
                    }
            if(tempLetters[i][j].type == "L" || tempLetters[i][j].type == "M"){
                vertex(tempLetters[i][j].x, tempLetters[i][j].y);
            }  else if(tempLetters[i][j].type == "C"){
                bezierVertex(tempLetters[i][j].x1, tempLetters[i][j].y1,tempLetters[i][j].x2, tempLetters[i][j].y2, tempLetters[i][j].x, tempLetters[i][j].y);
            } else if(tempLetters[i][j].type == "Q"){
                quadraticVertex(tempLetters[i][j].x1, tempLetters[i][j].y1,tempLetters[i][j].x, tempLetters[i][j].y);
            }
            }
            endShape(CLOSE);
            if(flag){
                mod+=1;
            } else {
                mod = 0
            }
        }
    }
}

function stepTowards(){

    let arrivedCount = 0;

    if(tl){ // for left over letters to transition inside others
        for(let z = 0; z < tempLetters.length; z++){
            for(let l = 0; l < tempLetters[z].length; l++){

                let r1 = Math.floor(random(0, targetArray.length-1));
                let r = Math.floor(random(1, targetArray[r1].length-1));

                let mover = tempLetters[z][l];
                let target = targetArray[targetArray.length-1][l%2];

                mover.x = lerp(mover.x,target.x,speed);
                mover.y = lerp(mover.y,target.y,speed);
            }
        }
    }

    for(let i = 0; i < shapeArray.length; i++){
        for(let j = 0; j < shapeArray[i].length; j++){

            let mover = shapeArray[i][j];
            let target = targetArray[i][j];
            
            if(dist(mover.x,mover.y,target.x,target.y)<0.1){
                arrivedCount++
                if(arrivedCount>=totalPoints(shapeArray)){
                    onArrive();
                    return;
                }
            } else {

            mover.x = lerp(mover.x,target.x,speed);
            mover.y = lerp(mover.y,target.y,speed);
            
            }
        }
    }
}

function newWord(){
   let n = inp.value();
    if(wordsCount==0){
        words[wordsCount]=n;
        words[wordsCount+1]=n;
    } else if(wordsCount == 1){
        words[wordsCount]=n;
    } else {
        words.push(n);
    }
    
    if(!started){
        started = true;
    }
    wordsCount++;
    n = "";
}

function newArr(w){

    temp = []
    flag = false;
    fill(255);
    fontPath = currFont.getPath(w, 0,0, width/fSize);
    path = new g.Path(fontPath.commands, {align : 'center'});
    pathArray = path.commands;

    for(let i = 0; i < pathArray.length; i++){
        if(pathArray[i].type != "Z"){
            //pathArray[i].vector = createVector(pathArray[i].x,pathArray[i].y);
        } else {
            temp.push(pathArray.slice(x+1, i)); // inserts range of shape
            x = i;
        }
    }
    x = -1;

    return temp
}

function onArrive(){
    moving = false;
    tl = false;
    tempLetters = [];
    shapeArray = [...targetArray]; // clone of target
    if(wordsIndex != words.length-1){
        wordsIndex++;
    } else {
        wordsIndex = 0;
        targetArray = newArr(words[wordsIndex]);
    }
    targetArray = newArr(words[wordsIndex]);
}

function drawLineMessage(){
    for(let i = 0; i < shapeArray.length; i++){ //line drawing
        for(let j = 1; j < shapeArray[i].length; j++){
                stroke(c);
                strokeWeight(fontWeight);
                line(shapeArray[i][j].x, shapeArray[i][j].y,shapeArray[i][j-1].x, shapeArray[i][j-1].y);
        }
    }

    if(tl){
        for(let z = 0; z < tempLetters.length; z++){
            for(let l = 1; l < tempLetters[z].length; l++){
                line(tempLetters[z][l].x, tempLetters[z][l].y,tempLetters[z][l-1].x, tempLetters[z][l-1].y);
            }
        }
    }
}

function resizeArray(){

    if(targetArray.length>=shapeArray.length){
        //new word larger

        for(let j = 0; j < shapeArray.length; j++){ //for length of current word
            if (shapeArray[j].length>targetArray[j].length){ //if letter is larger than new letter in this pos

                //smaller new letter

                shapeArray[j].length = targetArray[j].length; //removes points from end of array

            } else {

                //larger new letter

                let iterations2 = targetArray[j].length-shapeArray[j].length;  // pre calculate to avoid changes in length in loop

                for(let i = 0; i < iterations2; i++){ //for difference in number of points in the two letters

                    let randomPos = shapeArray[j][1]; // get random point in letter not on ends

                    let newVertex = {type: "L", x:randomPos.x, y:randomPos.y}; //create new point at this position
                    shapeArray[j].splice(1, 0, newVertex); // insert point into array
                }
            }
            //additional letters
        }
            
        let iterations3 = targetArray.length-shapeArray.length; // run x additional times

            for(let i = iterations3; i > 0; i--){
                let lastLetter = targetArray[targetArray.length - i];
                shapeArray.push([]); // create new empty letters
                for(let q = 0; q < lastLetter.length; q++){
                    let r1 = Math.floor(random(0, shapeArray.length-1)); //random existing letter
                    let r = Math.floor(random(2, shapeArray[r1].length-1)); //random point in that letter

                    let randomPos = shapeArray[r1][r];
                    
                    let newVertex = {type: "L", x: randomPos.x, y:randomPos.y}; //create new point at this position
                    shapeArray[shapeArray.length-1].push(newVertex); //store points for new letters inside existing letters
                }
            }

    } else {
        //new word smaller
        let diff = shapeArray.length - targetArray.length;
        
        for (let t = 0; t<diff; t++){ // handles holding extra letters for moving
            tl = true;
            tempLetters.push([...shapeArray[shapeArray.length-(1+t)]]);
        }

        shapeArray.length = targetArray.length; // cut array length down

        for(let j = 0; j < shapeArray.length; j++){ //for length of current word
            if (shapeArray[j].length>targetArray[j].length){ //if letter is larger than new letter in this pos
                //smaller new letter
                shapeArray[j].length = targetArray[j].length; //removes points from end of array

            } else {
                //larger new letter

                let iterations2 = targetArray[j].length-shapeArray[j].length;  // pre calculate to avoid changes in length in loop

                for(let i = 0; i < iterations2; i++){ //for difference in number of points in the two letters

                    let randomPos = shapeArray[j][1]; // get random point in letter not on ends

                    let newVertex = {type: "L", x:randomPos.x, y:randomPos.y}; //create new point at this position
                    shapeArray[j].splice(1, 0, newVertex); // insert point into array
                }
            }
        }
            
        //additional letters

        let iterations3 = targetArray.length-shapeArray.length; // run x additional times

            for(let i = iterations3; i > 0; i--){
                let lastLetter = targetArray[targetArray.length - i];
                shapeArray.push([]); // create new empty letters
                for(let q = 0; q < lastLetter.length; q++){
                    let r1 = Math.floor(random(0, shapeArray.length-1)); //random existing letter
                    let r = Math.floor(random(2, shapeArray[r1].length-1)); //random point in that letter

                    let randomPos = shapeArray[r1][r];
                    
                    let newVertex = {type: "L", x: randomPos.x, y:randomPos.y}; //create new point at this position
                    shapeArray[shapeArray.length-1].push(newVertex); //store points for new letters inside existing letters
                }
            }
    }
}

function resetSpline(size) {
    vertices = [];
    originalPos = [];
    for (var i = 0; i <= TWO_PI; i+=numPoints) {
      vertices.push({x: size/2 * sin(i), y: size/2 * cos(i)}); 
      let vals = [0,1] 
      originalPos.push({x: size/2 * sin(i), y: size/2 * cos(i), dir: random(vals)});  
    }
  }

function drawSplines(){
noFill();
stroke(c2);
strokeWeight(splineWidth)
let splineSpeed = 0.15;
  push();
  translate(width/2, height/2);
  vertObjects = [];
  beginShape();
  for (var i = 0; i < vertices.length; i++) {

    let midpointToCenter = midpoint(originalPos[i].x, originalPos[i].y, 0, 0);
    midpointToCenter = createVector(midpointToCenter[0]/4,midpointToCenter[1]/4);

    let innerPoints = p5.Vector.add(createVector(originalPos[i].x, originalPos[i].y),createVector(midpointToCenter.x,midpointToCenter.y));
    let outerPoints = p5.Vector.sub(createVector(originalPos[i].x, originalPos[i].y),createVector(midpointToCenter.x,midpointToCenter.y));

    //console.log(originalPos[i].dir);

    if(originalPos[i].dir == 0){
        vertices[i].x = lerp(vertices[i].x,innerPoints.x,splineSpeed);
        vertices[i].y = lerp(vertices[i].y,innerPoints.y,splineSpeed);
    } else if(originalPos[i].dir == 1) {
        vertices[i].x = lerp(vertices[i].x,outerPoints.x,splineSpeed);
        vertices[i].y = lerp(vertices[i].y,outerPoints.y,splineSpeed);
    }

    curveVertex(vertices[i].x, vertices[i].y);

  }

  endShape(CLOSE);
  pop();

}

function createUI(){
    sliderRange(-2, 2, 0.01);
    gui = createGui(this,'double click here to toggle UI');
    gui.addGlobals('sensitivity','textColor','ringColor','circleColor',);
    sliderRange(0.007, 0.5, 0.001);
    gui.addGlobals('numPoints');
    sliderRange(0.001, 0.5, 0.001);
    gui.addGlobals('speed');
    sliderRange(0.5, 4, 0.1);
    gui.addGlobals('fontWeight');

    inp = createInput();
    inp.position(width - 280 , 10);
  
    bu = createButton('Add');
    bu.position(inp.x + inp.width, 10);
    bu.mousePressed(newWord);

    let bu2 = createButton('Reset');
    bu2.position(inp.x + inp.width+bu.width, 10);
    bu2.mousePressed(reset);
}

function reset(){
    words = [" "," "];
    first = true;
    currSound.stop();
    started = false;
    wordsCount = 0;
    wordsIndex = 1;
}

let sel;

function fontSelector() {
  textAlign(CENTER);
  background(200);
  sel = createSelect();
  sel.position(10, height - 50);
  sel.option('Line');
  sel.option('Shape');
  sel.changed(mySelectEvent);
}

function mySelectEvent() {
  if(sel.value() == 'Line'){
    currFont = font;
  } else {
    currFont = font2;
  }
  background(200);
}

let sel2;

function musicSelector() {
  textAlign(CENTER);
  background(200);
  sel2 = createSelect();
  sel2.position(75, height - 50);
  sel2.option('Lofi');
  sel2.option('Rave');
  sel2.changed(mySelectEvent2);
}

function mySelectEvent2() {
    currSound.stop();
  if(sel2.value() == 'Lofi'){
    currSound = sound;
  } else {
    currSound = sound2;
  }
  currSound.play();
  background(200);
}


//https://stackoverflow.com/questions/16468124/count-values-of-the-inner-two-dimensional-array-javascript
function totalPoints(arr){
    let s = 0;
    arr.forEach(function(e,i,a){s += e.length; });
    return s;
}

//https://www.codegrepper.com/code-examples/javascript/midpoint+formula+javascript
function midpoint(x1, y1, x2, y2) {
	return [(x1 + x2) / 2, (y1 + y2) / 2];
}

function MaxX(arr){
        let arr2 = [];

        for(z = 0; z < arr.length; z++){
            arr2.push(arr[z].x)
        }
        return Math.max(...arr2)
    }

function MinY(arr){
        let arr2 = [];

        for(z = 0; z < arr.length; z++){
            arr2.push(arr[z].y)
        }
        return Math.min(...arr2)
    }

    