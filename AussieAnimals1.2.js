let gridDim = { x: 28, y: 16 };

let screenScale = 1;

let canvasSize = { x: 1920 * screenScale, y: 1080 * screenScale }

let canvasCenter = { x: canvasSize.x / 2, y: canvasSize.y / 2 }

let gridPadding = 10;

//let c1, c2;

let backgroundImage;

let bing;

let gridSizeScaling = (canvasSize.y / 50 * gridPadding / gridDim.y);

let gridSize = canvasSize.y / (gridDim.y) - gridSizeScaling;

console.log(gridSize);

const offset = {
    x: canvasCenter.x - (gridDim.x - (gridDim.x / 2)) * gridSize,
    y: canvasCenter.y - (gridDim.y - (gridDim.y / 2)) * gridSize,
}

function preload() {
    bing = loadSound('AussieAnimalAnthem.mp3');
}

let availableParts = [
    {
        image: null,
        rotateable: true,
        size: { x: 2, y: 1 }
    },
    {
        image: null,
        rotateable: true,
        size: { x: 3, y: 1 }
    },
    {
        image: null,
        rotateable: true,
        size: { x: 4, y: 1 }
    },
    {
        image: null,
        rotateable: true,
        size: { x: 6, y: 1 }
    },
    {
        image: null,
        rotateable: true,
        size: { x: 2, y: 2 }
    },
    {
        image: null,
        rotateable: true,
        size: { x: 4, y: 2 }
    }
]

function setup() {
    createCanvas(canvasSize.x, canvasSize.y);
    //    c1 = color("#ccffff");
    //    c2 = color("#00b3b3");
    backgroundImage = loadImage("background.jpg");
    availableParts[0].image = loadImage ("availableParts/b1.jpg");
    availableParts[1].image = loadImage ("availableParts/b2.jpg");
    availableParts[2].image = loadImage ("availableParts/b3.jpg");
    availableParts[3].image = loadImage ("availableParts/b4.jpg");
    availableParts[4].image = loadImage ("availableParts/b5.jpg");
    availableParts[5].image = loadImage ("availableParts/b6.jpg");
}

let screenState = [];

for (let x = 0; x < gridDim.x; x++) {
    let arr = [];
    for (let y = 0; y < gridDim.y; y++) {
        arr.push({

        });
    }
    screenState.push(arr);
}

let currentPart = null;

let placedParts = [];

let currentMode = "placing";

let isPlayingSound = false;
function draw() {
    if (isPlayingSound == false) {
        bing.loop();
        isPlayingSound = true;
    }
    background(backgroundImage);

    // for(let y=0; y<height; y++){
    //     n = map(y,0,height,0,1);
    //     let newc = lerpColor(c1,c2,n);
    //     stroke(newc);
    //     line(0,y,width, y);
    // }

    if (currentMode == "placing") {
        drawPlacing();
    } else {
        drawPlaying();
    }
}

const drag = 0.95;

document.onkeydown = function (e) {
    if((e.key == "" || e.key == "a" || e.key == "s" || e.key == "d") && e.ctrlKey) {
        return false;
    }
}

