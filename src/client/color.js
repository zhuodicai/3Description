import { generateSepal, generatePetal, init } from "./client";

export const changeSepalColor = (description) => {
    const hexColor = description.substring(description.indexOf("#"), description.indexOf("#")+7);

    var functionText = generateSepal.toString();
    functionText = functionText.replaceAll("three__WEBPACK_IMPORTED_MODULE_3__", "THREE");
    functionText = functionText.replace("const sepalMaterial = new THREE.MeshStandardMaterial({ color: \"green\" });", 
    "const sepalMaterial = new THREE.MeshStandardMaterial({ color:\"" + hexColor + "\"});");

    functionText = new Function(functionText.substring(functionText.indexOf('{')+1, functionText.lastIndexOf('}')));
    const sepalGroup = functionText();
    const petalGroup = generatePetal();

    init(petalGroup, sepalGroup);
}