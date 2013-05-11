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
// TASK CLASS
// - creates an object with a name and test condition in tasks array
// - time is recorded upon creation
// - profile() function checks condition and kills the task
// once the contition is met while printing time to console
class Task {
  var name;
  var ticks_at_start;
  var test_condition : Function;
  var expected_value;
  
  // constructor
  function Task(name, test_condition : Function, expected_value){
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
  
  function start(task_list : Array) {
    task_list.push(
      new Task(this.name, this.test_condition, this.expected_value)
    );
  }
};

///////////////////////////////////////
// Tasks for profiling
var hit = new Task(
  "hit",
  function() {
    return Mathf.Abs(transform.position.x - enemy.transform.position.x) < 2
    && Mathf.Abs(transform.position.z - enemy.transform.position.z) < 2;
  },
  true
);

///////////////////////////////////////
// HWAI script (Harry & Will AI .. pronounced WHY?! (working title :P)
// - Instances of objects we'll need
// - MonoBehaviour function overrides

// create an array to hold tasks for profiling
var tasks = Array();

// state enum
enum AI_STATE { EARTH, FIRE, WATER, WIND };

// variables
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
    killVel();
    // find vector to center-stage
    // find required orientation change to face center
    // apply orientation change
    // move
    // .. can be refined later
  });
  // FIRE state: attacks .. ! or fires all employees?
  var fire = new State( function () {
    chargeEnemy();
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

  profile();
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
	rigidbody.AddRelativeForce(0, 0, 5*s);
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

// profiler funciton to check tasks for completion
function profile() {
  var task_count = tasks.length;
  var task : Task;
  var completed_tasks = Array();
  while(task_count--) {
    task = tasks[task_count];
    if (task.assert_true()) {
      var ticks = Date.Now.Ticks - task.ticks_at_start;
      var seconds = ticks / 10000000; // million
      var milis = (ticks - seconds * 10000000) / 1000;
      Debug.Log("Task ["+task.name+"] completed in "+seconds+"."+milis+"m ticks");
      completed_tasks.push(task_count); // to remove them later
    }
  }
  // remove completed tasks from tasks array
  // doing this in a reversed loop, after iterating
  // .. otherwise we'd screw over the iterator
  var completed_count = completed_tasks.length;
  while(completed_count--) {
    tasks.RemoveAt(completed_tasks[completed_count]);
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
    vel = true;
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
    hit.start(tasks);
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