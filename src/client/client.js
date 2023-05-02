import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { setup, loop } from "./communication.js";
import { recordDef } from "./record.js";
import { handpose } from "./handpose.js";
import { InitNavigation } from './navigation.js';
import { partSelction } from './part'

let camera, scene, renderer;
const params = {
    exportToObj: exportToObj
};

let stamenCount;

let cubeCamera, cubeRenderTarget;

let controls;

let container;

// parts of flower group for THREE
export let petalGroup;
export let sepalGroup;
export let petalFunctionText = "";
export let sepalFunctionText = "";

function prepare() {

    container = document.getElementById('canvas-threejs');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setAnimationLoop(animation);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const canvas = renderer.domElement;
    document.getElementById("threejs-place").appendChild(container);
    container.appendChild(canvas);
    canvas.style.display = 'block'; // 让 canvas 元素变成块级元素
    canvas.style.margin = 'auto'; // center canvas horizontally
    // canvas.width = container.clientWidth;
    // canvas.height = container.clientHeight;

    // 让canvas在container里不要出去
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';

    window.addEventListener('resize', onWindowResized);

    camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(0, 15, 20);
    // camera.up.set(0, 0, -1);
    // camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.rotation.y = 0.5; // avoid flying objects occluding the sun

    new RGBELoader()
        .setPath('asset/texture/')
        .load('spaichingen_hill_1k.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
        });


    cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    cubeRenderTarget.texture.type = THREE.HalfFloatType;

    cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

    /* GUI */
    const gui = new GUI();
    gui.add(params, 'exportToObj').name('Export OBJ');
    // change position of GUI
    document.getElementById("gui").append(gui.domElement);


    controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = false;
}

