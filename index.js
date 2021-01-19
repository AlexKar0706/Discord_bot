const Discord = require('discord.js');
const { config } = require("dotenv");
const client = new Discord.Client({
    disableEveryone: true
});

config({
    path: __dirname + "/.env"
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.user.setPresence({
      status: "online",
      game: {
          name: "working",
          type: "WATCHING"
      }
  });
});



client.on('message', msg => {
    console.log(msg.content);

    msg.content.toLowerCase();
    msg.content.trim();

    var reg = /^\/ASCII\b/;

    if (reg.test(msg.content)) {
        var word = msg.content;
        var binString = '';
        word = word.replace(reg, '');
        word = word.replace(/ /g, "");
        for (let i = 0; i<word.length; i++) {
            binString += (word.charCodeAt(i)).toString(2) + ' ';
        }
        msg.channel.send(binString);
    }

    if (msg.content === '/snake') {
        var user = msg.author;  
        msg.delete()
        createGame(msg, user);
    }

});

async function createGame(msg, user) {
    let game = [];
    for(let i = 0; i < 10; i++) {
        game[i] = [];
        for (let j = 0; j < 10; j++) {
            if (i === 0 || i === 9 || j === 0 || j === 9) game[i][j] = ':purple_square:'
            else game[i][j] = ':black_large_square:'
        }
    }
    try {
    var botMessage = await msg.channel.send('Starting the game');
    } catch (err) {
        console.log(err);
    }
    const height = 8;
    const width = 8
    let snake = [];
    let move = '';
    let food = {
        x: Math.floor(Math.random() * width) + 1,
        y: Math.floor(Math.random() * height) + 1,
    };

    function createFood () {
        var foodX = Math.floor(Math.random() * width) + 1;
        var foodY = Math.floor(Math.random() * height) + 1;
        for(let i = 0; i<snake.length; i++) {
            if(foodX == snake[i].x && foodY == snake[i].y) {
                foodX = Math.floor(Math.random() * width) + 1;
                foodY = Math.floor(Math.random() * height) + 1;
                i=0;
            }
        }
        food = {
            x: foodX,
            y: foodY
        };
    }

    snake = [{}];

    snake[0] = {
        x: width/2 + 1,
        y: height/2 + 1
    }

    function reset () {
        snake = [];
        snake[0] = {
            x: width/2 + 1,
            y: height/2 + 1
        }
        move = "";
        createFood();
    }

    client.on("message", userMessage => {
        if (userMessage.author === user) {
            if (userMessage.content === 'w'  && move !== "down") move = 'up'
            else if (userMessage.content === 'd' && move !== "left") move = 'right'
            else if (userMessage.content === 's' && move !== "up") move = 'down'
            else if (userMessage.content === 'a' && move !== "right") move = 'left'
            else if (userMessage.content === 'stop') clearTimeout(myTimeout)
            userMessage.delete();
        }
    })

    async function drawGame() {

        for(let i = 0; i < 10; i++) {
            game[i] = [];
            for (let j = 0; j < 10; j++) {
                if (i === 0 || i === 9 || j === 0 || j === 9) game[i][j] = ':purple_square:'
                else game[i][j] = ':black_large_square:'
            }
        }

        game[food.y][food.x] = ':green_circle:'

        for (let i = 0; i<snake.length; i++) game[snake[i].y][snake[i].x] = ':orange_square:'

        let board = '';
        for(let i = 0; i < 10; i++) {
            board += game[i].join('')
            board += '\n';
        }

        await botMessage.edit(board);

        let stepX = snake[0].x;
        let stepY = snake[0].y;

        if(stepX === food.x && stepY === food.y) createFood();
        else snake.pop();

        for (let i=1; i<snake.length; i++)  {
            if(snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
                reset();
                return;
            }
        }

        if (move === "left") stepX--;
        if (move === "up") stepY--;
        if (move === "right") stepX++;
        if (move === "down") stepY++;

        if (stepX < 1) {
            stepX = width;
        } else if (stepX === width+1) {
            stepX = 1;
        }

        if (stepY < 1) {
            stepY = height;
        } else if (stepY === height+1) {
            stepY = 1;
        }

        let snakeStep = {
            x: stepX,
            y: stepY
        }
        snake.unshift(snakeStep);
        myTimeout = setTimeout(drawGame, 1000)
    }
    var myTimeout = setTimeout(drawGame, 1000)
}

client.login(process.env.TOKEN);