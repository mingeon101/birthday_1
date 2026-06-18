import * as THREE from "three";

import {
    getRandomPrize,
    saveWin,
    decreaseStock
} from "./firebase.js";

/* =================================
   전역 변수
================================= */

let scene;
let camera;
let renderer;

let machine;
let claw;

let capsules = [];

let currentPrize = null;

let joystick = {
    x: 0,
    y: 0
};

let moveSpeed = 0.06;

let dropping = false;
let returning = false;

const game =
    document.getElementById("game");

const loading =
    document.getElementById("loading");

const dropBtn =
    document.getElementById("dropBtn");

const joystickBase =
    document.getElementById("joystick");

const stick =
    document.getElementById("stick");

const resultModal =
    document.getElementById("resultModal");

const resultName =
    document.getElementById("resultName");

const resultImage =
    document.getElementById("resultImage");

const qrBox =
    document.getElementById("qrcode");

const shareBtn =
    document.getElementById("shareBtn");

const closeBtn =
    document.getElementById("closeBtn");

/* =================================
   초기화
================================= */

init();

function init(){

    createScene();

    createCamera();

    createRenderer();

    createLights();

    createMachine();

    createCapsules();

    setupResize();

    setupKeyboard();

    setupJoystick();

    setupButtons();

    animate();

    loading.style.display =
        "none";
}

/* =================================
   Scene
================================= */

function createScene(){

    scene =
        new THREE.Scene();

    scene.background =
        new THREE.Color(
            0x111111
        );
}

/* =================================
   Camera
================================= */

function createCamera(){

    camera =
        new THREE.PerspectiveCamera(
            60,
            window.innerWidth /
            window.innerHeight,
            0.1,
            1000
        );

    camera.position.set(
        0,
        12,
        18
    );

    camera.lookAt(
        0,
        4,
        0
    );
}

/* =================================
   Renderer
================================= */

function createRenderer(){

    renderer =
        new THREE.WebGLRenderer({

            antialias:true

        });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled =
        true;

    game.appendChild(
        renderer.domElement
    );
}

/* =================================
   Lights
================================= */

function createLights(){

    const ambient =
        new THREE.AmbientLight(
            0xffffff,
            1.8
        );

    scene.add(
        ambient
    );

    const dir =
        new THREE.DirectionalLight(
            0xffffff,
            2
        );

    dir.position.set(
        10,
        20,
        10
    );

    dir.castShadow =
        true;

    scene.add(
        dir
    );
}

/* =================================
   Machine
================================= */

function createMachine(){

    machine =
        new THREE.Group();

    scene.add(
        machine
    );

    const floor =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                12,
                1,
                12
            ),

            new THREE.MeshStandardMaterial({

                color:0x333333

            })

        );

    floor.position.y =
        -0.5;

    machine.add(
        floor
    );

    const glass =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                12,
                10,
                12
            ),

            new THREE.MeshPhysicalMaterial({

                transparent:true,

                opacity:0.15,

                transmission:1,

                roughness:0

            })

        );

    glass.position.y =
        5;

    machine.add(
        glass
    );

    const roof =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                12,
                1,
                12
            ),

            new THREE.MeshStandardMaterial({

                color:0x0088ff

            })

        );

    roof.position.y =
        10;

    machine.add(
        roof
    );

    createClaw();
}

/* =================================
   Claw
================================= */

function createClaw(){

    claw =
        new THREE.Group();

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1,
                0.5,
                1
            ),

            new THREE.MeshStandardMaterial({

                color:0xffff00

            })

        );

    claw.add(
        body
    );

    claw.position.set(
        0,
        9,
        0
    );

    machine.add(
        claw
    );

    createClawArms();
}
/* =================================
   Claw Arms
================================= */

let clawArms = [];

