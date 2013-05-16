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
// - equally useless...
// - could be extended to carry out operations to give us useful info on enemy
// - constructor takes GameObject
//
/* // Add/remove slash to line beginning to un-/comment block
class Player {

  var rigidbody : Rigidbody;
  var transform : Transform;

  // constructor: feed it a GameObject & it grabs values
  function Player(player:GameObject) {
    rigidbody = player.rigidbody;
    transform = player.transform;
  }
};//*/

///////////////////////////////////////
// STATE CLASS
// - serves as a container for a single "behaviour" function
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
// TEST CLASS
// - used in profiling to measure efficiency of logic used i.e. how long does
// it take to slow to a stop using algorithm A. how long does it take to get
// from point A to point B using algorithm XYZ, etc.
// - creates an object with a name and test condition
// - time is recorded upon creation
// - an external profile() function checks condition for each test on every
//   frame and kills a test once its contition has been met. The time taken to
//   complete the test is printed to console
//
class Test {
  var name;
  var ticks_at_start;
  var test_condition : Function;
  var expected_value;
  
  // constructor
  function Test(name, test_condition : Function, expected_value){
    // name it
    this.name = name;
    // set the time at creation
    this.ticks_at_start = Date.Now.Ticks;
    // set the test condition
    this.test_condition = test_condition;
    // set expected test result value
    this.expected_value = expected_value;
  }
  
  function assert_true() : boolean {
    return this.test_condition() == this.expected_value;
  }
  
  function start(test_list : Array) {
    test_list.push(
      new Test(this.name, this.test_condition, this.expected_value)
    );
  }
};

///////////////////////////////////////
// Tests for profiling
var hit = new Test(
  "hit",
  function() {
    return Mathf.Abs(transform.position.x - enemy.transform.position.x) < 1.5
    && Mathf.Abs(transform.position.z - enemy.transform.position.z) < 1.5;
  },
  true
);
var lookright = new Test(
  "Zoolander",
  function() {
    active_state != AI_STATE.ZOOLANDER;
  },
  true
);


///////////////////////////////////////
// HWAI script (Harry & Will AI .. pronounced WHY?! (working title :P)
// - Instances of objects we'll need
// - MonoBehaviour function overrides

// array to hold tests for profiling
var tests = Array();

// state enum
enum AI_STATE { IDLE, GRASSHOPPER, EARTH, FIRE, WATER, WIND, ZOOLANDER, PLANET };

// variables
var arena : Arena; // arena
var enemy : GameObject; // enemy
var states; // an array of all the states available (objects)
var state_stack: AI_STATE; // an array of queued up states (enum)
var active_state: AI_STATE; // state we're in currently (enum)
var last = 0; // time check
var rot_per_tor = 0; // rotation we get off of angular velocity of 1
function Start()
{
  // arena values
  var arena_object = GameObject.Find("Arena");
  arena = new Arena(arena_object);

  // ref to enemy
  enemy = GameObject.Find(name == "Robot 1" ? "Robot 2" : "Robot 1");

  ///////////////////////////////////////
  // AI STATES
  // - declare all states here
  // - define their behaviour
  // - add them to array of states
  // - enumerate them
  //
  states = Array();
  // IDLE
  var idle = new State( function () {
    // pick a state
  });
  // GRASSHOPPER
  var grasshopper = new State( function () {
    // learn the **** out of this world
    if(!rigidbody.angularVelocity.magnitude) {
      rigidbody.AddTorque(0,1,0);
    } else if(!rot_per_tor){
Debug.Log(rigidbody.rotation.eulerAngles.y);
      rot_per_rot = rigidbody.rotation.eulerAngles.y;
    } else {
      active_state = AI_STATE.IDLE;
Debug.Log(rot_per_tor);
    }
  });
  // EARTH
  var earth = new State( function () {
    killVel();
  });
  // FIRE
  var fire = new State( function () {
    chargeEnemy();
  });
  // WATER
  var water = new State( function () {});
  // WIND
  var wind = new State( function () {});
  // ZOOLANDER
  var zoolander = new State( function () {
    if(
      pointToCoords(5, 0, 0.001)
      && rigidbody.angularVelocity.y < 0.001
    ) {
      active_state = AI_STATE.IDLE;
    }
  });
  // PLANET
  var planet = new State( function () {
    rigidbody.angularVelocity.y = 0.2;
    var current = Vector3.Angle(transform.forward,Vector3(0,0,1)) * Time.deltaTime;
Debug.Log(current - last);
    last = current;
  });
  // add states to array. must be in order of AI_STATE enum up top
  states.push(idle);
  states.push(grasshopper);
  states.push(earth);
  states.push(fire);
  states.push(water);
  states.push(wind);
  states.push(zoolander);
  states.push(planet);
  // set active state on start
  active_state = AI_STATE.GRASSHOPPER;

  // debug values
  //Debug.Log("Arena Center [X,Z]: " + a.center_x + ", " + a.center_z);
  //Debug.Log("Arena Bounds: X " + a.min_x + " .. " + a.max_x + "; Z " + a.min_z + " .. " + a.max_z);
}

