/* eslint-disable prettier/prettier */
import {Application, Sprite, Texture, Text, Assets, EventMode, Cursor, Ticker} from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  function testAABB(blockA: Sprite, blockB: Sprite) {
    return (
        blockA.x < blockB.x + blockB.width &&
            blockA.x + blockA.width > blockB.x
    );
  }

  const ticker = new Ticker();
  let isPlaying = true;

  const massA = 5; // mass of the square (in kg)
  const massB = 3;

  const sideA = massA * 10 // Length of a square side, Assume it is equal to mass multiply by 10
  const sideB = massB * 10

  let velocityA = 7; // initial velocity of the square (in px/s)
  let velocityB = -10;

  let positionA = 0; // initial position on the x-axis
  let positionB = app.screen.width - sideB;

  function createBlock(x: number, side: number, tint: number): Sprite {
    const block = new Sprite(Texture.WHITE);
    block.position.set(x, (app.screen.height / 2));
    block.width = side;
    block.height = side;
    block.tint = tint;
    block.anchor.set(0, 1);

    return block;
  }

  function createText(text: number, unit: string, fill: number, positionX:number, positionY: number): Text {
    const pixiText = new Text({
      text: `${text} (${unit})`,
      style: {
        fontFamily: ['Helvetica', 'Arial', 'sans-serif'],
        fill: fill,
      }
    });
    pixiText.anchor.set(0.5, 0.5);
    pixiText.position.set(positionX, positionY);

    return pixiText;
  }

  function createButton(texture: Texture, size: number, positionX: number, positionY: number, eventMode: EventMode, cursor: Cursor): Sprite {
    const button = new Sprite(texture);
    button.anchor.set(0.5, 0.5);
    button.setSize(size);
    button.position.set(positionX, positionY);
    button.eventMode = eventMode;
    button.cursor = cursor;

    return button;
  }

  function updateAnimation(delta: number) {
    positionA += velocityA * delta;
    blockA.x = positionA;
    blockAVelocity.text = `${velocityA} m/s`;

    positionB += velocityB * delta;
    blockB.x = positionB;
    blockBVelocity.text = `${velocityB} m/s`;

    if(testAABB(blockA, blockB)) {
      const newVelocityA = ((massA - massB) * velocityA + 2 * massB * velocityB ) / (massA + massB);
      const newVelocityB = ((massB - massA) * velocityB + 2 * massA * velocityA ) / (massA + massB);

      velocityA = newVelocityA;
      velocityB = newVelocityB;

      blockAVelocity.text = `${velocityA} m/s`;
      blockBVelocity.text = `${velocityB} m/s`;
    }

    if(blockA.x > app.screen.width - blockA.width || blockA.x < 0) {
      velocityA = -velocityA;
      blockAVelocity.text = `${velocityA} m/s`;
    }

    if(blockB.x > app.screen.width - blockB.width || blockB.x < 0) {
      velocityB = -velocityB;
      blockBVelocity.text = `${velocityB} m/s`;
    }
  }

  function playAnimation() {
    isPlaying = true;

    ticker.start();

    playButton.visible = false;
    pauseButton.visible = true;
  }

  function pauseAnimation() {
    isPlaying = false;
    ticker.stop();

    playButton.visible = true;
    pauseButton.visible = false;
  }

  const blockA = createBlock(positionA, sideA, 0x00ff00);
  const blockB = createBlock(positionB, sideB, 0x0000ff);

  app.stage.addChild(blockA);
  app.stage.addChild(blockB);


  const blockAVelocity = createText(velocityA, "m/s", 0x00ff00, (app.screen.width  - blockA.width) / 2 - 100, 100);
  const blockBVelocity = createText(velocityB, "m/s", 0x0000ff, (app.screen.width  - blockA.width) / 2 + 100, 100);

  const blockAMass = createText(massA, "Kg", 0x00ff00, (app.screen.width  - blockA.width) / 2 - 100, 150);
  const blockBMass = createText(massB, "Kg", 0x0000ff, (app.screen.width  - blockA.width) / 2 + 100, 150);

  app.stage.addChild(blockAVelocity);
  app.stage.addChild(blockBVelocity);

  app.stage.addChild(blockAMass);
  app.stage.addChild(blockBMass);

  const playTexture = await Assets.load("assets/play-button.png");
  const pauseTexture = await Assets.load("assets/pause-button.png");

  const playButton = createButton(playTexture, 50, app.screen.width / 2, 500, "static", "pointer");
  playButton.visible = false;
  playButton.addListener("pointerdown", () => {
    playAnimation();
  });
  app.stage.addChild(playButton);

  const pauseButton = createButton(pauseTexture, 50, app.screen.width / 2, 500, "static", "pointer");
  pauseButton.visible = true
  pauseButton.addListener("pointerdown", () => {
    pauseAnimation();
  });
  app.stage.addChild(pauseButton);

  // Listen for animate update
  ticker.add((time) => {
    const delta = time.deltaTime;
    if (isPlaying) {
      updateAnimation(delta);
    }
  });
  ticker.start();
})();
