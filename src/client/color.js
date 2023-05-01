import { generatePetal, generateSepal, init, petalGroup, sepalGroup, UpdatePetalGroup, UpdateSepalGroup, petalFunctionText,sepalFunctionText } from "./client";


export const changePetalColor = (description) => {
    const hexColor = description.substring(description.indexOf("#"), description.indexOf("#")+7);

    var functionText = petalFunctionText === "" ? generatePetal.toString() : petalFunctionText.toString();
    console.log(functionText);
    // functionText = functionText.replaceAll("three__WEBPACK_IMPORTED_MODULE_4__", "THREE");
    functionText = functionText.replaceAll(/three__WEBPACK_IMPORTED_MODULE_[0-9]__/g, "THREE");
    console.log(functionText);
    functionText = functionText.replace(/.*THREE.MeshStandardMaterial\({.*color:.*THREE.DoubleSide.*}\);/g, 
    "var material = new THREE.MeshStandardMaterial({ color:\"" + hexColor + "\", side: THREE.DoubleSide});");
    console.log(functionText);

    functionText = new Function("handShape", functionText.substring(functionText.indexOf('{')+1, functionText.lastIndexOf('}')));
    const petalGroup = functionText("");

    UpdatePetalGroup(petalGroup, functionText);
    init(petalGroup, sepalGroup);
}

export const changeSepalColor = (description) => {
    const hexColor = description.substring(description.indexOf("#"), description.indexOf("#")+7);

    var functionText = generateSepal.toString();
    // functionText = functionText.replaceAll("three__WEBPACK_IMPORTED_MODULE_4__", "THREE");
    functionText = functionText.replaceAll(/three__WEBPACK_IMPORTED_MODULE_[0-9]__/g, "THREE");
    functionText = functionText.replace(/.*THREE.MeshStandardMaterial\({.*color:.*}\);/g, 
    "const sepalMaterial = new THREE.MeshStandardMaterial({ color:\"" + hexColor + "\"});");
    console.log(functionText);
    functionText = new Function(functionText.substring(functionText.indexOf('{')+1, functionText.lastIndexOf('}')));
    const sepalGroup = functionText("");

    UpdateSepalGroup(sepalGroup, functionText);
    init(petalGroup, sepalGroup);
}