let holdingJump = false;
let jumpCount = 0;
let isCrouched = false;
const jumpMax = 2;
let character = {
    pos: { x: 50, y: 50 },
    size: { x: gridSize, y: gridSize * 2 },
    vel: { x: 0, y: 0 },
    jumpHeight: 22.5,
    speed: 0.5,
    update: function () {
        if (keyIsDown(68)) {
            this.vel.x = this.vel.x + this.speed;
        }
        if (keyIsDown(65)) {
            this.vel.x = this.vel.x - this.speed;
        }
        if (keyIsDown(82)) {
            this.pos.x = 50;
            this.pos.y = 50;
        }

        
        if (keyIsDown(17) || keyIsDown(83)) {
            this.size.y = gridSize;
            if(isCrouched == false) {
                this.pos.y += gridSize;
                isCrouched = true;
            }
        } else {
            this.size.y = gridSize * 2;
            if(isCrouched) {
            this.pos.y -= gridSize;
            isCrouched = false;
            }
        }

        this.vel.y += 0.9;

        this.vel.x *= drag;
        this.vel.y *= drag;

        //left building
        this.checkCollision(0, canvasSize.y / 2, canvasSize.x / 10, canvasSize.y / 2);

        //left side
        this.checkCollision(-10, 0, 10, canvasSize.y / 2);
        
        //right building
        this.checkCollision(canvasSize.x - canvasSize.x / 10, canvasSize.y / 3, canvasSize.x / 10, canvasSize.y / 3 * 2);

        //right side
        this.checkCollision(canvasSize.x, 0, 10, canvasSize.y / 3);

        for (let i = 0; i < placedParts.length; i++) {
            const part = placedParts[i];

            let partDesc = {
                x: offset.x + (part.x * gridSize),
                y: offset.y + (part.y * gridSize),
                sx: part.size.x * gridSize,
                sy: part.size.y * gridSize
            }

            this.checkCollision(partDesc.x, partDesc.y, partDesc.sx, partDesc.sy);
        }

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    },
    checkCollision: function (x, y, width, height) {
        const pixelMargin = 0;

        inYBounds = this.pos.y + this.size.y + pixelMargin > y && this.pos.y - pixelMargin < y + height;
        inXBounds = this.pos.x + this.size.x + pixelMargin > x && this.pos.x - pixelMargin < x + width;

        const topDist = Math.abs(this.pos.y - (y + height));
        const rightDist = Math.abs((this.pos.x + this.size.x) - x);
        const bottomDist = Math.abs((this.pos.y + this.size.y) - y);
        const leftDist = Math.abs(this.pos.x - (x + width));

        if (inYBounds && inXBounds) {
            const scale = 0.1;

            push();
            stroke(255, 0, 0);
            if (topDist < rightDist && topDist < bottomDist && topDist < leftDist) {
                if (topDist > pixelMargin / 2) {
                    this.pos.y += topDist;
                }

                this.vel.y = 0//Math.abs(this.vel.y * scale);
                console.log("top");
            }
            else if (rightDist < bottomDist && rightDist < leftDist) {
                if (rightDist > pixelMargin / 2) {
                    this.pos.x -= rightDist;
                    if (keyIsDown(68)) {
                        this.vel.y *= 0.5;
                    }
                }

                this.vel.x = 0//-Math.abs(this.vel.x * scale);
                console.log("right");
            } else if (bottomDist < leftDist) {
                if (bottomDist > pixelMargin / 2) {
                    this.pos.y -= bottomDist;
                }

                this.vel.y = 0//-Math.abs(this.vel.y * scale);
                console.log("bottom: " + bottomDist);
                jumpCount = 0;
            } else {
                if (leftDist > pixelMargin / 2) {
                    this.pos.x += leftDist;
                    if (keyIsDown(65)) {
                        this.vel.y *= 0.5;
                    }
                }

                this.vel.x = 0//Math.abs(this.vel.x * scale);
                console.log("left");
            }

            const jumpAngleMult = 0.8;
            const jumpOffset = 3;
            if (keyIsDown(32)) {
                if (holdingJump == false && bottomDist < pixelMargin + jumpOffset && inYBounds && inXBounds && jumpCount < jumpMax) {
                    this.vel.y -= this.jumpHeight;
                    holdingJump = true;
                    jumpCount++;
                } else if (holdingJump == false && leftDist < pixelMargin + jumpOffset && inYBounds && inXBounds && jumpCount < jumpMax) {
                    this.vel.y -= this.jumpHeight * jumpAngleMult;
                    this.vel.x += this.jumpHeight * jumpAngleMult;
                    holdingJump = true;
                    jumpCount++;
                } else if (holdingJump == false && rightDist < pixelMargin + jumpOffset && inYBounds && inXBounds && jumpCount < jumpMax) {
                    this.vel.y -= this.jumpHeight * jumpAngleMult;
                    this.vel.x -= this.jumpHeight * jumpAngleMult;
                    holdingJump = true;
                    jumpCount++;
                }
            } else {
                holdingJump = false;
            }


            pop();
        }
    }
};

