
export const partSelction = () => {
    const petalPart = document.getElementById('part-petal');
    const sepalPart = document.getElementById('part-sepal');
    const stemPart = document.getElementById('part-stem');
    const pistilPart = document.getElementById('part-pistil');
    const stamenPart = document.getElementById('part-stamen');

    petalPart.addEventListener('click', function onClick(event) {
        console.log("你好我是花瓣");
        document.getElementById("shape-title").innerHTML = "Petal Shape Adjustment";
        document.getElementById("position-title").innerHTML = "Petal Position Adjustment";
        document.getElementById("color-title").innerHTML = "Petal Color Adjustment";
    });
    sepalPart.addEventListener('click', function onClick(event) {
        console.log("你好我是花萼");
        document.getElementById("shape-title").innerHTML = "Sepal Shape Adjustment";
        document.getElementById("position-title").innerHTML = "Sepal Position Adjustment";
        document.getElementById("color-title").innerHTML = "Sepal Color Adjustment";
    });
    stemPart.addEventListener('click', function onClick(event) {
        console.log("你好我是花茎");
    });
    pistilPart.addEventListener('click', function onClick(event) {
        console.log("你好我是雌蕊");
    });
    stamenPart.addEventListener('click', function onClick(event) {
        console.log("你好我是花柱");
    });
}