///////////////////////////////////////
// ARENA CLASS
// - stores arena bounds and center
// - pretty useless, really
//
class Arena {
  var min_x;
  var min_z;
  var max_x; 
  var max_z;
  var center_x;
  var center_z;
  // constructor: feed it a GameObject & it grabs values
  // .. now autocomplete also magically works (within class)
  function Arena(arena:GameObject){
    this.min_x = arena.collider.bounds.min.x;
    this.min_z = arena.collider.bounds.min.z;
    this.max_x = arena.collider.bounds.max.x; 
    this.max_z = arena.collider.bounds.max.z;
    this.center_x = arena.collider.bounds.center.x;
    this.center_z = arena.collider.bounds.center.z;
  }
};

///////////////////////////////////////
// PLAYER CLASS
// - used for Enemy and Ourself later
// - for quick access to Transform (.t) and Rigidbody (.r)
// - constructor takes GameObject
//
class Player {

  var rigidbody : Rigidbody;
  var transform : Transform;
  
  // constructor: feed it a GameObject & it grabs values
  function Player(player:GameObject) {
    rigidbody = player.rigidbody;
    transform = player.transform;
  }
};

///////////////////////////////////////
// STATE CLASS
// - serves as a container for a single function or "behaviour"
// - the idea is to have several of these and switch between them
//
class State {
  var FixedUpdateFunction : Function;
  function FixedUpdate() {
    // call the FixedUpdateFunction if it's been set
    if (this.FixedUpdateFunction) FixedUpdateFunction();
  };
  // constructor: stores the function we gave it to be called later
    function State (fixedUpdateCallback) {
    if(fixedUpdateCallback)this.FixedUpdateFunction = fixedUpdateCallback;
  };
};

///////////////////////////////////////
// HWAI script (Harry & Will AI .. pronounced WHY?! (working title :P)
// - Instances of objects we'll need
// - MonoBehaviour function overrides

// state enum
enum AI_STATE { EARTH, FIRE, WATER, WIND };

// variables
var turn: boolean = false;
var vel : boolean = false;
var arena : Arena; // arena
var enemy : Player; // enemy
var states; // an array of all the states available (objects)
var state_stack: AI_STATE; // an array of queued up states (enum)
var active_state: AI_STATE; // state we're in currently (enum)

function Start()
{
  // arena values
  var arena_object = GameObject.Find("Arena");
  arena = new Arena(arena_object);
  
  // ref to enemy
  var enemy_object = GameObject.Find(name == "Robot 1" ? "Robot 2" : "Robot 1");
  enemy = new Player(enemy_object);

  ///////////////////////////////////////
  // AI STATES
  // - declare all states here
  // - define their behaviour
  // - add them to array of states
  // - enumerate them
  //
  states = Array();
  // EARTH state: holds center-stage at all cost
  var earth = new State( function () {
    killRot();
    killVel();
    // find vector to center-stage
    // find required orientation change to face center
    // apply orientation change
    // move
    // .. can be refined later
  });
  // FIRE state: attacks .. ! or fires all employees?
  var fire = new State( function () {
    // find enemy
    // orientate to face enemy
    // chaaaaaaaaaaarge!
    // .. can be refined later
  });
  // WATER state: dodge incoming attacks & retaliate
  var water = new State( function () {
    // .. can be defined later
  });
  // WIND state: avoid / evade / become invisible
  var wind = new State( function () {
    // hack own rigidbody functions (all of them) to return null :D
  });
  // add states to array. must be in order of AIState enum up top
  states.push(earth);
  states.push(fire);
  states.push(water);
  states.push(wind);
  // set active state on start
  active_state = AI_STATE.EARTH;
 
  // debug values
  //Debug.Log("Arena Center [X,Z]: " + a.center_x + ", " + a.center_z);
  //Debug.Log("Arena Bounds: X " + a.min_x + " .. " + a.max_x + "; Z " + a.min_z + " .. " + a.max_z);
}

function FixedUpdate() {
  // evaluate the situation
  // pick an active state
  // call fixedUpdate on active state
  states[active_state].FixedUpdate();

  //Debug.Log(active_state);
}

///////////////////////////////////////
// UTILITY FUNCTIONS
//
var temp_a : float = 0.05;
var s = 1; // scaling value between 1 and -1. Allows us to change which direction we want to turn/move.

function killRot(){
  rigidbody.AddTorque(0, (5*-(rigidbody.angularVelocity.y)),0);
}

