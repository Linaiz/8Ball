let keyMap = [];

let activeCamera, camera1, camera2, camera3, scene, renderer, previousTime;

let table, balls = [];

let light, pointLight;
let controls;
let loadTime = 6;
let loadTimer = new THREE.Clock(true);
let clock = new THREE.Clock(true);
let ballVelocity = 0.001;
let followerCam;

let stickIndex = 0;
let stick;
let sticks = [];
let whiteBall = new WhiteBall(1000, 2+ BALL_R, 1000, BALL_R);
let stickDefault = 0x72421D;
let stickSelected = 0x0000FF;



function createSticks(table){
    let s, x, y, z, width, depth;

    x = table.getX();
    y = table.getY();
    z = table.getZ();
    width = table.getWidth();
    depth = table.getDepth();

    let y_pos = y;
    
    let z1_pos = z - depth / 2;
    let z2_pos = z + depth / 2;
    let z_middle = z;
    
    let x1_pos =  x - width / 2 ;
    let x2_pos = x + width / 2;

    let x_middle1 = x - width / 4;
    let x_middle2 = x + width / 4;

    s = new Stick(x_middle1, y_pos, z1_pos, Math.PI / 2, 0);  // meio esquerda cima
    sticks.push(s);
    s.addToScene(scene);
    
    s = new Stick(x_middle1, y_pos, z2_pos, -Math.PI / 2, 0);  // meio esquerda baixo
    sticks.push(s);
    s.addToScene(scene);
    
    s = new Stick(x1_pos, y_pos, z_middle, 0, - Math.PI / 2);  // meio direita
    sticks.push(s);
    s.addToScene(scene);

    s = new Stick(x2_pos, y_pos, z_middle, 0, Math.PI / 2);  // meio esquerda
    sticks.push(s);
    s.addToScene(scene);
    
    s = new Stick(x_middle2, y_pos, z1_pos, Math.PI / 2, 0);  // meio direita cima
    sticks.push(s);
    s.addToScene(scene);
    
    s = new Stick(x_middle2, y_pos, z2_pos, -Math.PI / 2, 0);  // Bottom esquerda baixo
    sticks.push(s);
    s.addToScene(scene);

    stick = sticks[0];
}

function createTable(x, y, z, width, depth){
    table = new PoolTable(x, y, z, width, 2, depth, WALL_H);
    table.addToScene(scene);
    let ball_x, ball_z, ball;
    let position;

    for(let i = 0; i < 15; i++){
        position = table.getGridPosition();
        ball_x = position[0].x;
        ball_z = position[0].z;
        ball = new ColoredBall(ball_x, y + BALL_R, ball_z, BALL_R, i);
        ball.addToScene(scene);
        balls.push(ball);
    }
}

function createSkybox(){
    'use strict';
    var geometry, images, material, mesh;

    geometry = new THREE.CubeGeometry(1000, 1000, 1000);

    // Load images
    var images =
        [
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("resources/front.png"), side: THREE.DoubleSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("resources/back.png"), side: THREE.DoubleSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("resources/up.png"), side: THREE.DoubleSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("resources/down.png"), side: THREE.DoubleSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("resources/right.png"), side: THREE.DoubleSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("resources/left.png"), side: THREE.DoubleSide })
        ];

    material = new THREE.MeshFaceMaterial(images);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10));

    light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);

    pointLight = new THREE.PointLight(0xffffff, 0.4);
    pointLight.position.y = 50;
    pointLight.castShadow = true;
    scene.add(pointLight);
}

function createCamera(){
    'use strict';

    camera1 = new THREE.OrthographicCamera( window.innerWidth  / - 16, window.innerWidth  / 16, window.innerHeight / 16, window.innerHeight / - 16, 1, 1000 );
    camera1.position.x = table.getX();
    camera1.position.y = table.getY() + 100;
    camera1.position.z = table.getZ();
    camera1.lookAt(table.getX(), table.getY(), table.getZ());

    camera2 = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 10, 1000);
    camera2.position.x = 100;
    camera2.position.y = 100;
    camera2.position.z = 100;
    camera2.lookAt(table.getX(), table.getY(), table.getZ());

    camera3 = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 10, 1000);
    camera3.position.x = table.getX();
    camera3.position.y = table.getY() + 100;
    camera3.position.z = table.getZ();


    followerCam =  new followerCamera(60, window.innerWidth / window.innerHeight, 10, 1000);
    activeCamera = camera1;
}

