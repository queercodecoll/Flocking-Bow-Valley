//Institution Class
/* Institutions are stationary agents. They are not boids and are not part of
   the flock. The exist as points that further the simulation of harm/support.
*/

class Institution {
  /*Parameters
      bType: the boid type that the institution mimics; normative, non-normative
  */
  constructor(bType) {
    this.bType = bType;
    this.size = 10.0;
    let x,y,pos;
    do{
      x = round(random(width));
      y = round(random(height));
      pos = createVector(x,y);
    }while(isUnderSubs(pos) || this.overlapingInst(pos));
    this.position = pos;
  }
  //---------------------------------------------------------------------------
  //Draw this institution
  render(){
    let instSize = this.size * sizeMult;  //Size of institutions

    //Choose colour based on type
    //non-normative
    if(this.bType == boidType.NON){
      stroke(nonColour);
      strokeWeight(1);
      fill(nonColour);
    }
    //normative
    else if(this.bType == boidType.NORM){
      stroke(normColour);
      strokeWeight(1);
      fill(normColour);
    }

    //Draw square with center at given position
    rectMode(CENTER);
    square(this.position.x, this.position.y, instSize);
  }

  //---------------------------------------------------------------------------
  //Test if this institution is overlapping another
  overlapingInst(test){
    //Test if point is too close to edge
    if(test.x <= this.size*sizeMult ||
       test.y <= this.size*sizeMult ||
       test.x + this.size*sizeMult >= width ||
       test.y + this.size*sizeMult >= height)
       {
         console.log("edge");
         return true;
       }

    for(let i of institutions){
      //Test for overlapping institutions
      if(dist(i.position.x, i.position.y, test.x, test.y) < (this.size*sizeMult*2)){
        console.log("hit");
        return true;
      }
    }
    return false;
  }
//End Class
}
//------------------------------------------------------------------------------
//FUNCTIONS OUTSIDE OF CLASS
//------------------------------------------------------------------------------
//Draw all institutions
/*Parameters:
    insts: list of institutions to draw
*/
function drawInstitutions(insts){
  for(let inst of insts){
    inst.render();
  }
//End drawInstitutions
}