function FixedUpdate() {
  // evaluate the situation
  // pick an active state
  // call fixedUpdate on active state
  states[active_state].FixedUpdate();

  profile();
  //Debug.Log(active_state);
}




///////////////////////////////////////
// UTILITY FUNCTIONS
//
var s = 1; // scaling value between 1 and -1. Allows us to change which direction we want to turn/move.

function accelFor(){
	var v = transform.position + rigidbody.velocity;
	if(	v.x >= arena.max_x -1||
		v.x <= arena.min_x +1||
		v.z >= arena.max_z -1||
		v.z <= arena.min_z +1){
		rigidbody.AddRelativeForce(0, 0, 5*-s);
	} else {
		rigidbody.AddRelativeForce(0, 0, 5*s);
	}
}

function killRot(){
  rigidbody.AddTorque(0, (5*-(rigidbody.angularVelocity.y)),0);
}

function killVel() :  boolean{
  if (rigidbody.velocity.magnitude>=0.01){
    if (pointDampingToVect(rigidbody.velocity, 10)){

    // kill any spare rotational velocity you might have before applying force.
    killRot();

    // in order to apply the max amount of force, but not too much so that we accelerate in the other direction, we apply a force no greater than the max.
    // To apply the most amount of force to the last second, we square the velocity.
    var amt_v = Mathf.Pow(rigidbody.velocity.magnitude,2)>5 ?
    	rigidbody.velocity.magnitude : Mathf.Pow(rigidbody.velocity.magnitude,2);
    rigidbody.AddRelativeForce(0, 0, 5*amt_v*s);
  }
    return false;
  } else {
    killRot();
    return true;
  }
}
function pointDampingToVect (v : Vector3, a :  float) : boolean{
	return pointToVect(v, a, true);
}
function pointFastToVect (v : Vector3, a :  float) : boolean{
	return pointToVect(v, a, false);
}
function pointToVect(v : Vector3, a :  float, f : boolean) : boolean{
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
// if fast mode is enabled, set the amount to turn by straight to 5.
  var amt_a = f ? (Mathf.Pow(angle,2)>5 ? 5 : Mathf.Pow(angle,2)) : 5;
  if    (angle > 0) rigidbody.AddTorque(0, -amt_a, 0);
  else if (angle < 0) rigidbody.AddTorque(0, amt_a , 0);
  return false;
}