function onResize(){
    'use strict';
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        activeCamera.aspect = window.innerWidth / window.innerHeight;
        activeCamera.updateProjectionMatrix();

        camera1.aspect = window.innerWidth / window.innerHeight;
        camera1.updateProjectionMatrix();
        camera2.aspect = window.innerWidth / window.innerHeight;
        camera2.updateProjectionMatrix();
        camera3.aspect = window.innerWidth / window.innerHeight;
        camera3.updateProjectionMatrix();
    }
}

function render(){
    'use strict';
    renderer.render(scene, activeCamera);
}

function onKeyUp(e){
    keyMap[e.keyCode] = false;
}

function onKeyDown(e) {
    'use strict';
    keyMap[e.keyCode] = true;
}

function init(){
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    createScene();

    createTable(0, 0, 0, 120, 60);
    createSticks(table);
    createCamera();

    createSkybox();

    getCameraFollowingBall(whiteBall);
    whiteBall.addToScene(scene);



    controls = new THREE.OrbitControls(camera3, renderer.domElement );

    controls.update();

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

function processKeyPresses(deltaT){
    if(keyMap[37]){
        stick.rotateE(deltaT);
    }
    if(keyMap[39]){
        stick.rotateD(deltaT)
    }
    if(keyMap[49]){
        activeCamera = camera1;  
    }
    if(keyMap[50]){
        activeCamera = camera2;
        
    }
    if(keyMap[51]){
        activeCamera = followerCam.THREECamera;
    }

    if(keyMap[52]){ // 4
        changeSelectedStick(sticks[0]);
        stick.addWhiteBall(whiteBall);
    }
    if(keyMap[53]){ // 5
        changeSelectedStick(sticks[1]);
        stick.addWhiteBall(whiteBall);
    }
    if(keyMap[54]){ // 6
        changeSelectedStick(sticks[2]);
        stick.addWhiteBall(whiteBall);
    }
    if(keyMap[55]){ // 7
        changeSelectedStick(sticks[3]);
        stick.addWhiteBall(whiteBall);
    }
    if(keyMap[56]){ // 8
        changeSelectedStick(sticks[4]);
        stick.addWhiteBall(whiteBall);
    }
    if(keyMap[57]){ // 9
        changeSelectedStick(sticks[5]);
        stick.addWhiteBall(whiteBall);
    }
    if(keyMap[32]){ // Space
        stick.hitBall(whiteBall);
        balls.push(whiteBall);
        whiteBall = new WhiteBall(1000,  BALL_R, 1000, BALL_R);
        whiteBall.removeFollowerCamera();
        whiteBall.addFollowerCamera(followerCam);
        whiteBall.addToScene(scene);
        keyMap[32] = false;
    }

}

function changeSelectedStick(newSelectedStick){
    stick.resetColor();
    stick = newSelectedStick;
    stick.setNewColor(0xFF0000);
}

function moveBalls(deltaT){
    balls.forEach(ball => {
        if(ball.isFalling){
            ball.fall(deltaT);
        }
        else if (ball.isMoving){
            ball.checkCollisions(table, deltaT, balls);
            ball.processCollisions();
            ball.move(deltaT);
        }
    });
}

function getCameraFollowingBall(ball){
    ball.removeFollowerCamera();
    ball.addFollowerCamera(followerCam);
}

function animate(){
    'use strict';

    if (loadTimer.getElapsedTime() >  loadTime){
        if (!clock.running) clock.start();
        let deltaT = clock.getDelta();

        moveBalls(deltaT);
        processKeyPresses(deltaT);
    }

    requestAnimationFrame(animate);
    render();
}
