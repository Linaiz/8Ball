class followerCamera{
    THREECamera;
    constructor(fov, aspect, near, far) {
        this.THREECamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    }

    objectHasMoved(objectX, objectY, objectZ, xVel, zVel){
        let xHeight = 15;
        let zHeight = 15;
        let yHeight = 15;
        this.THREECamera.position.x = (objectX - ((xVel / Math.abs(xVel)) * xHeight));
        this.THREECamera.position.z = (objectZ - ((zVel / Math.abs(zVel)) * zHeight));

        this.THREECamera.position.y = objectY + yHeight;
        this.THREECamera.lookAt(objectX,
            objectY,
            objectZ
        );
    }
}