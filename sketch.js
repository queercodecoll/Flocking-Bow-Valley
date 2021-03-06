/*FLOCKING QT STORIES*/

//GLOBAL LISTS OF AGENTS
let flock; //Container for the flock
var institutions = []; //Container for all institutions

//GLOBAL VARIABLES FOR STORIES
//String array list of all the stories
//These are used to create the story objects stored in non-normative boids
let strStories = ["Kenny_1", "Kenny_2", "Kenny_3", "Kenny_4", "Kenny_5",
                  "AnonymousAidan_1", "AnonymousAidan_2", "AnonymousAidan_3", "AnonymousAidan_4", "AnonymousAidan_5", "AnonymousAidan_6",
                  "Aurora_1", "Aurora_2", "Aurora_3", "Aurora_4", "Aurora_5",
                  "AnonymousTheyThem_1", "AnonymousTheyThem_2", "AnonymousTheyThem_3", "AnonymousTheyThem_4", "AnonymousTheyThem_5", "AnonymousTheyThem_6",
                  "KK_1", "KK_2", "KK_3", "KK_4", "KK_5", "KK_6", "KK_7", "KK_8",
                  "Sarah_1", "Sarah_2", "Sarah_3", "Sarah_4", "Sarah_5", "Sarah_6",
                  "Jessia_1", "Jessia_2", "Jessia_3", "Jessia_4", "Jessia_5", "Jessia_6"
                  ]; //Stories are created and stored with boid
let objStories = []; //Holds refs to the story objects. Loaded on Preload
let activeStory; //The current selected/active story

//GLOBAL VARIABLES FOR BOIDS
//List of boid types
const boidType = {
  NORM: 'normative',
  NON: 'nonNormative'
}

//Colours used for boids and institutions (set in setup() below)
let normColour, nonColour;

//Starting values (set in setup() and loadCanvas() below) and boid counters
let startNBoids, numNBoids, startQBoids, startNInst, startQInst, numBoidsMult;

//Boid followed for displaying invite to select story
let followBoid;

//GLOBAL VARIABLES FOR CANVAS
let cnv; //Container for the canvas
let bkgImg, bkgWidth, bkgHeight; //Background image for canvas
let sizeMult = 1;
let maxBoidNumMult = 5;
let prenumBoidsMult;

//Define max/min canvas sizes
const minWidth = 320;
const maxWidth = 1920;
const minHeight = 320;
const maxHeight = 1080;

//OTHER GLOBAL VARIABLES
let fft; //Container for Fast Fourier Tansform for audio analysis

var divLoading, txtLoading, barLoading, progLoading, divShadow;
var storiesLoaded, percentLoaded, numStories;