function pointToCoords(x: float, z : float, a: float) : boolean{
  var v : Vector3;
  v.x = transform.position.x - x;
  v.z = transform.position.z - z;
  v.y = transform.position.y;
  return pointDampingToVect(v,a);
}
function pointToEnemy() : boolean{
	//Vector d, the difference between the two robots
	var d : Vector3;
	d.x = transform.position.x - enemy.transform.position.x;
	d.z = transform.position.z - enemy.transform.position.z;
	d.y = transform.position.y;

	//Project velocity vector onto d.
	var p = Vector3.Project(rigidbody.velocity, d) - rigidbody.velocity;
//	p += enemy.rigidbody.velocity;
	
	//Velocity of enemy robot
	var v = 1.5 * enemy.rigidbody.velocity * (1-Mathf.Abs(0.5-threatDetect()));
	return pointFastToVect(d-(p*5)-v,2);
}
function chargeEnemy(){
  if (pointToEnemy()){
  	killRot();
	  accelFor();
  }
}
function threatDetect(): float{
	var v = (enemy.transform.position - transform.position).normalized;
	return Vector3.Angle(v, enemy.rigidbody.velocity.normalized)/180;
}
function dangerDetect() : float{

}

///////////////////////////////////////
// PROFILING TOOL
// - used to record time taken to achieve certain goals
// - set a trigger to start timer, and one to stop timer
// - give it a name and time will be printed to console
//

// profiler funciton to check tests for completion
function profile() {
  var test_count = tests.length;
  var test : Test;
  var completed_tests = Array();
  while(test_count--) {
    test = tests[test_count];
    if (test.assert_true()) {
      var ticks = Date.Now.Ticks - test.ticks_at_start;
      var seconds = ticks / 10000000; // million
      var milis = (ticks - seconds * 10000000) / 1000;
      Debug.Log("Test ["+test.name+"] completed in "+seconds+"."+milis+"m ticks");
      completed_tests.push(test_count); // to remove them later
    }
  }
  // remove completed tests from tests array
  // doing this in a reversed loop, after iterating
  // .. otherwise we'd screw over the iterator
  var completed_count = completed_tests.length;
  while(completed_count--) {
    tests.RemoveAt(completed_tests[completed_count]);
  }
}

///////////////////////////////////////
// FOR TESTING
// - COMMENT THIS BLOCK OUT BEFORE SUBMISSION!!!
//
function Update(){
  ///////////////////////////////////////
  // INPUT
  if (Input.GetKey(KeyCode.UpArrow)){
    //killRot();
    rigidbody.AddRelativeForce(0, 0, 5);
  }
  if (Input.GetKey(KeyCode.DownArrow)){
    killRot();
    rigidbody.AddRelativeForce(0, 0, -5);
  }
  if (Input.GetKey(KeyCode.LeftArrow)){
    rigidbody.AddTorque(0, -5, 0);
  }
  if (Input.GetKey(KeyCode.RightArrow)){
    rigidbody.AddTorque(0, 5, 0);
  }
  // FUNCTION TESTING
  if (Input.GetKey(KeyCode.LeftShift)){
    Debug.Log("Threat: " + threatDetect());
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
  if (Input.GetKey(KeyCode.Alpha5) && active_state != AI_STATE.ZOOLANDER) {
    active_state = AI_STATE.ZOOLANDER;
    lookright.start(tests);
    Debug.Log(active_state);
  }
  if (Input.GetKey(KeyCode.Alpha6) && active_state != AI_STATE.PLANET) {
    active_state = AI_STATE.PLANET;
    Debug.Log(active_state);
  }
  // ENEMY CONTROL
  if (Input.GetKey(KeyCode.W)){
    enemy.rigidbody.AddRelativeForce(0, 0, 5);
    vel = true;
  }
  if (Input.GetKey(KeyCode.S)){
    enemy.rigidbody.AddRelativeForce(0, 0, -5);
  }
  if (Input.GetKey(KeyCode.A)){
    enemy.rigidbody.AddTorque(0, -5, 0);
  }
  if (Input.GetKey(KeyCode.D)){
    enemy.rigidbody.AddTorque(0, 5, 0);
  }
}