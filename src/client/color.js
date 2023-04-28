import { generateSepal, generatePetal, init } from "./client";

export const changeSepalColor = (color) => {
    // console.log("wanna changed color: ", color);
    var functionText = generateSepal.toString();
    functionText = functionText.replaceAll("three__WEBPACK_IMPORTED_MODULE_3__", "THREE");
    functionText = functionText.replace("const sepalMaterial = new THREE.MeshStandardMaterial({ color: \"green\" });", 
    "const sepalMaterial = new THREE.MeshStandardMaterial({ color:\"" + color.toLowerCase() + "\"});");
    console.log(functionText);

    functionText = new Function(functionText.substring(functionText.indexOf('{')+1, functionText.lastIndexOf('}')));
    const sepalGroup = functionText();
    const petalGroup = generatePetal();

    init(petalGroup, sepalGroup);
}