export function init(petalGroup, sepalGroup) {

    if (scene.getObjectByName(petalGroup.name)) {
        var selectedObject = scene.getObjectByName(petalGroup.name);
        scene.remove(selectedObject);
    }
    if (scene.getObjectByName(sepalGroup.name)) {
        var selectedObject = scene.getObjectByName(sepalGroup.name);
        scene.remove(selectedObject);
    }
    /* FLOWER */


    /* 3. STEM */
    const stemGeometry = new THREE.CylinderGeometry(0.5, 0.6, 10);
    const stemMesh = new THREE.Mesh(stemGeometry, new THREE.MeshStandardMaterial({ color: "green" }));
    stemMesh.position.y = -4;

    stemMesh.name = "stem";
    console.log("stemMesh:", stemMesh)


    /* 4. PISTIL */
    // Create a group to hold the pistil parts
    const pistilGroup = new THREE.Group();

    // Create the stigma
    const stigmaGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const stigmaMaterial = new THREE.MeshStandardMaterial({ color: "yellow" });
    const stigmaMesh = new THREE.Mesh(stigmaGeometry, stigmaMaterial);
    stigmaMesh.position.set(0, 5, 0); // move the style down to the base of the stigma
    pistilGroup.add(stigmaMesh);
    stigmaMesh.name = "stigma";

    // Create the style
    const styleGeometry = new THREE.CylinderGeometry(0.4, 0.4, 4, 8);
    const styleMaterial = new THREE.MeshStandardMaterial({ color: "green" });
    const styleMesh = new THREE.Mesh(styleGeometry, styleMaterial);
    styleMesh.position.set(0, 3, 0); // move the style down to the base of the stigma
    pistilGroup.add(styleMesh);
    styleMesh.name = "style";

    // Create the ovary
    const ovaryGeometry = new THREE.SphereGeometry(1, 16, 16);
    const ovaryMaterial = new THREE.MeshStandardMaterial({ color: "green" });
    const ovaryMesh = new THREE.Mesh(ovaryGeometry, ovaryMaterial);
    ovaryMesh.position.set(0, 1, 0); // move the ovary down from the style
    pistilGroup.add(ovaryMesh);
    ovaryMesh.name = "ovary";

    pistilGroup.name = "pistil";
    console.log("pistilGroup:", pistilGroup);



    /* 5. STAMEN */
    const oneStamenGroup = new THREE.Group();
    const stamenGroup = new THREE.Group();

    // Create the filament
    const filamentGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 8);
    filamentGeometry.translate(0, 4 / 2, 0); // 改变几何的中心点geometry.translate( 0, cylinderHeight/2, 0 );
    const filamentMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const filamentMesh = new THREE.Mesh(filamentGeometry, filamentMaterial);
    oneStamenGroup.add(filamentMesh);

    // Create the anther
    const antherGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const antherMaterial = new THREE.MeshStandardMaterial({ color: "pink" });
    const antherMesh = new THREE.Mesh(antherGeometry, antherMaterial);
    antherMesh.position.set(0, 4, 0);
    oneStamenGroup.add(antherMesh);
    stamenGroup.add(oneStamenGroup);

    // stamenGroup.rotateX(Math.PI / 20); // 控制雄蕊开合程度（除得很大的时候会出现很多蕊。。）
    console.log("Before loop: ", stamenGroup.children.length);

    stamenCount = 12;
    for (let i = 0; i < stamenCount; i++) {
        const oneStamenGroupClone = oneStamenGroup.clone();
        //rotation.x是set to哪里, rotateX是基于当前rotate多少
        oneStamenGroupClone.rotation.x = -Math.PI / 4; // 旋转90度，使其处于水平状态
        oneStamenGroupClone.rotation.y = 0; // 旋转90度，使其处于水平状态
        oneStamenGroupClone.rotation.z = 0; // 旋转90度，使其处于水平状态
        oneStamenGroupClone.rotateZ((Math.PI * 2 / stamenCount * i)); // 控制雄蕊复制时以Z为旋转轴的旋转角度，即使上面已经旋转了，仍沿用初始状态时的坐标系
        oneStamenGroupClone.rotateX(Math.PI / 4); // 控制雄蕊开合程度（除得很大的时候会出现很多蕊。。）
        stamenGroup.add(oneStamenGroupClone);
    }

    console.log("Number of stamen groups:", stamenGroup.children.length);
    // Set the position and rotation of the stamen group
    stamenGroup.position.set(0, 1, 0); // move the stamen up from the flower
    stamenGroup.rotation.set(-Math.PI / 4, 0, 0); // rotate the stamen to face upwards; was 4

    stamenGroup.name = "stamens";
    console.log("stamenGroup:", stamenGroup);




    /* ADD AND ADJUST ALL COMPONENTS */
    petalGroup.scale.set(2, 2, 2);
    // pistilGroup.scale.set(0.5, 0.5, 0.5);
    scene.add(petalGroup);
    scene.add(sepalGroup);
    scene.add(stemMesh);
    scene.add(pistilGroup);
    scene.add(stamenGroup);

}
//////////////////////////////////////////////////////////////
const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function save(blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
function saveString(text, filename) {
    save(new Blob([text], { type: 'text/plain' }), filename);
}
function exportToObj() {
    const exporter = new OBJExporter();
    const result = exporter.parse(scene);
    saveString(result, 'object.obj');
}
//////////////////////////////////////////////////////////////

function onWindowResized() {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);

}

