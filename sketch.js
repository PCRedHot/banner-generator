class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(p) {
    return new Point(this.x + p.x, this.y + p.y);
  }

  minus(p) {
    return new Point(this.x - p.x, this.y - p.y);
  }

  times(t) {
    return new Point(this.x * t, this.y * t);
  }
}

class Color {
  constructor(r, g, b){
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

class Vertex {
  constructor(name, point, velocity, size_o, size_d, color) {
    this.name = name;
    this.position = point;
    this.velocity = velocity;
    this.size = size_o;
    this.size_d = size_d;
    this.color = color;
  }
  
  draw(){
    stroke(this.color.r, this.color.g, this.color.b);
    strokeWeight(this.size);
    point(this.position.x, this.position.y);
  }

  update(){
    this.size += this.size_d;
    this.position = this.position.add(this.velocity);

    if (this.position.x < 0) {
      this.position.x *= -1;
      this.velocity.x *= -1;
    }

    if (this.position.x > CANVAS_WIDTH) {
      this.position.x = CANVAS_WIDTH - (this.position.x - CANVAS_WIDTH);
      this.velocity.x *= -1;
    }

    if (this.position.y < 0) {
      this.position.y *= -1;
      this.velocity.y *= -1;
    }

    if (this.position.y > CANVAS_HEIGHT) {
      this.position.y = CANVAS_HEIGHT - (this.position.y - CANVAS_HEIGHT);
      this.velocity.y *= -1;
    }

  }
}


class Graph {
  constructor() {
    this.vertices = {};
    this.edges = new Set();
  }

  add_vertex(v) {
    if (v.name in this.vertices) return false;
    this.vertices[v.name] = v;
    return true;
  }

  add_edge(n1, n2) {
    if (!(n1 in this.vertices) && !(n2 in this.vertices)) return false;
    const new_edge = [n1, n2];
    this.edges.add(new_edge);
  }

  draw_vertices(){
    Object.entries(this.vertices).map(vertex_item => {
      vertex_item[1].draw();
    });
  }

  draw_edges(){
    this.edges.forEach(edge => {
      stroke(EDGE_COLOR.r, EDGE_COLOR.g, EDGE_COLOR.b);
      strokeWeight(0.3);
      let p1 = this.vertices[edge[0]].position;
      let p2 = this.vertices[edge[1]].position;
      line(p1.x, p1.y, p2.x, p2.y);
    });
  }

  draw(){
    this.draw_vertices();
    this.draw_edges();
  }

  update(){
    Object.entries(this.vertices).map(vertex_item => {
      vertex_item[1].update();
    });
  }
}


function get_random_range(min, max) {
  return Math.random() * (max - min) + min;
}

function get_random_color(){
  return new Color(round(random(100, 255)), round(random(100, 255)), round(random(100, 255)));
}



const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 640;

const GRAPH_SIZE_MEAN = 300;
const GRAPH_SIZE_SD = 50;

const GRAPH_VELOCITY_MEAN = 3;
const GRAPH_VELOCITY_SD = 0.2;

const POINT_VELOCITY_SD = 0.4;

const POINT_SIZE_MEAN = 6;
const POINT_SIZE_SD = 2;

const POINT_SIZE_D_MEAN = 0;
const POINT_SIZE_D_SD = 0;

const EDGE_COLOR = new Color(255, 255, 255);

function get_random_graph(num_vertex){
  const new_graph = new Graph();

  let graph_centre = new Point(get_random_range(200, CANVAS_WIDTH-200), get_random_range(80, CANVAS_HEIGHT-80));
  let graph_size = randomGaussian(GRAPH_SIZE_MEAN, GRAPH_SIZE_SD);

  let graph_speed = randomGaussian(GRAPH_VELOCITY_MEAN, GRAPH_VELOCITY_SD);
  let graph_angle = get_random_range(0, Math.PI * 2);
  let graph_velocity = new Point(graph_speed * Math.cos(graph_angle), graph_speed * Math.sin(graph_angle));

  let name_array = [];
  for (var i = 0; i < num_vertex; i++){
    let vertex_name = i.toString();

    name_array.push(vertex_name);

    // Random Position
    let dist_to_centre = get_random_range(0, graph_size);
    let position_angle = get_random_range(0, Math.PI * 2);

    let position = graph_centre.add(new Point(dist_to_centre * Math.cos(position_angle), dist_to_centre * Math.sin(position_angle)));
    

    // Random Velocity
    let point_speed = randomGaussian(0, POINT_VELOCITY_SD);
    let point_velocity_angle = get_random_range(0, Math.PI * 2);
        
    let point_velocity = (new Point(point_speed * Math.cos(point_velocity_angle), point_speed * Math.sin(point_velocity_angle))).add(graph_velocity);


    // Random Size
    let point_size = randomGaussian(POINT_SIZE_MEAN, POINT_SIZE_SD);

    // Random d Size / dt 
    //let point_size_d = randomGaussian(POINT_SIZE_D_MEAN, POINT_SIZE_D_SD);
    let point_size_d = 0;
  
    const new_vertex = new Vertex(vertex_name, position, point_velocity, point_size, point_size_d, get_random_color());

    new_graph.add_vertex(new_vertex);
  }

  var edges = name_array.flatMap(
    (v, i) => name_array.slice(i+1).map(w => [v, w])
  );

  edges.forEach(item => {
    if (random() < EDGE_DROPOUT) return;
    new_graph.add_edge(item[0], item[1]);
  });

  return new_graph;
}

const NUM_GRAPHS = 15;
const NUM_VERTEX_MEAN = 4;
const NUM_VERTEX_SD = 1;

const EDGE_DROPOUT = 0.5;

let GRAPHS = [];
let font;

var capturer;

function preload() {
  font = loadFont('assets/CONSOLA.TTF');
}

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  for (var i = 0; i < NUM_GRAPHS; i++){
    let num_vertices = Math.round(randomGaussian(NUM_VERTEX_MEAN, NUM_VERTEX_SD));

    GRAPHS.push(get_random_graph(num_vertices));
  }

  textFont(font);
  textSize(120);
  textAlign(CENTER, CENTER);

}

let t = 0;
let manual_record_stopper = false;

const CAPTURE_FRAME = 5000;

function draw() {
  if (manual_record_stopper) return;

  background(17, 5, 39);  

  GRAPHS.forEach(graph => graph.draw());

  fill(255, 255, 255);
  stroke(255, 255, 255);
  text('Parry Choi', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);

  GRAPHS.forEach(graph => graph.update());

  t += 1;

  if (t > 5000) return;
  if (t % CAPTURE_FRAME == 1) {
    capturer = new CCapture({format: 'webm', workersPath: 'node_modules/ccapture.js/src/'});
    capturer.start();
    render();
   }
  if (t % CAPTURE_FRAME == 0) {
    capturer.stop(); 
    capturer.save();
  }


}


function render(){
	requestAnimationFrame(render);
	capturer.capture( canvas );
}