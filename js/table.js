// Size constants
let BALL_R = 3;
let WALL_H = BALL_R * 3;
// Balls movement
let FRICTION = 0.02;  // Value bigger than 0, smaller than 1. Smaller value = less friction
let SPEED = 20;
// Stick constants
let ANGLE_LIMIT = THREE.Math.degToRad(60);  // Max angle the taco can be rotated - 60 degrees in radians
let ROT_SPEED = 1;
let STICK_L = 50;
let left_boundary, right_boundary, top_boundary, bottom_boundary;



let ballTextures = [
    new THREE.MeshPhongMaterial({
        specular: 0xffdd29,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball1.jpg')  // Full Yellow
    }),
    new THREE.MeshPhongMaterial({
        specular: 0x252ead,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball2.jpg')  // Full Blue
    }),
    new THREE.MeshPhongMaterial({
        specular: 0xFFFFFF,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball3.jpg') // Full Red
    }),
    new THREE.MeshPhongMaterial({
        specular: 0x670069,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball4.jpg') // Full Purple
    }),
    new THREE.MeshPhongMaterial({
        specular: 0xfe6600,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball5.jpg') // Full Orange
    }),
    new THREE.MeshPhongMaterial({
        specular: 0x01592f,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball6.jpg') // Full Green
    }),
    new THREE.MeshPhongMaterial({
        specular: 0xa00018,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball7.jpg') // Full Dark Red
    }),
    new THREE.MeshPhongMaterial({
        specular: 0x555555,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball8.jpg') // Full Black
    }),
    new THREE.MeshPhongMaterial({
        specular: 0xfaf3eb,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball9.jpg') // Part-Yellow
    }),
    new THREE.MeshPhongMaterial({
        specular: 0xfaf3eb,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball10.jpg') // Part-Blue
    }),
    new THREE.MeshPhongMaterial({
        specular: 0xfaf3eb,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball11.jpg') // Part-Red
    }),
    new THREE.MeshPhongMaterial({
        specular: 0xfaf3eb,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball12.jpg') // Part-Purple
    }),
    new THREE.MeshPhongMaterial({
        specular: 0xfaf3eb,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball13.jpg') // Part-Orange
    }),
    new THREE.MeshPhongMaterial({
        specular: 0xfaf3eb,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball14.jpg') // Part-Green
    }),
    new THREE.MeshPhongMaterial({
        specular: 0xfaf3eb,
        shininess: 100,
        wireframe: false,
        map: new THREE.TextureLoader().load('resources/Ball15.jpg') // Part-Dark Red
    }),
];