function createClawArms(){

    clawArms = [];

    for(let i=0;i<3;i++){

        const arm =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.15,
                    1,
                    0.15
                ),

                new THREE.MeshStandardMaterial({

                    color:0xdddddd

                })

            );

        const angle =
            i * Math.PI * 2 / 3;

        arm.position.x =
            Math.cos(angle) * 0.4;

        arm.position.z =
            Math.sin(angle) * 0.4;

        arm.position.y =
            -0.7;

        claw.add(
            arm
        );

        clawArms.push(
            arm
        );
    }
}

/* =================================
   Capsules
================================= */

function createCapsules(){

    for(
        let i=0;
        i<20;
        i++
    ){

        const capsule =
            createCapsule();

        capsule.position.set(

            (Math.random()-0.5)*8,

            0.6,

            (Math.random()-0.5)*8

        );

        scene.add(
            capsule
        );

        capsules.push(
            capsule
        );
    }
}

function createCapsule(){

    const group =
        new THREE.Group();

    const top =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.5,
                32,
                32
            ),

            new THREE.MeshStandardMaterial({

                color:0xff3333

            })

        );

    const bottom =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.5,
                32,
                32
            ),

            new THREE.MeshStandardMaterial({

                color:0xffffff

            })

        );

    top.position.y =
        0.25;

    bottom.position.y =
        -0.25;

    group.add(top);
    group.add(bottom);

    return group;
}

/* =================================
   Keyboard
================================= */

const keys = {};

function setupKeyboard(){

    window.addEventListener(
        "keydown",
        e=>{

            keys[
                e.key.toLowerCase()
            ] = true;

        }
    );

    window.addEventListener(
        "keyup",
        e=>{

            keys[
                e.key.toLowerCase()
            ] = false;

        }
    );
}

/* =================================
   Joystick
================================= */

let dragging = false;

let centerX = 0;
let centerY = 0;

function setupJoystick(){

    joystickBase.addEventListener(
        "pointerdown",
        startJoystick
    );

    window.addEventListener(
        "pointermove",
        moveJoystick
    );

    window.addEventListener(
        "pointerup",
        endJoystick
    );
}

function startJoystick(e){

    dragging = true;

    const rect =
        joystickBase.getBoundingClientRect();

    centerX =
        rect.left +
        rect.width / 2;

    centerY =
        rect.top +
        rect.height / 2;

    moveJoystick(e);
}

function moveJoystick(e){

    if(!dragging) return;

    let dx =
        e.clientX - centerX;

    let dy =
        e.clientY - centerY;

    const max = 40;

    const dist =
        Math.sqrt(
            dx*dx +
            dy*dy
        );

    if(dist > max){

        dx =
            dx / dist * max;

        dy =
            dy / dist * max;
    }

    stick.style.left =
        `${45+dx}px`;

    stick.style.top =
        `${45+dy}px`;

    joystick.x =
        dx / max;

    joystick.y =
        dy / max;
}

function endJoystick(){

    dragging = false;

    joystick.x = 0;
    joystick.y = 0;

    stick.style.left =
        "45px";

    stick.style.top =
        "45px";
}

/* =================================
   Buttons
================================= */

function setupButtons(){

    dropBtn.addEventListener(
        "click",
        startDrop
    );

    closeBtn.addEventListener(
        "click",
        closeResult
    );

    shareBtn.addEventListener(
        "click",
        sharePrize
    );
}

/* =================================
   Movement
================================= */

function updateClawMovement(){

    if(keys["a"])
        claw.position.x -= moveSpeed;

    if(keys["d"])
        claw.position.x += moveSpeed;

    if(keys["w"])
        claw.position.z -= moveSpeed;

    if(keys["s"])
        claw.position.z += moveSpeed;

    claw.position.x +=
        joystick.x *
        moveSpeed;

    claw.position.z +=
        joystick.y *
        moveSpeed;

    claw.position.x =
        THREE.MathUtils.clamp(
            claw.position.x,
            -5,
            5
        );

    claw.position.z =
        THREE.MathUtils.clamp(
            claw.position.z,
            -5,
            5
        );
}

/* =================================
   Drop
================================= */

function startDrop(){

    if(dropping) return;

    if(returning) return;

    dropping = true;
}

