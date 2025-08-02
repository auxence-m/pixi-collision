/* eslint-disable prettier/prettier */
import {Application, Sprite, Texture, Text, Assets, EventMode, Cursor, Ticker, Container} from "pixi.js";
import GUI from 'lil-gui';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // GUI Controls
  const gui = new GUI();
  const controls = {
    mass_A: 5,
    mass_B: 10,
    velocity_A: 15,
    velocity_B: 10,
    apply: function () {
      resetParams()
    },
    reset: function () {
      gui.reset();
    }
  };

  gui.add(controls, "mass_A")
      .name("mass A (Kg)")
      .onChange((mass: number) => {
    initialMassA = mass;
  });
  gui.add(controls, "mass_B")
      .name("mass B (Kg)")
      .onChange((mass: number) => {
        initialMassB = mass;
  });
  gui.add(controls, "velocity_A")
      .name("velocity A (m/s)").
  onChange((velocity: number) => {
        initialVelocityA = velocity;
  });
  gui.add(controls, "velocity_B")
      .name("velocity B A(m/s)")
      .onChange((velocity: number) => {
    initialVelocityB = velocity;
  });
  gui.add(controls, "apply");
  gui.add(controls, "reset");

  // Ticker for animation
  const ticker = new Ticker();
  let isPlaying = true;

  // Initial parameters.
  let initialMassA = controls.mass_A;
  let initialMassB = controls.mass_B;

  let massA = initialMassA; // mass of a square (in kg)
  let massB = initialMassB;

  let sideA = massA * 10 // Length of a square side, Assume it is equal to mass multiply by 10
  let sideB = massB * 10

  let initialVelocityA = controls.velocity_A;
  let initialVelocityB = controls.velocity_B;

  let velocityA = initialVelocityA; // initial velocity of a square (in px/s)
  let velocityB = -initialVelocityB;

  const initialPositionA = 0;
  const initialPositionB = app.screen.width - sideB;

  let positionA = initialPositionA; // initial position on the x-axis
  let positionB = initialPositionB;


  // Simple AABB collision text on the x-axis only
  function testAABB(blockA: Sprite, blockB: Sprite) {
    return (
        blockA.x < blockB.x + blockB.width &&
        blockA.x + blockA.width > blockB.x
    );
  }

  // Function to reset the blocks speed and position
  function resetParams() {
    positionA = initialPositionA;
    positionB = initialPositionB;

    massA = initialMassA;
    massB = initialMassB;

    sideA = massA * 10
    sideB = massB * 10

    velocityA = initialVelocityA;
    velocityB = initialVelocityB;

    container.removeChild(blockA, blockB);

    blockA = createBlock(positionA, sideA, 0x00ff00);
    blockB = createBlock(positionB, sideB, 0x0000ff);
    container.addChild(blockA, blockB);

    blockAMass.text = `${massA} (Kg)`;
    blockBMass.text = `${massB} (Kg)`;
  }

  // Function to create a block
  function createBlock(x: number, side: number, tint: number): Sprite {
    const block = new Sprite(Texture.WHITE);
    block.position.set(x, (app.screen.height / 2));
    block.width = side;
    block.height = side;
    block.tint = tint;
    block.anchor.set(0, 1);

    return block;
  }

  // Function to create a PIXI text
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

  // Function to create a Button
  function createButton(texture: Texture, size: number, positionX: number, positionY: number, eventMode: EventMode, cursor: Cursor): Sprite {
    const button = new Sprite(texture);
    button.anchor.set(0.5, 0.5);
    button.setSize(size);
    button.position.set(positionX, positionY);
    button.eventMode = eventMode;
    button.cursor = cursor;

    return button;
  }

  // Function to update to blocks position every frame
  function updateAnimation(delta: number) {
    // Distance = velocity * deltaTime
    positionA += velocityA * delta;
    blockA.x = positionA;
    blockAVelocity.text = `${Math.abs(velocityA).toFixed(3)} m/s`;

    positionB += velocityB * delta;
    blockB.x = positionB;
    blockBVelocity.text = `${Math.abs(velocityB).toFixed(3)} m/s`;

    if(testAABB(blockA, blockB)) {
      // Formula for the velocity of two objects after they collide with each other
      const newVelocityA = ((massA - massB) * velocityA + 2 * massB * velocityB ) / (massA + massB);
      const newVelocityB = ((massB - massA) * velocityB + 2 * massA * velocityA ) / (massA + massB);

      velocityA = newVelocityA;
      velocityB = newVelocityB;

      blockAVelocity.text = `${Math.abs(velocityA).toFixed(3)} m/s`;
      blockBVelocity.text = `${Math.abs(velocityB).toFixed(3)} m/s`;
    }

    // Wall collision detection
    if(blockA.x > app.screen.width - blockA.width || blockA.x < 0) {
      velocityA = -velocityA;
      blockAVelocity.text = `${Math.abs(velocityA).toFixed(3)} m/s`;
    }

    if(blockB.x > app.screen.width - blockB.width || blockB.x < 0) {
      velocityB = -velocityB;
      blockBVelocity.text = `${Math.abs(velocityB).toFixed(3)} m/s`;
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

  function recenter() {
    blockAVelocity.position.set((app.screen.width  - blockA.width) / 2 - 100, 100);
    blockBVelocity.position.set((app.screen.width  - blockA.width) / 2 + 100, 100);

    blockAMass.position.set((app.screen.width  - blockA.width) / 2 - 100, 150);
    blockBMass.position.set((app.screen.width  - blockA.width) / 2 + 100, 150);

    playButton.position.set(app.screen.width / 2, 500);
    pauseButton.position.set(app.screen.width / 2, 500);
  }

  const container = new Container();
  container.setSize(app.canvas.width, app.canvas.height);
  app.stage.addChild(container);

  let  blockA = createBlock(positionA, sideA, 0x00ff00);
  let  blockB = createBlock(positionB, sideB, 0x0000ff);

  container.addChild(blockA);
  container.addChild(blockB);


  const blockAVelocity = createText(velocityA, "m/s", 0x00ff00, (app.screen.width  - blockA.width) / 2 - 100, 100);
  const blockBVelocity = createText(velocityB, "m/s", 0x0000ff, (app.screen.width  - blockA.width) / 2 + 100, 100);

  const blockAMass = createText(massA, "Kg", 0x00ff00, (app.screen.width  - blockA.width) / 2 - 100, 150);
  const blockBMass = createText(massB, "Kg", 0x0000ff, (app.screen.width  - blockA.width) / 2 + 100, 150);

  container.addChild(blockAVelocity);
  container.addChild(blockBVelocity);

  container.addChild(blockAMass);
  container.addChild(blockBMass);

  const playTexture = await Assets.load("assets/play-button.png");
  const pauseTexture = await Assets.load("assets/pause-button.png");

  const playButton = createButton(playTexture, 50, app.screen.width / 2, 500, "static", "pointer");
  playButton.visible = false;
  playButton.addListener("pointerdown", () => {
    playAnimation();
  });
  container.addChild(playButton);

  const pauseButton = createButton(pauseTexture, 50, app.screen.width / 2, 500, "static", "pointer");
  pauseButton.visible = true
  pauseButton.addListener("pointerdown", () => {
    pauseAnimation();
  });
  container.addChild(pauseButton);

  // Listen for animate update
  ticker.add((ticker) => {
    const delta = ticker.deltaTime;
    if (isPlaying) {
      updateAnimation(delta);
    }
    recenter();
  });
  ticker.start();
})();
