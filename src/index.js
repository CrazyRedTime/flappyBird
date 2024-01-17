import Phaser, { GetLast } from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      // gravity: {
      //   y: 200,
      // }
      debug: true,
    }
  },
  scene: {
    preload,
    create,
    update,
  },  
};

// игровые объекты
let bird = null;
let pipes = null;

// клавиши
let spaceBar = null;

// константы
const birdGravity = 1200;
const birdFlap = -400;
// const pipesXStep = 300;
const pipesYStep = 30;
const pipesCount = 4;
const pipesVelocity = -200;
const initialUpperPipeXPosition = 300;

const pipesXDistanceRange = {
  min: 240,
  max: 320,
};

const pipesYDistanceRange = {
  min: 90,
  max: 160,
};

const upperPipeYPositionRange = {
  min: pipesYStep,
};

const initialBirdPosition = {
  x: config.width / 10,
  y: config.height / 2,
}

function preload () {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('bird', 'assets/bird.png');
  this.load.image('pipe', 'assets/pipe.png');
};

function create () {
  // расстановка фона
  this.add.image(0, 0, 'sky').setOrigin(0);

  // расстановка объектов
  bird = this.physics.add.sprite(initialBirdPosition.x, initialBirdPosition.y, 'bird').setOrigin(0);
  pipes = this.physics.add.group();
  for (let i = 0; i < pipesCount; i++) {
    const lastPipeXPosition = pipes.getLast(true)?.x || initialUpperPipeXPosition;
    const upperPipe = pipes.create(0, 0, 'pipe').setOrigin(0, 1);
    const lowerPipe = pipes.create(0, 0, 'pipe').setOrigin(0, 0);
    placePipe(upperPipe, lowerPipe, lastPipeXPosition);
  }

  // гравитация объекта игрока
  bird.body.gravity.y = birdGravity;

  // скорость перемещения труб
  pipes.setVelocityX(pipesVelocity);

  // обработчики событий
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  this.input.on('pointerdown', flap);
  spaceBar.on('down', flap);
};

function update (time, delta) {
  if(bird.y > config.height || bird.y < -bird.height) {
    restartPlayerPosition();
  };
  recyclePipes();
};

function flap () {
  bird.body.velocity.y = birdFlap;
};

function restartPlayerPosition() {
  bird.x = initialBirdPosition.x;
  bird.y = initialBirdPosition.y - bird.height;
  bird.body.velocity.y = 0;
};

function placePipe(upperPipe, lowerPipe, lastPipeXPosition) {
  const pipeXDistance = Phaser.Math.Between(
    pipesXDistanceRange.min,
    pipesXDistanceRange.max,
  )
  const pipesYDistance = Phaser.Math.Between(
    pipesYDistanceRange.min,
    pipesYDistanceRange.max,
  );
  const upperPipeYPosition = Phaser.Math.Between(
    upperPipeYPositionRange.min,
    config.height - pipesYStep - pipesYDistance,
  );
  upperPipe.x = pipeXDistance + lastPipeXPosition;
  upperPipe.y = upperPipeYPosition;
  lowerPipe.x = upperPipe.x;
  lowerPipe.y = upperPipe.y + pipesYDistance;
};

// function recyclePipes () {
//   const garbagePipes = pipes.getChildren().filter((pipe) => {
//     return pipe.getBounds().right <= 0;
//   });
//   if (garbagePipes.length === 2) {
//     const [upperPipe, lowerPipe] = garbagePipes;
//     let lastPipeXPosition = 0;
//     pipes.getChildren().forEach((pipe) => {
//       lastPipeXPosition = Math.max(pipe.x, lastPipeXPosition);
//     });
//     placePipe(upperPipe, lowerPipe, lastPipeXPosition);
//   }
// }

function recyclePipes () {
  const firstPipe = pipes.getFirst(true);
  if (firstPipe.getBounds().right <= 0) {
    const secondPipe = pipes.getFirstNth(2, true);
    const lastPipeXPosition = pipes.getLast(true).x;
    pipes.remove(firstPipe);
    pipes.remove(secondPipe);
    placePipe(firstPipe, secondPipe, lastPipeXPosition);
    pipes.add(firstPipe);
    pipes.add(secondPipe);
    pipes.setVelocityX(pipesVelocity);
  }
}

new Phaser.Game(config);