function animation(msTime) {

    const time = msTime / 1000;

    cubeCamera.update(renderer, scene);

    controls.update();

    renderer.render(scene, camera);
    // let rotx = parseFloat(document.getElementById("remote").innerHTML);
    // let rotx = Math.min(Math.max(rotx, 0), 1);
    let rotx = 0.6;

    if (!isNaN(rotx)) {
        for (const group of scene.children) {
            if (group.name != "petals") continue;
            if (group.name == "petals") {
                let i = 0;
                for (const petal of group.children) {
                    //rotation.x是set to哪里, rotateX是基于当前rotate多少
                    petal.rotation.set(-Math.PI / 2, 0, 0);
                    petal.rotateZ((Math.PI / 3) * i); // 控制花瓣复制时以Z为旋转轴的旋转角度，即使上面已经旋转了，仍沿用初始状态时的坐标系
                    petal.rotateX(Math.PI * (1 - rotx) / 2); // 控制花瓣开合程度，2花苞，20基本完全开放.对应accelerometer z=0垂直于地面，z=1平行于地面
                    petal.position.y = 0;
                    i++;
                }
            }
        }
        for (const group of scene.children) {
            if (group.name != "sepals") continue;
            if (group.name == "sepals") {
                let i = 0;
                for (const sepal of group.children) {
                    //rotation.x是set to哪里, rotateX是基于当前rotate多少
                    sepal.rotation.set(-Math.PI / 2, 0, 0);
                    sepal.rotateZ((Math.PI / 3) * i); // 控制花瓣复制时以Z为旋转轴的旋转角度，即使上面已经旋转了，仍沿用初始状态时的坐标系
                    sepal.rotateX(Math.PI * (1 - rotx) / 4); // 控制花瓣开合程度，2花苞，20基本完全开放.对应accelerometer z=0垂直于地面，z=1平行于地面
                    sepal.position.y = 0;
                    sepal.scale.set(0.75 + rotx / 4, 0.75 + rotx / 4, 0.75 + rotx / 4);
                    i++;
                }
            }
        }
        for (const group of scene.children) {
            if (group.name != "pistil") continue;
            if (group.name == "pistil") {
                // console.log(group);
                group.scale.set(0.5 + rotx / 2, 0.5 + rotx / 2, 0.5 + rotx / 2); //0->0.5, 1->1
            }
        }
        for (const group of scene.children) {
            if (group.name != "stamens") continue;
            if (group.name == "stamens") {
                let i = 0;
                for (const stamen of group.children) {
                    stamen.rotation.set(-Math.PI / 4, 0, 0);
                    stamen.rotateZ((Math.PI * 2 / stamenCount * i));
                    stamen.rotateX(Math.PI * (1.2 - rotx) / 2);
                    stamen.position.y = 0;
                    stamen.scale.set(0.8 + rotx / 5, 0.8 + rotx / 5, 0.8 + rotx / 5);
                    i++;
                }
            }
        }

    }
}

recordDef();
handpose();

/* 1. PETAL */
export function generatePetal(handShape = null) {
    var shape = new THREE.Shape(); 
    const curve1 = new THREE.CubicBezierCurve(new THREE.Vector2(0, 0), new THREE.Vector2(0, 0.5), new THREE.Vector2(-1, 1), new THREE.Vector2(-1, 2)); const curve2 = new THREE.CubicBezierCurve(new THREE.Vector2(-1, 2), new THREE.Vector2(-1, 3), new THREE.Vector2(-0.5, 4), new THREE.Vector2(0, 4)); const curve3 = new THREE.CubicBezierCurve(new THREE.Vector2(0, 4), new THREE.Vector2(0.5, 4), new THREE.Vector2(1, 3), new THREE.Vector2(1, 2)); const curve4 = new THREE.CubicBezierCurve(new THREE.Vector2(1, 2), new THREE.Vector2(1, 1), new THREE.Vector2(0, 0.5), new THREE.Vector2(0, 0)); shape.curves.push(curve1, curve2, curve3, curve4);

    // 创建一个3D mesh
    var geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.4,
        bevelEnabled: false,
    });

    if (handShape) {
        geometry = new THREE.ExtrudeGeometry(handShape, {
            depth: 0.4,
            bevelEnabled: false,
        });
    }

    // 创建纹理
    // var petalTexture = new THREE.TextureLoader().load('./asset/texture/fabric/Fabric_BaseColor.png');
    // var petalRoughness = new THREE.TextureLoader().load('./asset/texture/fabric/Fabric_Roughness.png');
    // var petalNormal = new THREE.TextureLoader().load('./asset/texture/fabric/Fabric_Normal.png');
    // petalTexture.wrapS = THREE.RepeatWrapping;
    // petalTexture.wrapT = THREE.RepeatWrapping;
    // petalTexture.repeat.set(10, 10);
    // petalRoughness.wrapS = THREE.RepeatWrapping;
    // petalRoughness.wrapT = THREE.RepeatWrapping;
    // petalRoughness.repeat.set(10, 10);

    // 创建材质
    var material = new THREE.MeshStandardMaterial({ color: "salmon", side: THREE.DoubleSide });

    // 创建花瓣mesh
    var petal = new THREE.Mesh(geometry, material);
    const petalGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
        const petalClone = petal.clone();
        petalClone.rotation.x = -Math.PI / 2;
        petalClone.rotateZ((Math.PI / 3) * i);
        petalClone.rotateX(Math.PI / 2);
        petalClone.position.y = 0;
        petalGroup.add(petalClone);
    }
    petalGroup.name = "petals";

    return petalGroup;
}