function drawPlaying() {
    push();
    fill("#2e2b8a")
    //left building
    rect(0, canvasSize.y / 2, canvasSize.x / 10, canvasSize.y / 2);

    //right building
    rect(canvasSize.x - canvasSize.x / 10, canvasSize.y / 3, canvasSize.x / 10, canvasSize.y / 3 * 2);

    pop();

    for (let i = 0; i < placedParts.length; i++) {
        push();
        let part = placedParts[i];



        let partDesc = {
            x: offset.x + (part.x * gridSize),
            y: offset.y + (part.y * gridSize),
            sx: part.size.x * gridSize,
            sy: part.size.y * gridSize
        }

        image(part.image, partDesc.x, partDesc.y, partDesc.sx, partDesc.sy);
        pop();
    }

    if (currentMode == "playing") {
        character.update();

        push();
        fill("#424242");
        rect(character.pos.x, character.pos.y, character.size.x, character.size.y);
        pop();
    }
}

let placingState = "picking";
let selectedPart = null;

let mouseNotPressedPreviously = true;

let partsToPlace = 6;

function drawPlacing() {

    drawPlaying();
    if (placingState == "picking") {
        background(0, 0, 0, 100);
        let partWidth = 0;
        for (let i = 0; i < availableParts.length; i++) {
            let part = availableParts[i];

            partWidth += part.size.x;
        }

        partWidth += availableParts.length;

        let prevX = 0;
        for (let i = 0; i < availableParts.length; i++) {
            push();
            let part = availableParts[i];
            
            let gridx = prevX;
            let gridy = 0;

            let partDesc = {
                x: canvasCenter.x + ((gridx - partWidth / 2) * gridSize),
                y: canvasCenter.y + (gridy * gridSize),
                sx: part.size.x * gridSize,
                sy: part.size.y * gridSize
            }

            prevX += part.size.x + 1;

            if (mouseX < partDesc.x + partDesc.sx && mouseX > partDesc.x &&
                mouseY < partDesc.y + partDesc.sy && mouseY > partDesc.y) {
                //strokeWeight(5);
                //stroke(255, 0, 0);
                if (mouseIsPressed) {
                    selectedPart = part;
                    placingState = "placing";
                    mouseNotPressedPreviously = false;
                }
            }

            image(part.image, partDesc.x, partDesc.y, partDesc.sx, partDesc.sy);
            pop();
        }
    } else {

        stroke(97, 97, 97, 125);
        fill(0, 0, 0, 0);

        let mouseOverSquare = null;

        for (let x = 0; x < gridDim.x; x++) {
            for (let y = 0; y < gridDim.y; y++) {
                const gridX = offset.x + x * gridSize;
                const gridY = offset.y + y * gridSize;

                push();

                if (mouseX < gridX + gridSize && mouseX > gridX &&
                    mouseY < gridY + gridSize && mouseY > gridY &&
                    x + selectedPart.size.x <= gridDim.x && y + selectedPart.size.y <= gridDim.y) {
                    mouseOverSquare = { x: x, y: y, gridX: gridX, gridY: gridY };

                    if (mouseIsPressed) {
                        if (mouseNotPressedPreviously) {
                            let pp = Object.assign({}, selectedPart)
                            pp.x = x;
                            pp.y = y;

                            placedParts.push(pp);

                            if (placedParts.length >= partsToPlace) {
                                currentMode = "playing";
                            } else {
                                placingState = "picking";
                            }

                            mouseNotPressedPreviously = false;
                        }
                    } else {
                        mouseNotPressedPreviously = true;
                    }
                }

                rect(
                    gridX,
                    gridY,
                    gridSize
                )

                pop();
            }
        }

        push();

        if (mouseOverSquare) {
            image(selectedPart.image, mouseOverSquare.gridX, mouseOverSquare.gridY, gridSize * selectedPart.size.x, gridSize * selectedPart.size.y);
        }

        pop();
    }

}

function keyPressed() {
    console.log(keyCode);
}