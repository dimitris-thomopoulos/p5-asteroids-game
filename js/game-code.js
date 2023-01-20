
		class Dragon
		{
			/*
				Use to represent the dragon objects
			*/
			constructor()
			{
				this.x;
				this.dragonSpeed;
				this.y;
				
				this.exploded = false;
				
				this.minSpeed = 6;
				this.maxSpeed = 12;
				
				this.image = dragonImage;
				this.explosionImage = loadImage("game-assets/blood-splatter.png");
				this.load();
			}
			
			load()
			{
				/*
					Dragons are re-used
					When an dragon falls of the screen (see if in display()) load() is called
				*/
				this.x = Math.floor(Math.random() * 1100); // random X position
				this.dragonSpeed = Math.floor(Math.random() * (this.maxSpeed - this.minSpeed + 1) + this.minSpeed); // random speed between min and max speed
				this.y = -100;
				
				this.image = dragonImage;
				this.exploded = false;
			}
			
			display() 
			{
				image(this.image, this.x, this.y+= this.dragonSpeed); // each time a dragon is displayed its position is updated (dragons fall [y is increased])
				if (this.y > 591) // dragon is dissappeared and load() is called to load again the dragon 
				{
					this.load();
					return true;
				}
			}
			
			explode()
			{
				if (!this.exploded) // each dragon can explode only once
				{
					this.exploded = true;		
					this.explosionSoundPD();
					return true; // if explode returns true player loses a life

				}
			}
			
			kill()
			{
				if (!this.exploded) // each dragon can be killed only once
				{
					this.exploded = true;
					this.x += 25;
					this.image = this.explosionImage; // change the dragon image with explosion
					this.killSoundPD();
					return true; 
				}
			}
			
			explosionSoundPD()
			{
				Pd.send('damage', []);
			}
			
			killSoundPD()
			{
				Pd.send('kill', []);
			}
		}
		
		class ShurikenPack
		{
			//shurikenPacks = [];

			loadSound = "";
			
			constructor()
			{
				this.x = 0;
				this.y = 0;
				this.image = loadImage("game-assets/shuriken-pack-2.png");
			}
			
			newShurikenPack(score)
			{
				if (score > 0 && this.y == 0) // y == 0 means that there is no other pack in the screen
				{
					let xR = Math.floor(Math.random() * 100);
					if ( xR == 1 )
					{
						console.log('Create a shuriken pack');
						this.x = Math.floor(Math.random() * 1100); // random X position
						this.y = 0;
						image(this.image, this.x, this.y++);
					}
				}
			}
			
			display()
			{
				if (this.y > 0) // when a shurikenPack is created this.y is increased - so if a shurikenPack exists then it will be displayed
				{
					image(this.image, this.x, this.y+= 5);
					if (this.y > 591) // pack is lost
					{
						this.y = 0;
					}
				}
			}
			
			checkForCollection(samurai) // if a shurikenpack collides with the samurai is collected
			{
				// taken by dragon.checkForDamage() -- not very precise yet 
				if (Math.abs(this.x - samurai.x) < 80 && this.y >= 380 && this.y <= 590)
				{
					samurai.addShurikens(3);
					this.y = 0; // shurikenpack is taken - new shurikenPack may be created
					//console.log('Shuriken pack is collected!');
		 
					Pd.send('collect', []);
				}
				
			}
		}
		
		class Shuriken
		{
			x = 0;
			y = 0;
			exploded = false;
			
			constructor()
			{
				this.y = 420;
				this.image = shurikenImage;
			}
			
			fire(samurai)
			{
				this.x = samurai.x+25;
			}
			
			display() 
			{
				if (this.exploded)
					return false;
				
				image(this.image, this.x, this.y-=10); // shurikens move forward (y is decreased)
				if (this.y < 0) // shuriken is dissappeared 
				{
					return false; 
				}
				return true;
			}
			
			explode()
			{
				this.exploded = true;
			}
		}
		
		class DragonSwarm
		{
			/*
				This class handles the dragon objects
			*/
			constructor()
			{
				this.increaseDifficulty = 0; // as difficulty is increased more dragons will be coming
				this.dragons = []; // keeps the Dragon instances
				this.dragonsPassed = 0; // it is also used for score
				this.dragonsKilled = 0; // keeps dragon kills, also used for score
			}
			
			reset()
			{
				this.dragons.length = 0;
				this.dragonsPassed = 0;
				this.dragonsKilled = 0;
				this.increaseDifficulty = 0;
			}
			
			addNewDragons(howMany)
			{
				for (let i = 0; i < howMany; i++)
				{
					let dragon = new Dragon();
					this.dragons.push(dragon);
				}
			}
			
			handleDragons()
			{
				for (let i = 0; i < this.dragons.length; i++)
				{
					if (this.dragons[i].display()) // display() returns true if an dragon falls of the canvas
					{
						this.dragonsPassed++; // and the dragon's passage is completed
					}
				}
				this.handleDifficulty();
			}
			
			handleDifficulty()
			{
				// add dragons as difficulty increases
				if (this.dragons.length < (this.dragonsPassed/20))
					this.addNewDragons(1);
			}
			
			checkForDamage(samurai)
			{
				// not very precise yet
				for (let i = 0; i < this.dragons.length; i++)
				{
					if (Math.abs((this.dragons[i].x + 50) - samurai.x) < 80 && this.dragons[i].y >= 380 && this.dragons[i].y <= 500)
					{
						//samurai.damageSound.play();
						return this.dragons[i].explode();
					}
				}
			}

			checkForDetonation(shurikens)
			{
				// not very precise yet 
				for (let i = 0; i < this.dragons.length; i++)
				{
					for (let z = 0; z < shurikens.length; z++)
					{
						if (Math.abs((this.dragons[i].x + 50) - shurikens[z].x) < 120  && Math.abs(this.dragons[i].y - shurikens[z].y) < 20 )
						{
							shurikens[z].explode();
							this.dragonsPassed += 5;
							return this.dragons[i].kill();
						}
					}
				}
			}	
		}

 		class Samurai
		{
			x = 640; // X position
			y = 462; // Y position
			
			shurikens = 0;
			
			constructor()
			{
				this.image = loadImage("game-assets/samurai.png");
			}
			
			display()
			{	
				image(this.image, this.x, this.y);
			}
			
			move(move)
			{
				if (this.x > 0 && move < 0) // check that will not get out of the left barrier
				{
					this.x += (move*10);
				}

				if (this.x < 1180 && move > 0) // check that will not get out of the right barrier
				{
					this.x += (move*10);
				}
			}
			
			startMusicSound()
			{
				console.log("Start sound.");
				Pd.send('blip',[]);
			}
			
			stopMusicSound()
			{
			}
			
			addShurikens(howMany)
			{
				this.shurikens+= howMany;
			}
			
			fireShuriken()
			{
				if (this.shurikens > 0)
				{
					let shuriken = new Shuriken();
					shuriken.fire(this);
					this.throwSoundPD();
					this.shurikens--;
					return shuriken;
				}
			}

			throwSoundPD()
			{
				Pd.send('throw', []);
			}
		}
		
		class SamuraiLives
		{	
			/*
				Show how many lives are left
			*/
			constructor()
			{
				this.lives = [];
				this.livesLeft = 3; // initial number of lives
				
				for (let i = 0; i < this.livesLeft; i++)
				{
					let live = loadImage("game-assets/heart.png");
					this.lives[i] = live;
				}
			}
			
			display()
			{
				this.showLives(this.livesLeft);
			}
			
			showLives(livesLeft)
			{
				for (let i = 0; i < livesLeft; i++)
				{
					image(this.lives[i], (i*80+10), 20); // defining the position of displayed objects
				}
			}
			
			reduceOneLive()
			{
				this.livesLeft--;
			}
			
			reset()
			{
				this.livesLeft = 3;
			}
		}
		
		/*
			Global variables to be used by our game
		*/
		let samuraiLives; // object of class SamuraiLives
		let background; // background-image
		let samurai; // object of class Samurai
		let dragonImage; // load the image once
		let dragonSwarm; // object of class DragonSwarm
		let startGame = false;
		let startOnce = true;
		let gameOver = false;
		let paused = false;


		let shurikenImage;
		let shurikens = [];
		let shurikenPack;
		
		let gameSounds; // will load the pure data patch
		
		/*
			P5 functions preload(), setup(), draw() and keyPressed() are used
		*/
		function preload() 
		{
			background = loadImage("game-assets/japan-bg.jpg");		// load the background-image
			dragonImage = loadImage("game-assets/dragon.png"); // load once and the pass to Dragon so that will not load each time an Dragon is created
			samurai = new Samurai();
			
			shurikenImage = loadImage("game-assets/shuriken.png");
			shurikenPack = new ShurikenPack();
			
			gameSounds 
			$.get('game-assets/pure-data-patches/game-patch-2.pd', function(patchStr) {
				  gameSounds = Pd.loadPatch(patchStr);
				})
		}
		
		function setup() 
		{
			samuraiLives = new SamuraiLives();
			createCanvas(1280, 591); // canvas size tied to the background-image
			dragonSwarm = new DragonSwarm(); // it is going to handle the dragons
			
			setupTouchScreenControls();
		}
		
		function draw() 
		{
			/*
				Checking game state, drawing our game's frames, getting input
			*/
			
			image(background, 0, 0);
			samurai.display();
			samuraiLives.display();
						
			showMessages(); // displays messages (if needed) depending on the game state
			
			drawTouchScreenControls();
			
			if (startGame && !gameOver && startOnce) // begin a new game
			{
				Pd.start();
				dragonSwarm.reset();
				dragonSwarm.addNewDragons(2);
				samurai.startMusicSound();
				samuraiLives.reset();
				startOnce = false;
			}
			
			if (gameOver) // game over
			{
				samurai.stopMusicSound();
				Pd.stop(); // put in comments if you enable audio with confirm on page load
				samurai.shurikens = 0;
			}
			
			
			if (!gameOver && startGame && !paused) // while the game is played
			{
				dragonSwarm.handleDragons(); // handle the dragons
				
				if (dragonSwarm.checkForDamage(samurai)) // check for damages - if any then reduceOneLive
				{	
					samuraiLives.reduceOneLive();
				}
				
				if (dragonSwarm.checkForDetonation(shurikens)) // check for damages - if any then reduceOneLive
				{	
					//samuraiLives.reduceOneLive();
				}
				
				if (samuraiLives.livesLeft == 0) // defines the player loses 
					gameOver = true;
			

				function keyPressed() {
					if (keyCode === LEFT_ARROW) {
						scale(-1,1);
						image(Samurai.image, Samurai.x, Samurai.y);
					} else if (keyCode === RIGHT_ARROW) {
						scale(-1,1);
					}
				  }

				if (keyIsDown(37)) // left arrow is pressed
				{
					samurai.move(-1);
				}
				
				if (keyIsDown(39)) // right arrow is pressed
				{
					samurai.move(1);
				}
				
				/*
				if (keyIsDown(32)) // space is pressed
				{
					shurikens.push(samurai.fireShuriken());
				}
				*/
								
				//touch-and-orientation-controls
				samurai.move(getTouchDirectionControl()); // get the touch controls - if any
				samurai.move(getOrientationControls()); // get the orientation controls - if any
				
				//Pd.send('receive', [spaceship.x]);  // to try this or the following -- for future development
				//Pd.send('receive', [parseFloat($('#spaceship.x').val())]);
				
				shurikenPack.newShurikenPack(dragonSwarm.dragonsPassed);
				shurikenPack.display();
				shurikenPack.checkForCollection(samurai);
				
				for (let i = 0; i < shurikens.length; i++)
				{
					//console.log('Check shuriken['+i+']');
					if(!shurikens[i].display())
					{
						//console.log('Shuriken ' + i + ' out of screen');
						shurikens.splice(i,1);
						i--;
					}
				}
			}
		}

		// function checkIfShootPressed() {

		// 	document.querySelector("body > img:nth-child(8)").addEventListener('click', () => {
		// 		controllerShootPressed = true;
		// 		return controllerShootPressed;
		// 	});

		// 	// setTimeout(() => {
		// 	// 	return controllerShootPressed;
		// 	// }, 5);
		// }

		function mousePressed() {
			if(controllerShootPressed && throwShurikenTouchPressed()) {
				let temp = samurai.fireShuriken();
				if (temp != undefined)
				shurikens.push(temp);
			}
		}
				
		function keyPressed()
		{
			if (keyIsDown(83)) // space is pressed - fire a shuriken
			{
				let temp = samurai.fireShuriken();
				if (temp != undefined)
					shurikens.push(temp);
			}
			
			if (keyCode == 78) // n is pressed - New game
			{
				startGame = true;
				startOnce = true;
				gameOver = false;
			}
			
			if (keyCode == 80) // p for pause is pressed
			{
				if (startGame && !gameOver && !paused)
					paused = true;
				else if (startGame && !gameOver && paused)
					paused = false;
					
				if (paused)
				{
					Pd.stop();
				}
				if (!paused)
				{
					Pd.start();
					samurai.startMusicSound();
				}
			}
		}

		function showMessages()
		{
			textSize(27);
			text("Score: " + dragonSwarm.dragonsPassed, 30, 135); // Score is shown
			
			text("Shurikens: " + samurai.shurikens, 270, 60); // Score is shown
		
			if (!startGame)
				rect(280, 280, 700, 140); // rectangle (window) to show the message to start game
				
			if (gameOver)
				rect(280, 220, 700, 200); // rectangle (window) to show the message game over and start game
		
			textSize(50);
			if (!startGame || gameOver) // provide instructions
			{
				text('Press N to start a new game.', 300, 300, 800, 200);
				textSize(25);
				text('Use the left and right arrows to avoid the dragons.', 340, 360, 800, 200);
				text('>>> Collect shurikens and throw by pressing S <<<', 340, 390, 800, 200);
			}
			
			if (gameOver)
			{
				textSize(50);
				text('Game over!', 500, 280);
			}
			
			if (paused)
			{
				textSize(50);
				text('Game paused!', 500, 280);
			}
		}
	