class PoolTable{
    #x;
    #y;
    #z;
    #tableHeight;
    #tableWidth;
    #tableDepth;
    #wallHeight;
    #tableThreeObject;
    #tableTop;
    #walls = [];
    #legHeight = 20;
    #grid = [];
    #holes = [];
    #holeSize;
    constructor(x , y , z, tableWidth, tableHeight, tableDepth, wallHeight) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
        this.#tableWidth = tableWidth;
        this.#tableHeight = tableHeight;
        this.#tableDepth = tableDepth;
        this.#wallHeight = wallHeight;
        this.#tableThreeObject = new THREE.Object3D();
        this.#addTableTop();
        this.#addWalls();
        this.#addTableLegs();
        this.#addHoles();
        this.#createGrid();
        left_boundary = -tableWidth / 2;
        right_boundary = tableWidth / 2 - tableHeight / 2;
        top_boundary = -tableDepth / 2 + tableHeight / 2;
        bottom_boundary = tableDepth / 2 - tableHeight / 2;
    }

    addToScene = scene => {
        scene.add(this.#tableThreeObject);
    };

    #createWall(x, y , z, thiccness, height, depth){
        let geometry = new THREE.CubeGeometry(thiccness, height,  depth);

        let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 0xF3FFE2,
            specular: 0xFF0000,
            shininess: 0,
            map: new THREE.TextureLoader().load('resources/wood-texture.jpg')
        }));
        mesh.position.set(x, y, z);
        mesh.receiveShadow = true;
        this.#tableThreeObject.add(mesh);

        this.#walls.push(mesh);
    }

    #createLeg(x, y, z, legWidth, legHeight, legDepth){
        'use strict';

        let geometry = new THREE.CubeGeometry(legWidth,legHeight,legDepth);

        let mesh= new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 0xF3FFE2,
            specular: 0xFF0000,
            shininess: 0,
            wireframe: false,
            map: new THREE.TextureLoader().load('resources/wood-texture.jpg')
        }));
        mesh.position.set(x,y,z);
        this.#tableThreeObject.add(mesh);
    }

    #createHole(x, y, z, size, h){
        'use strict'
        let geometry = new THREE.CylinderGeometry(size, size, h , size * 15);
        this.#holeSize = size;
        let mesh =  new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x000000}));

        mesh.position.set(x, y, z);
        this.#tableThreeObject.add(mesh);
        this.#holes.push(mesh);
    }

    #addWalls(){
        this.#createWall(this.#x + this.#tableWidth / 2,
            this.#y + this.#wallHeight / 2 - this.#tableHeight,
            this.#z,
            this.#tableHeight,
            this.#wallHeight,
            this.#tableDepth);

        this.#createWall(this.#x - this.#tableWidth / 2 - this.#tableHeight / 2,
            this.#y + this.#wallHeight / 2 - this.#tableHeight,
            this.#z,
            this.#tableHeight,
            this.#wallHeight,
            this.#tableDepth);

        this.#createWall(this.#x,
            this.#y + this.#wallHeight / 2 - this.#tableHeight,
            this.#z  -this.#tableDepth / 2,
            this.#tableWidth ,
            this.#wallHeight,
            this.#tableHeight);

        this.#createWall(this.#x,
            this.#y + this.#wallHeight / 2 - this.#tableHeight,
            this.#z + this.#tableDepth / 2,
            this.#tableWidth, this.#wallHeight,
            this.#tableHeight);
    }

    #addTableTop(){
        'use strict';

        let geometry = new THREE.CubeGeometry(this.#tableWidth, this.#tableHeight, this.#tableDepth);
        let mesh= new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0x2c8257, wireframe: false}));

        mesh.position.set(this.#x,this.#y - this.#tableHeight/2 , this.#z);
        mesh.receiveShadow = true;

        this.#tableThreeObject.add(mesh);
    }

    #addTableLegs(){
        this.#createLeg(this.#x + (3/4 * (this.#tableWidth / 2)),
            (this.#y - (this.#tableHeight/2 + this.#legHeight/2)),
            this.#z + (3/4 * (this.#tableDepth/ 2)),
            10, this.#legHeight,
            5);

        this.#createLeg(this.#x - (3/4 * (this.#tableWidth / 2)),
            (this.#y - (this.#tableHeight/2 + this.#legHeight/2)),
            this.#z + (3/4 * (this.#tableDepth/ 2)),
            10, this.#legHeight,
            5);

        this.#createLeg(this.#x - (3/4 * (this.#tableWidth / 2)),
            (this.#y - (this.#tableHeight/2 + this.#legHeight/2)),
            this.#z - (3/4 * (this.#tableDepth/ 2)),
            10, this.#legHeight,
            5);

        this.#createLeg(this.#x + (3/4 * (this.#tableWidth / 2)),
            (this.#y - (this.#tableHeight/2 + this.#legHeight/2)),
            this.#z - (3/4 * (this.#tableDepth/ 2)),
            10, this.#legHeight,
            5);
    }

    #addHoles(){
        let size = BALL_R * 1.2;
        let y_pos = ((this.#y - this.#tableHeight / 2) + 0.01);
        let z1_pos = (this.#z - (this.#tableDepth/2) + (1.5 * size));
        let z2_pos = (this.#z + (this.#tableDepth/2) - (1.5 * size));
        let x1_pos = (this.#x + (this.#tableWidth / 2) -  (1.5 * size));
        let x2_pos = (this.#x - (this.#tableWidth / 2) + (1.5 * size));

        this.#createHole(this.#x, y_pos, z1_pos, size, this.#tableHeight);  // Middle right
        this.#createHole(this.#x, y_pos, z2_pos, size, this.#tableHeight);  // Middle left
        this.#createHole(x2_pos, y_pos, z1_pos, size, this.#tableHeight);  // Top right
        this.#createHole(x2_pos, y_pos, z2_pos, size, this.#tableHeight);  // Top left
        this.#createHole(x1_pos, y_pos, z1_pos, size, this.#tableHeight);  // Bottom right
        this.#createHole(x1_pos, y_pos, z2_pos, size, this.#tableHeight);  // Bottom left
    }

    #createGrid(){
        let pos_x, pos_z;
        let gridWidth = (this.#tableWidth - 3 * BALL_R);
        let gridDepth = (this.#tableDepth - 3 * BALL_R);
        let widthDivisions = gridWidth / (2 * BALL_R);
        let depthDivisions = gridDepth / (2 * BALL_R);

        for(let i = 0; i < widthDivisions; i++){
            for(let j = 0; j < depthDivisions; j++){

                pos_x = (this.#x - (this.#tableWidth / 2) + 2 * BALL_R * (i + 1));
                pos_z = (this.#z - (this.#tableDepth/2) + 2 * BALL_R * (j + 1));
                this.#grid.push({x: pos_x, z: pos_z});       
            }
        }
    }

    getGridPosition(){
        return this.#grid.splice(Math.floor(Math.random()*this.#grid.length), 1);
    }

    getX(){
        return this.#x;
    }

    getY(){
        return this.#y
    }

    getZ(){
        return this.#z;
    }

    getWidth(){
        return this.#tableWidth;
    }

    getDepth(){
        return this.#tableDepth;
    }

    getHeight(){
        return this.#wallHeight;
    }

    scaleTable(x,y,z){
        this.#tableThreeObject.scale.set(x,y,z);
    }

    wallCollision(ball, deltaT){
        // Check for collision with every wall
        let ball_x = ball.nextPositionX(deltaT);
        let ball_z = ball.nextPositionZ(deltaT);

        if( ball.exceedsLeftBoundary(ball_x) && !ball.lockWallCollisionX)
        {
            // Left-side collision
            ball.addWallCollision("left");
        }      
        if( ball.exceedsRightBoundary(ball_x) && !ball.lockWallCollisionX)
        {   
            // Right-side collision        
            ball.addWallCollision("right");
        }
        if( ball.exceedsTopBoundary(ball_z) && !ball.lockWallCollisionZ)
        {
            // Top-side collision
            ball.addWallCollision("top");
        }
        if( ball.exceedsBottomBoundary(ball_z) && !ball.lockWallCollisionZ)
        {
            // Bottom-side collision
            ball.addWallCollision("bottom");
        }       
    }

    holeCollision(ball){
        let ballPosition = ball.getPosition();
        for(let i = 0; i < this.#holes.length; i++){
            let distanceToHole = Math.sqrt(Math.pow(ballPosition.x- this.#holes[i].position.x, 2)
                + Math.pow(ballPosition.z - this.#holes[i].position.z,2));
            if(distanceToHole < (this.#holeSize))
            {
                let xVel = Math.abs(this.#holes[i].position.x - ballPosition.x) * 2;
                let zVel = Math.abs(this.#holes[i].position.z - ballPosition.z) * 2;

                if (this.#holes[i].position.x < ballPosition.x) xVel *= -1;
                if (this.#holes[i].position.z < ballPosition.z) zVel *= -1;
                ball.assignHole(xVel, zVel);        
            }
        }
    }
}


class Ball{
    #collisionMap = new Map();
    #followerCamera;
    #geometry;
    #material;
    #ballMesh;
    #ballRadius;
    #ballThreeObject;
    #velocity = [0, 0, 0];  // velocity vector used for movement, rotation and collisions
    xVel = 0;   // x direction the ball moves when falling into a hole
    zVel = 0;   // z direction the ball moves when falling into a hole
    wallCollisions = [];  // stores directions of wall collisions: up, down, left, right
    lockWallCollisionX = false; 
    lockWallCollisionZ = false;
    isMoving = true;
    isFalling = false;

    constructor(x, y, z, radius, material) {
        this.#ballThreeObject = new THREE.Object3D();
        this.#ballRadius = radius;
        this.#geometry = new THREE.SphereGeometry( radius, 32, 32 );
        this.#material = material;
        this.#ballMesh= new THREE.Mesh( this.#geometry, this.#material);
        this.#ballMesh.add(new THREE.AxesHelper(BALL_R * 2));
        this.#ballMesh.castShadow = true;

        // Initialize random intensity & direction of the velocity
        this.#velocity = new THREE.Vector3(Math.random() * SPEED, 0, Math.random() * SPEED);
        if (Math.random() > 0.5)    this.#velocity.x *= -1;
        if (Math.random() > 0.5)    this.#velocity.z *= -1;

        this.#ballThreeObject.add(this.#ballMesh);
        this.#ballThreeObject.position.set(x,y,z);
    }
        
    addToScene = scene => {
        scene.add(this.#ballThreeObject);
    };

    move(deltaT){
        // Initialize values for moving the ball
        let angle = this.velocityAngle();
        let xVel = Math.cos(angle);
        let zVel = Math.sin(angle);
        let x_pos = this.nextPositionX(deltaT);
        let z_pos = this.nextPositionZ(deltaT);
        let totalVelocity = Math.sqrt(this.#velocity.x * this.#velocity.x + this.#velocity.z * this.#velocity.z) * deltaT;


        /* Check if ball has exited the last collision */
        /*---------------------------------------------------------------------------*/

        // Check if ball still wants to escape from the left side
        if (this.exceedsLeftBoundary(x_pos)){
            this.lockWallCollisionX = true;
        }
        else this.lockWallCollisionX = false;

        // Check if ball still wants to escape from the right side
        if (this.exceedsRightBoundary(x_pos)){
            this.lockWallCollisionX = true;    
        }
        else this.lockWallCollisionX = false;

        // Check if ball still wants to escape from the top side
        if (this.exceedsTopBoundary(z_pos)){
            this.lockWallCollisionZ = true;
        }
        else this.lockWallCollisionZ = false;

         // Check if ball still wants to escape from the bottom side
         if (this.exceedsBottomBoundary(z_pos)){
            this.lockWallCollisionZ = true;
        }
        else this.lockWallCollisionZ = false;
        /*---------------------------------------------------------------------------*/

        // Move the ball
        this.#ballThreeObject.position.x = x_pos;
        this.#ballThreeObject.position.z = z_pos;

        // Update velocity due to friction
        this.#velocity.x *= (1 - FRICTION);
        this.#velocity.z *= (1 - FRICTION);

        // Rotate the ball according to the movement direction
        this.rotate(xVel, zVel, totalVelocity);

        // Update the follower camera
        this.notifyFollowerCamera();
    }

    rotate(xVel, zVel, totalVelocity){
        let axis = new THREE.Vector3();
        axis.set(xVel, 0, zVel);
        axis.cross(THREE.Object3D.DefaultUp);

        let amount = - totalVelocity / (2 * this.#ballRadius) ;
        this.#ballMesh.rotateOnWorldAxis(axis, amount);
    }

    assignHole(x, z){
        this.isFalling = true;
        this.isMoving = false;
        this.xVel = x;
        this.zVel = z;
    }

    fall(deltaT){
        // Update vertical velocity due to gravity
        this.#velocity.y = this.#velocity.y - 9.8 * deltaT;

        // Move ball
        this.#ballThreeObject.position.x = this.#ballThreeObject.position.x + (this.xVel * deltaT);
        this.#ballThreeObject.position.z = this.#ballThreeObject.position.z + (this.zVel * deltaT);
        this.#ballThreeObject.position.y = this.#ballThreeObject.position.y + this.#velocity.y;

        // Update the follower camera
        this.notifyFollowerCamera();
    }

    checkCollisions(table, deltaT, balls){
        table.wallCollision(this, deltaT);
        table.holeCollision(this);
        this.checkBallCollisions(balls);
    }

    processCollisions(){
        this.processWallCollisions();
        this.processBallCollisions();
    }

    checkBallCollisions(balls){

        balls.forEach(ball =>{
            if(ball == this){
                return false;
            }
            let otherBallPosition = ball.getPosition();

            let x_pos = this.#ballThreeObject.position.x;
            let z_pos = this.#ballThreeObject.position.z;

            let centerDistance = Math.sqrt((Math.pow(x_pos - otherBallPosition.x,2) + Math.pow(z_pos - otherBallPosition.z,2 )));

            this.#collisionMap.set(ball, otherBallPosition.y == BALL_R && (centerDistance <= (this.#ballRadius + ball.getRadius())));
        });
    }

    addWallCollision(direction){
        this.wallCollisions.push(direction);
    }

    processWallCollisions(){   

        this.wallCollisions.forEach( direction => {
            switch(direction){              
                case "left":
                    this.reflectMovementX();
                    this.lockWallCollisionX = true;
                    break;

                case "right":
                    this.reflectMovementX();
                    this.lockWallCollisionX = true;
                    break;
                    
                case "top":
                    this.reflectMovementZ();
                    this.lockWallCollisionZ = true;
                    break;
                
                case "bottom":
                    this.reflectMovementZ();
                    this.lockWallCollisionZ = true;
                    break;

                default:
                    break;
            }
        })
        this.wallCollisions = [];
    }

    processBallCollisions(){
        for (let [ball, didCollide] of this.#collisionMap) {
            if(didCollide){
                this.calculateNewVectors(ball);
                this.#collisionMap[ball] = false;
            }
        }
    }

    calculateNewVectors(collidedBall){
        let this_velocity = new THREE.Vector3();
        let collided_velocity = new THREE.Vector3();
        
        this_velocity.set(this.getVelocity().x, 0, this.getVelocity().z);    
        collided_velocity.set(collidedBall.getVelocity().x, 0, collidedBall.getVelocity().z);

        let normal = new THREE.Vector3();
        normal.y = 0;

        // Calculate a normalized vector between the 2 ball centers
        normal.x = this.getPosition().x - collidedBall.getPosition().x;
        normal.z = this.getPosition().z - collidedBall.getPosition().z;
        normal.normalize();

        // Calculate length of the original vectors
        let this_length = this_velocity.dot(normal);
        let collided_length = collided_velocity.dot(normal);

        // Calculate optimized momentum
        let momentum = Math.min(2.0 * (this_length - collided_length) / 2, 0);

        // Calculate new movement vector this ball
        this_velocity.x -= momentum * normal.x;
        this_velocity.z -= momentum * normal.z;
        this.setVelocityVector(this_velocity);

        // Calculate new movement vector for the collided ball
        collided_velocity.x += momentum * normal.x;
        collided_velocity.z += momentum * normal.z;
        collidedBall.setVelocityVector(collided_velocity);
    }
    
    reflectMovementX(){
        this.#velocity.x *= -1;
    }

    reflectMovementZ(){
        this.#velocity.z *= -1;
    }
    
    notifyFollowerCamera(){
        if(this.#followerCamera != null){
            this.#followerCamera.objectHasMoved(this.#ballThreeObject.position.x,
                this.#ballThreeObject.position.y,
                this.#ballThreeObject.position.z,
                this.#velocity.x,
                this.#velocity.z);
            return;
        }
    }

    addFollowerCamera(camera){
        this.#followerCamera = camera;
        this.notifyFollowerCamera();
    }

    removeFollowerCamera(){
        this.#followerCamera = null;
    }

    exceedsLeftBoundary(x){
        return x - BALL_R <= left_boundary;
    }

    exceedsRightBoundary(x){
        return x + BALL_R >= right_boundary;
    }

    exceedsTopBoundary(z){
        return z - BALL_R <= top_boundary;
    }

    exceedsBottomBoundary(z){
        return z + BALL_R >= bottom_boundary;
    }

    velocityAngle(){
        let angle = Math.atan(this.#velocity.z / this.#velocity.x);
        if (this.#velocity.x < 0) angle += THREE.Math.degToRad(180);

        return angle;
    }

    boundaryDistance(boundary, pos){
        return Math.abs(boundary - pos);
    }

    setVelocityX(value){
        this.#velocity.x = value;
    }

    nextPositionX(deltaT){
        return this.#ballThreeObject.position.x + this.#velocity.x * deltaT;
    }

    nextPositionZ(deltaT){
        return this.#ballThreeObject.position.z + this.#velocity.z * deltaT;
    }

    getVelocity(){
        return {x: this.#velocity.x, z: this.#velocity.z};
    }

    setVelocityVector(vector){
        this.#velocity = vector;
    }

    setXValue(x){
        this.#ballThreeObject.position.x = x;
    }

    getX(){
        return this.#ballThreeObject.position.x;
    }

    getPosition(){
        return this.#ballThreeObject.position;
    }

    getRadius(){
        return this.#ballRadius;
    }

    getThreeObject(){
        return this.#ballThreeObject;
    }

    getWorldPosition(){
        return {x: this.#ballMesh.position.x,
        y: this.#ballMesh.position.y,
        z: this.#ballMesh.position.z};
    }

    setPosition(x,y,z){
        this.#ballThreeObject.position.set(x, y,z);
    }

    getVelocityVector(){
        return this.#velocity;
    }

    setVelocityZ(value){
        this.#velocity.z = value;
    }
}

class WhiteBall extends Ball{

    constructor(x, y, z, radius){
        let material = new THREE.MeshPhongMaterial({
            specular: 0xfaf3eb,
            shininess: 100,
            wireframe: false,
            map: new THREE.TextureLoader().load('resources/BallCue.jpg')
        });
        super(x, y, z, radius, material);
    }

    hit(force, angle){
        let xComponent = force * Math.cos((angle * Math.PI) / 180);
        let zComponent = force * Math.sin((angle * Math.PI) / 180);
        this.setVelocityX(xComponent);
        this.setVelocityZ(zComponent);
        this.notifyFollowerCamera();
    }
}

class ColoredBall extends Ball{

    constructor(x, y, z, radius, index){
        super(x, y, z, radius, ballTextures[index]);
    }
}

class Stick{
    #geometry;
    #material;
    #StickThreeObject;
    #mesh;
    pivot;
    angle;

    constructor(x, y, z, rot_x, rot_z){

        this.pivot=new THREE.Group();
        //this.pivot.position.set(x, y + WALL_H, z); //pos da "bola"
        this.pivot.position.set(x - this.orientation(rot_z) * BALL_R * 2, BALL_R, z + this.orientation(rot_x) * BALL_R * 2);

        this.#StickThreeObject= new THREE.Object3D();
        this.#geometry= new THREE.CylinderGeometry(0.5 , 1, STICK_L, 90 );
        this.#material = new THREE.MeshPhongMaterial({color: 0x72421D, wireframe: false});
        this.#mesh = new THREE.Mesh(this.#geometry, this.#material);
        this.#mesh.rotation.set(rot_x, 0, rot_z);
        this.#mesh.position.x += this.orientation(rot_z) * STICK_L / 2 + this.orientation(rot_z) *  BALL_R;
        this.#mesh.position.z -= this.orientation(rot_x) * STICK_L / 2 + this.orientation(rot_x) * BALL_R;
        this.#mesh.castShadow = true;
        this.#StickThreeObject.add(this.#mesh);
        this.pivot.add(this.#mesh);
        //this.#mesh.position.z += BALL_R * 1.2;
    }

    addToScene = scene => {
        scene.add(this.pivot)
        scene.add(this.#StickThreeObject);
    };

    rotateD(deltaT){
        if (this.pivot.rotation.y < ANGLE_LIMIT)
            this.pivot.rotation.y += ROT_SPEED * deltaT;
    }
    rotateE(deltaT){
        if (this.pivot.rotation.y > - ANGLE_LIMIT)
            this.pivot.rotation.y -= ROT_SPEED * deltaT;
    }

    rotate(ang){
        let help_angle=ang*Math.PI/180;
        this.pivot.rotation.z+=ang;
        this.angle=(this.angle+ang)%360;
    }

    orientation(n){
        if (n == 0)
            return 0;
        if (n < 0)
            return -1;
        if (n > 0)
            return 1;
    }

    addWhiteBall(ball){
        ball.setPosition(this.pivot.position.x, this.pivot.position.y,
            this.pivot.position.z);
    }

    hitBall(whiteBall){
        let f = 100;
        let deg;
        console.log(THREE.Math.radToDeg(this.pivot.rotation.y));
        if(this.pivot.position.z < 0){
            f = 50;
            deg = 90 - THREE.Math.radToDeg(this.pivot.rotation.y);
        }

        else if(this.pivot.position.z > 0){
            f = -50;
            deg = 90 -  THREE.Math.radToDeg(this.pivot.rotation.y);
        }
        else{

            if(this.pivot.position.x < 0){
                deg = -THREE.Math.radToDeg(this.pivot.rotation.y);
            }
            else {
                deg = -180 - THREE.Math.radToDeg(this.pivot.rotation.y)
            }

        }
        whiteBall.hit(  f ,  deg);
    }

    resetColor(){
        this.#material.color.setHex(0x72421D);
    }

    setNewColor(color){
        this.#material.color.setHex(color);
    }
}