function updateDrop(){

    if(dropping){

        claw.position.y -= 0.08;

        if(
            claw.position.y <= 1
        ){

            claw.position.y = 1;

            dropping = false;

            returning = true;

            onCatchCheck();
        }
    }

    if(returning){

        claw.position.y += 0.08;

        if(
            claw.position.y >= 9
        ){

            claw.position.y = 9;

            returning = false;
        }
    }
}
/* =================================
   Catch Check
================================= */

async function onCatchCheck(){

    let target = null;

    let minDist = Infinity;

    for(const capsule of capsules){

        const dx =
            capsule.position.x -
            claw.position.x;

        const dz =
            capsule.position.z -
            claw.position.z;

        const dist =
            Math.sqrt(
                dx * dx +
                dz * dz
            );

        if(dist < minDist){

            minDist =
                dist;

            target =
                capsule;
        }
    }

    if(
        !target ||
        minDist > 1.2
    ){
        return;
    }

    await catchCapsule(
        target
    );
}

/* =================================
   Catch Capsule
================================= */

async function catchCapsule(
    capsule
){

    scene.remove(
        capsule
    );

    capsules =
        capsules.filter(
            c => c !== capsule
        );

    const prize =
        await getRandomPrize();

    if(!prize){

        alert(
            "등록된 상품이 없습니다."
        );

        return;
    }

    await saveWin(
        prize
    );

    await decreaseStock(
        prize
    );

    showPrize(
        prize
    );

    setTimeout(
        spawnCapsule,
        2000
    );
}

/* =================================
   Spawn Capsule
================================= */

function spawnCapsule(){

    const capsule =
        createCapsule();

    capsule.position.set(

        (Math.random()-0.5)*8,

        0.6,

        (Math.random()-0.5)*8

    );

    scene.add(
        capsule
    );

    capsules.push(
        capsule
    );
}

/* =================================
   Prize UI
================================= */

function showPrize(
    prize
){

    currentPrize =
        prize;

    resultModal.style.display =
        "flex";

    resultName.textContent =
        prize.name;

    resultImage.src =
        prize.image ||
        "https://placehold.co/300x300";

    qrBox.innerHTML = "";

    new QRCode(
        qrBox,
        {
            text:
                prize.url,

            width:180,

            height:180
        }
    );
}

function closeResult(){

    resultModal.style.display =
        "none";

    qrBox.innerHTML = "";

    currentPrize = null;
}

/* =================================
   Share
================================= */

async function sharePrize(){

    if(!currentPrize)
        return;

    try{

        if(
            navigator.share
        ){

            await navigator.share({

                title:
                    currentPrize.name,

                text:
                    currentPrize.name,

                url:
                    currentPrize.url

            });

        }else{

            await navigator
                .clipboard
                .writeText(
                    currentPrize.url
                );

            alert(
                "링크가 복사되었습니다."
            );
        }

    }catch(err){

        console.log(
            err
        );
    }
}

/* =================================
   Effects
================================= */

function updateCapsules(){

    for(
        const capsule
        of capsules
    ){

        capsule.rotation.y +=
            0.01;
    }
}

function updateClawArms(){

    const spread =
        dropping ? 0.6 : 0.35;

    clawArms.forEach(
        (
            arm,
            index
        )=>{

            const angle =
                index *
                Math.PI *
                2 / 3;

            arm.position.x =
                Math.cos(angle)
                *
                spread;

            arm.position.z =
                Math.sin(angle)
                *
                spread;
        }
    );
}

/* =================================
   Resize
================================= */

function setupResize(){

    window.addEventListener(
        "resize",
        ()=>{

            camera.aspect =
                window.innerWidth /
                window.innerHeight;

            camera.updateProjectionMatrix();

            renderer.setSize(

                window.innerWidth,

                window.innerHeight

            );

        }
    );
}

/* =================================
   Animate
================================= */

function animate(){

    requestAnimationFrame(
        animate
    );

    updateClawMovement();

    updateDrop();

    updateCapsules();

    updateClawArms();

    renderer.render(
        scene,
        camera
    );
}
