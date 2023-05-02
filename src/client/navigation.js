import { handpose } from "./handpose";

export const InitNavigation = () => {
    ShapeNavigation();
    PositionNavigation();
    ColorNavigation();
}


const ShapeNavigation = () => {
    document.getElementById("pills-shape-tab").addEventListener("click", ShapeClicked);
}

const ShapeClicked = () => {
    // console.log("shape is clicked");
    removeAllActive();
    removeAllContent();
    document.getElementById("pills-shape-tab").classList.add("active");  
    document.getElementById("pills-shape").className = "tab-pane active p-3";
    handpose();
}

const PositionNavigation = () => {
    document.getElementById("pills-position-tab").addEventListener("click", PositionClicked);
}

const PositionClicked = () => {
    removeAllActive();
    removeAllContent();
    document.getElementById("pills-position-tab").classList.add("active");  
    document.getElementById("pills-position").className = "tab-pane active p-3";
    handpose();
}

const ColorNavigation = () => {
    document.getElementById("pills-color-tab").addEventListener("click", ColorClicked);
}

const ColorClicked = () => {
    removeAllActive();
    removeAllContent();
    document.getElementById("pills-color-tab").classList.add("active");  
    document.getElementById("pills-color").className = "tab-pane active p-3";
}

const removeAllActive = () => {
    const shapeButtonClassList = document.getElementById("pills-shape-tab").classList;
    const positionButtonClassList = document.getElementById("pills-position-tab").classList;
    const colorButtonClassList = document.getElementById("pills-color-tab").classList;
    if (shapeButtonClassList.contains("active")) {
        document.getElementById("pills-shape-tab").classList.remove("active");
    }
    if (positionButtonClassList.contains("active")) {
        document.getElementById("pills-position-tab").classList.remove("active");
    }
    if (colorButtonClassList.contains("active")) {
        document.getElementById("pills-color-tab").classList.remove("active");
    }
}

const removeAllContent = () => {
    const shapeClassList = document.getElementById("pills-shape").classList;
    const positionClassList = document.getElementById("pills-position").classList;
    const colorClassList = document.getElementById("pills-color").classList;
    if (shapeClassList.contains("active")) {
        document.getElementById("pills-shape").className = "tab-pane fade";
    }
    if (positionClassList.contains("active")) {
        document.getElementById("pills-position").className = "tab-pane fade";
    }
    if (colorClassList.contains("active")) {
        document.getElementById("pills-color").className = "tab-pane fade";
    }
}