export function generateSepal() {
    /* 2. SEPAL */
    // Create a group to hold the sepal parts
    const sepalGroup = new THREE.Group();

    // Create the sepal
    const sepalShape = new THREE.Shape();
    // Define the curves
    const sepalCurve1 = new THREE.CubicBezierCurve(
        new THREE.Vector2(0, 0),
        new THREE.Vector2(-0.2, 1),
        new THREE.Vector2(-1, 2),
        new THREE.Vector2(-1.2, 4)
    );

    const sepalCurve2 = new THREE.CubicBezierCurve(
        new THREE.Vector2(-1.2, 4),
        new THREE.Vector2(-1, 5),
        new THREE.Vector2(0, 6),
        new THREE.Vector2(0.8, 5)
    );

    const sepalCurve3 = new THREE.CubicBezierCurve(
        new THREE.Vector2(0.8, 5),
        new THREE.Vector2(1, 4),
        new THREE.Vector2(0.5, 2),
        new THREE.Vector2(0, 0)
    );

    const sepalCurve4 = new THREE.CubicBezierCurve(
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.2, -1),
        new THREE.Vector2(1, -2),
        new THREE.Vector2(1.2, -4)
    );
    // Add the curves to the shape
    sepalShape.curves.push(sepalCurve1, sepalCurve2, sepalCurve3, sepalCurve4);

    const sepalGeometry = new THREE.ExtrudeGeometry(sepalShape, { depth: 0.8, bevelEnabled: false });
    const sepalMaterial = new THREE.MeshStandardMaterial({ color: "green" });
    const sepalMesh = new THREE.Mesh(sepalGeometry, sepalMaterial);

    for (let i = 0; i < 6; i++) {
        const sepalMeshClone = sepalMesh.clone();
        //rotation.x是set to哪里, rotateX是基于当前rotate多少
        sepalMeshClone.rotation.x = -Math.PI / 2; // 旋转90度，使其处于水平状态
        sepalMeshClone.rotateZ((Math.PI / 3) * i); // 控制花萼复制时以Z为旋转轴的旋转角度，即使上面已经旋转了，仍沿用初始状态时的坐标系
        sepalMeshClone.rotateY(-Math.PI / 5); //控制花萼开合程度，5适合花苞，20适合基本完全开放.对应accelerometer z=0垂直于地面，z=1平行于地面
        sepalMeshClone.position.y = 0;
        sepalGroup.add(sepalMeshClone);
    }

    sepalGroup.name = "sepals";
    sepalGroup.position.set(0, -0.3, 0);

    console.log("sepalGroup:", sepalGroup);
    return sepalGroup;
}

export function UpdatePetalGroup(newPetalGroup, newFuntionText = null) {
    petalGroup = newPetalGroup;
    if (newFuntionText) {
        petalFunctionText = newFuntionText;
    }

}

export function UpdateSepalGroup(newSepalGroup, newFuntionText = null) {
    sepalGroup = newSepalGroup;
    if (newFuntionText) {
        sepalFunctionText = newFuntionText;
    }
}

petalGroup = generatePetal();
sepalGroup = generateSepal();

prepare();
init(petalGroup, sepalGroup);

////////////////////

/* IoT! This part has been hidded! */
// on page load, call the setup function:
// document.addEventListener('DOMContentLoaded', setup());
// run a loop every 2 seconds:
// setInterval(loop(), 2000);

//////////////////
InitNavigation();
partSelction();