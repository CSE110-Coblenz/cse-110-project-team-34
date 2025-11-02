import Konva from 'konva';

// Create the stage of 1280 x 960 pixels
const stage = new Konva.Stage({
  container: 'container',
  width: 1280,
  height: 960,
});

// Create a layer
const layer = new Konva.Layer();
stage.add(layer);

// Function to load and draw an image
function loadImage(url: string, x: number, y: number, width?: number, height?: number) {
  const imageObj = new Image();
  imageObj.onload = () => {
    const konvaImage = new Konva.Image({
      x,
      y,
      image: imageObj,
      width: width || imageObj.width,
      height: height || imageObj.height,
    });

    layer.add(konvaImage);
    layer.draw();
  };
  imageObj.src = url;
}

// Function to draw states with correct size and offset
function drawState(state: string) {
  const url = './imgs/states/' + state + '.png';
  loadImage(url, 240, 180, 800, 600);
}

/// TEST RUN

loadImage('./imgs/page.png', 0, 0, 1280, 960); //load background
drawState('US bw'); //load blank map

// draw states
drawState('AK');
drawState('DE');
drawState('HI');
drawState('MD');
drawState('NC');
drawState('NJ');
drawState('PA');
drawState('VA');
drawState('WV');