let fr = 0;
//----------------------------------------------------------------------------
//Before showing page...
function preload(){
  soundFormats('mp3'); //List of available file formats
  let tempStories = strStories;  //copy list of story names into a temp variable
  numStories = tempStories.length;
  storiesLoaded = 0;

  divLoading = createDiv();
  divLoading.size(240,100);
  divLoading.position((windowWidth - divLoading.width)/2, 150);
  divLoading.style('background-color', '#B4B');
  divLoading.style('display', 'grid');
  divLoading.style('justify-align', 'center');
  divLoading.style('align-items', 'center');
  divLoading.style('border', 'solid');
  divLoading.style('box-shadow', '5px 10px 20px');
  divLoading.style('position', 'fixed');
  divLoading.style('z-index', '5');

  //Loading Text
  txtLoading = createP("LOADING...");
  txtLoading.parent(divLoading);
  txtLoading.size(divLoading.width, 20);
  txtLoading.style('text-align', 'center');
  txtLoading.style('margin-top', '7.5%');
  txtLoading.style('margin-bottom', '0%');
  txtLoading.style('font', 'bold');

  //Loading bar
  barLoading = createDiv();
  barLoading.parent(divLoading);
  barLoading.size(100, 20);
  barLoading.style('width', '80%');
  barLoading.style('margin', '10%');
  barLoading.style('margin-top', '7.5%');
  barLoading.style('border', 'solid');
  barLoading.style('background-color', '#B4B');

  progLoading = createDiv();
  progLoading.parent(barLoading);
  progLoading.size(0, barLoading.height);
  progLoading.style('background-color', '#000');

  //Create randomized playlist
  while(tempStories.length > 0){ //While there are still stories in temp
    var story = tempStories.splice(floor(random(tempStories.length)), 1); //remove a random story name
    var newStory = new Story(story); //create the new story with the obtained string
    objStories.push(newStory); //and add it to the story list
  }

  //Load background image
  bkgImg = loadImage('./images/2021_06_30_00_00_2021_06_30_23_59_Sentinel_2_L2A_True_Color_3.png');
  bkgWidth = bkgImg.width;
  bkgHeight = bkgImg.height;

//End preload
}
//----------------------------------------------------------------------------
//Callback function for when audio is loaded during story constructor
//Called in Story constructor
function audioLoaded(){
  storiesLoaded++;
  percentLoaded = storiesLoaded / numStories;
  progLoading.style('width', (percentLoaded*100) + '%');
//End audioLoaded
}
//----------------------------------------------------------------------------
//Before first draw...
function setup() {

  //Remove Loading Panel
  removeElements();

  //Create the canvas
  let canvasWidth = constrain(windowWidth, minWidth, maxWidth);
  let canvasHeight = map(canvasWidth, minWidth, maxWidth, minHeight, windowHeight - 150);
  canvasHeight = max(canvasHeight, minHeight);
  cnv = createCanvas(windowWidth, canvasHeight);
  cnv.mouseClicked(canvasClicked);  //set callback function for when canvas is clicked

  //Define colours
  normColour = color(255);
  nonColour = color(255,0,255);

  //Set frame rate. Set to 30 to limit processing power needed
  frameRate(30);

  //Sound analysis setup
  fft = new p5.FFT();

  //Setup the boid world
  loadCanvas();

  //Create the gui - function in ui.js
  createGUI();

//End setup
}
//----------------------------------------------------------------------------
//Every frame...
function draw() {
  background(0);

  //Draw map of Canmore as background
  imageMode(CENTER);
  //Resize image to fit width of screen or min size
  //If image is larger than current canvas
  if(width <= bkgImg.width && height <= bkgImg.height){
    image(bkgImg, width/2, height/2);
  }
  //If canvas is wider than image but not taller
  else if(width/height >= bkgImg.width/bkgImg.height){
    image(bkgImg, width/2, height/2, width, width * bkgImg.height/bkgImg.width);
  }
  //If canvas is taller than image but not wider
  else if(width/height < bkgImg.width/bkgImg.height){
    image(bkgImg, width/2, height/2, height * bkgImg.width/bkgImg.height, height);
  }
  else{
    image(bkgImg, width/2, height/2);
  }

  //Draw tint
  //background(0,255,0,10);

  drawInstitutions(institutions);     //Draw the institutions
  flock.process();                    //Run the flock (which in turn runs the boids)
  displaySubtitles(activeStory);      //Update the subtitles
  sldNumNormsChanged();               //Update the number of normatives with respect to the slider
  if(frameCount % 300 == 0){selectFollowBoid();} //Select a boid to follow every n frames
  if(activeStory == null || (activeStory != null && !activeStory.isPlaying)) {
    drawInvite();                     //Draw an invite near the followed boid
  }                                   //Only if the story is not playing

  //Draw Frame rate
  // if(millis() % 500 >= 0 && millis() % 500 <= 25){
  //   fr = parseInt(frameRate());
  // }
  // stroke(255);
  // fill(0);
  // textSize(12);
  // text("Frame Rate: " + fr +"\nSizeMult: " + nf(sizeMult,1,3) + "\nnumBoidsMult: " + prenumBoidsMult, 80, 200);
//End draw
}
//----------------------------------------------------------------------------
//Callback function for when the canvas is clicked
//Finds the nearest boid to the click point and activate its story
function canvasClicked(){
  //Stop the current story
  if(activeStory != null){
    if(activeStory.isPlaying()){
      activeStory.stop();
    }
  }

  //Find the nearest boid to pointer
  let boid = getNearestQBoid(createVector(mouseX, mouseY));

  //Set as active Story and play
  if(boid != null){
    activeStory = boid.story;
    activeStory.play();
  }
//End canvasClicked
}
//----------------------------------------------------------------------------
//Find the nearest non-normative boid to a given point
/*Parameters
    point: the center point to find the smallest distance from
*/
function getNearestQBoid(point){
  let nearestBoid; //holds the nearest boid while testing
  let minDist = 30; //keeps track of minimum distance of boid to pointer
                    //Setting it here determines the maximum range for selecting a boid

  for(let boid of flock.boidList){
    //Is this boid a Non-Normative Boid
    if(boid.bType === boidType.NON){

      //calc distance to boid to pointer
      let d = dist(boid.position.x, boid.position.y,
                   point.x, point .y);

      //is the distance smaller than minDist?
      if(d < minDist){
        nearestBoid = boid; //set nearest boid and distance
        minDist = d; //set the minimum distance value
      }
    }
  }

  //Return the found boid. Returns null if no boid found.
  return nearestBoid;
//End getNearestQBoid
}
//----------------------------------------------------------------------------
//Event from the window size being sldNumNormsChanged
//This is used to resize the canvas (between min and max values) to fit in the window.
//To avoid croping off institutions, when canvas is resized the boid world is reloaded.
//The number of boids and institutions are also relative to the size of the canvas.
function windowResized(){
  //Resize the canvas to fit the window (within min and max values)
  let canvasWidth = constrain(windowWidth, minWidth, maxWidth);
  let canvasHeight = map(canvasWidth, minWidth, maxWidth, minHeight, windowHeight - 150);
  canvasHeight = max(canvasHeight, minHeight);

  if(canvasWidth != cnv.width || canvasHeight != cnv.height){ //If the width has changed
                                //Intended to prevent phone scrolling triggering a resize event
    resizeCanvas(windowWidth, canvasHeight);

    //Reload boid world (canvas)
    loadCanvas();

    //Number of normative boids may have changed. Update slider value.
    sldNumNorms.value(1);

    //As boid world has been reset, need to pick a new boid to follow.
    selectFollowBoid();
  }
//End windowResided
}
//----------------------------------------------------------------------------
//Setup/reset the boid world (canvas objects).
function loadCanvas(){
  flock = new Flock();     //Create the flock
  institutions = [];       //Initialize the list of institutions

  //Subtitle box variables; set size and position of subtitles.
  textboxSize = createVector(300,80);
  textboxPos= createVector(width/2, height-textboxSize.y/2 - 10);

  //Set number of boids per story dependant on canvas size
  // let maxMult = 4;  //Set number of boids per story at maximum canvas size
  // let interval = (maxWidth-minWidth) / (maxMult); //determine interval sizes
  // for(let i = 0; i < maxMult; i++){
  //   let bounds = (i*interval) + minWidth; //determine the boundary for this interval (starting with smallest)
  //   if(width > bounds){
  //     numBoidsMult = i+1; //Set the multiplier to a value of 1 to maxMult
  //                         //Starting with lowest value allows loop to find
  //                         //the largest multiplier for this interval/boundary
  //   }
  // }

  //Determine boid number multiplier by number of intervals in windowWidth
  let intervalSize = minWidth*minHeight;
  numBoidsMult = width*height / intervalSize;
  prenumBoidsMult = numBoidsMult;

  //If boid multiplier is at maximum, increase size instead
  if(numBoidsMult > maxBoidNumMult){
    //The equation to determine the size multiplier was derived from analyzing
    //the ideal sizeMult for set numMult, then calculating line of best fit.
    sizeMult = pow(numBoidsMult, 0.45) / 2.0;
    numBoidsMult = maxBoidNumMult;
  }
  else{
    sizeMult = 1;
  }

  //Start boid SETTINGS
  //starting values are relative to the size of the canvas and the number of stories
  startNBoids = max(parseInt(13 * numBoidsMult), objStories.length); //Number of normative boids set to number of non-normative boids
  startQBoids = max(parseInt(13 * numBoidsMult), objStories.length); //Number of non-normative boids is proportional to the number of stories
  startNInst = max(parseInt(3 * numBoidsMult),ceil(3*objStories.length/13)); //Number of normative institutions
  startQInst = max(parseInt(3 * numBoidsMult),ceil(3*objStories.length/13)); //Number of non-normative institutions

  //Add Q boids
  //creates multiple boids for each story
  // let perStory = floor(startQBoids/objStories.length); //Determine # of boids per story
  // for(let j = 0; j < objStories.length; j++){ //For each story..
  //   for(let i=0; i < perStory; i++){ //For each number of multiples of that story...
  //     flock.add(boidType.NON, objStories[j]); //Add a new non-normative boid to the flock
  //   }
  // }

  let storyIndex = 0;
  while(flock.numQBoids < startNBoids){
    if(storyIndex >= objStories.length) { storyIndex = 0; }
    flock.add(boidType.NON, objStories[storyIndex]);
    storyIndex++;
  }

  //Add N Boids
  //This is usually equal to the number of starting non-normative boids but doesn't have to be
  for(let i=0; i < startNBoids; i++){
    flock.add(boidType.NORM, null); //add new normative boid to the flock (story = null)
  }
  //At this point the number of normative boids equals the starting number
  numNBoids = startNBoids;

  //Add Q inst
  for(let i=0; i<startQInst; i++){

    institutions.push(new Institution(boidType.NON)); //Add new non-normative institution
  }

  //Add N inst
  for(let i=0; i<startNInst; i++){

    institutions.push(new Institution(boidType.NORM)); //Add new normative institution
  }

  let spacer = select('#canvasSpacer');
  spacer.size(cnv.width, cnv.height + 5);
//End loadCanvas
}
//----------------------------------------------------------------------------
//Floating box that invites user to select a boid.
//Follows a random non-normative boid around.
function drawInvite(){
  if(followBoid == null) { return; }

  let followOffset = 5;
  let position = followBoid.position;
  let size = createVector(105, 50);

  //Draw the rectangle
  fill(255,175);
  rectMode(CORNER);
  rect(followOffset + position.x, position.y + 5, size.x, size.y);

  //Draw the text
  textSize(12);
  textAlign(CENTER, CENTER);
  fill(200, 0, 200);
  stroke(150, 0, 150);
  text("TAP THIS BOID TO HEAR ITS STORY", followOffset + position.x, position.y + 5, size.x, size.y);

  //Draw the pointer
  fill(100);
  stroke(200);
  strokeWeight(2);
  triangle(followOffset + position.x - 2, position.y -2 + 5, followOffset + position.x -2, position.y + 13 +5, followOffset + position.x + 13, position.y-2 + 5);
//End drawInvite
}
//----------------------------------------------------------------------------
//Select a Q boid to follow
function selectFollowBoid(){
  do{
      followBoid = random(flock.boidList);
    }while(followBoid == null || followBoid.bType != boidType.NON);
//End selectFollowBoid
}