function killVel() :  boolean{
  if (rigidbody.velocity.magnitude!=0){
    if (pointToVect(rigidbody.velocity, 10)){

    // kill any spare rotational velocity you might have before applying force.
    killRot();
    
    // in order to apply the max amount of force, but not too much so that we accelerate in the other direction, we apply a force no greater than the max.
    // To apply the most amount of force to the last second, we square the velocity.
    var amt_v = Mathf.Pow(rigidbody.velocity.magnitude,2)>5 ? rigidbody.velocity.magnitude : Mathf.Pow(rigidbody.velocity.magnitude,2);
    rigidbody.AddRelativeForce(0, 0, 5*amt_v*s);
  }
    return false;
  } else {
    killRot();
    return true;
  }
}

function pointToVect(v : Vector3, a :  float) : boolean{
  var velAng = Mathf.Atan2(-v.x, -v.z) * Mathf.Rad2Deg;
  // get the signed difference in these angles
  var angleDiff_a = Mathf.DeltaAngle( velAng, transform.eulerAngles.y);
  var angleDiff_b = Mathf.DeltaAngle( velAng, transform.eulerAngles.y+180);
 
  var angle :  float  ;
  if(Mathf.Abs(angleDiff_a)<Mathf.Abs(angleDiff_b)){
    s = 1;
    angle = angleDiff_a;
  } else {
    s = -1;
    angle = angleDiff_b;
  }
  if (Mathf.Abs(angle)<a){
    return true;
  }
 
  var amt_a = Mathf.Pow(angle,2)>5 ? angle : Mathf.Pow(angle,2);
  if    (angle > 0) rigidbody.AddTorque(0, -amt_a, 0);
  else if (angle < 0) rigidbody.AddTorque(0, amt_a , 0);
  return false;
}

function pointToCoords(x: float, z : float, a: float) : boolean{
  var v : Vector3;
  v.x = transform.position.x - x;
  v.z = transform.position.z - z;
  v.y = transform.position.y;
  return pointToVect(v,a);
}
function pointToEnemy() : boolean{
  //Vector v
  var d : Vector3;
  d.x = transform.position.x - enemy.transform.x;
  d.z = transform.position.z - enemy.transform.z;
  d.y = transform.position.y;
 
  var p = Vector3.Project(rigidbody.velocity, d) - rigidbody.velocity;
  p += enemy.rigidbody.velocity;
 
  return pointToVect(d,10);
}
function chargeEnemy(){
  if (pointToEnemy()){
    rigidbody.AddRelativeForce(0, 0, 5*s);
  }
}

///////////////////////////////////////
// FOR TESTING
// - COMMENT THIS BLOCK OUT BEFORE SUBMISSION!!!
//
function Update(){
  ///////////////////////////////////////
  // INPUT
  turn = false;
  vel = false;
  if (Input.GetKey(KeyCode.UpArrow)){
    //killRot();
    rigidbody.AddRelativeForce(0, 0, 5);
    vel = true;
  }
  if (Input.GetKey(KeyCode.DownArrow)){
    killRot();
    rigidbody.AddRelativeForce(0, 0, -5);
    vel = true;
  }
  if (Input.GetKey(KeyCode.LeftArrow)){
    rigidbody.AddTorque(0, -5, 0);
    turn = true;
  }
  if (Input.GetKey(KeyCode.RightArrow)){
    rigidbody.AddTorque(0, 5, 0);
    turn = true;
  }
  // FUNCTION TESTING
  if (Input.GetKey(KeyCode.LeftControl)){
    // Add torque based on the inverse of the current angular velocity
    // ie; in the other direction to the way the robot is spinning
    killRot();
  }
  if (Input.GetKey(KeyCode.Space)){
    killVel();
  }
  // STATE SELECTION
  if (Input.GetKey(KeyCode.Alpha1) && active_state != AI_STATE.EARTH) {
    active_state = AI_STATE.EARTH;
    Debug.Log(active_state);
  }
  if (Input.GetKey(KeyCode.Alpha2) && active_state != AI_STATE.FIRE) {
    active_state = AI_STATE.FIRE;
    Debug.Log(active_state);
  }
  if (Input.GetKey(KeyCode.Alpha3) && active_state != AI_STATE.WATER) {
    active_state = AI_STATE.WATER;
    Debug.Log(active_state);
  }
  if (Input.GetKey(KeyCode.Alpha4) && active_state != AI_STATE.WIND) {
    active_state = AI_STATE.WIND;
    Debug.Log(active_state);
  }
}