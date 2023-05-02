import { scene } from "./client";

export const updatePetalPosition = (rotx) => {
    // petal position
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
    // sepal position
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
}