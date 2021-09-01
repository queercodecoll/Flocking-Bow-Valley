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
    let x,y,pos;
    do{
      x = round(random(width));
      y = round(random(height));
      pos = createVector(x,y);
    }while(isUnderSubs(pos) && this.overlapingInst());
    this.position = pos;
    this.size = 10;
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
  overlapingInst(){
    for(let i in institutions){
      if(dist(i.x,i.y, this.x,this.y) < this.size*sizeMult){
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
