import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";

const SquidBingo = () => {
  const drawNumbersPath = path.resolve(__dirname, "DrawNumbers.csv");
  const bingoBoardsPath = path.resolve(__dirname, "BingoBoards.csv");

  // Uncomment the following lines to test with the test files
  // const bingoBoardsPath = path.resolve(__dirname, "TestBoards.csv");
  // const drawNumbersPath = path.resolve(__dirname, "TestNumbers.csv");

  const drawNumbers = fs.readFileSync(drawNumbersPath, "utf8");
  const boardSize = 5;

  const arrangeBoards = (boardsFileContent: string, boardSize: number) => {
    // Convert to array and cast as numbers
    const bingoBoardsArray = boardsFileContent
      .split("\n")
      .map((row) => row.split(",").map((number) => Number(number)));

    const numberOfBoards = bingoBoardsArray.length / boardSize;
    // Return as 2D array of boards
    return Array.from({ length: numberOfBoards }, (_val, i) =>
      bingoBoardsArray.slice(i * boardSize, i * boardSize + boardSize)
    );
  };

  const isBingo = (board: number[][]) => {
    // Check for bingo on rows
    for (let row = 0; row < board.length; row++) {
      if (board[row].every((number) => number === -1)) {
        return true; // Bingo on row
      }
    }

    // Check for bingo on columns
    for (let col = 0; col < board[0].length; col++) {
      if (board.every((row) => row[col] === -1)) {
        return true; // Bingo on column
      }
    }
    return false; // No bingo on any row or column
  };

  const handleDraw = (
    drawNumbersArray: number[],
    bingoBoardsArray: number[][][]
  ) => {
    const numberOfBoards = bingoBoardsArray.flat().length / boardSize;
    const results = [];

    for (let i = 0; i < numberOfBoards; i++) {
      const boardCopy = bingoBoardsArray[i].map((row) => [...row]);
      let bingoAchieved = false;
      let numberOfDraws = 0;

      for (const drawNumber of drawNumbersArray) {
        if (bingoAchieved) {
          break; // // Bingo! Move to the next board
        }
        for (let j = 0; j < boardSize; j++) {
          for (let k = 0; k < boardSize; k++) {
            if (drawNumber === boardCopy[j][k]) {
              boardCopy[j][k] = -1;
            }
          }
        }
        numberOfDraws++;
        // If bingo achieved, push the board in the state of bingo along with the number of draws and last drawn number
        if (isBingo(boardCopy)) {
          results.push({
            board: boardCopy,
            draws: numberOfDraws,
            lastDraw: drawNumber,
          });
          bingoAchieved = true; // Mark bingo as achieved for this board
          break; // Bingo! Move to the next board
        }
      }
    }
    if (results.length === 0) {
      return false;
    }
    return results;
  };

  const sumNonNegativeNumbers = (arr: number[]) => {
    let sum = 0;

    for (const number of arr) {
      if (number !== -1) {
        sum += number;
      }
    }
    return sum;
  };

  const calculateScore = (
    result: {
      board: number[][];
      draws: number;
      lastDraw: number;
    }[]
  ) => {
    // Check each draws to find the highest number of draws
    let highestDraws = 0;
    result.forEach((entry) => {
      if (entry.draws > highestDraws) {
        highestDraws = entry.draws;
      }
    });

    // Find the board with the most draws
    const highestDrawsBoard = result.find(
      (entry) => entry.draws === highestDraws
    );
    const sumUnmarkedNumbers = sumNonNegativeNumbers(
      highestDrawsBoard!.board.flat()
    );

    return {
      score: sumUnmarkedNumbers * highestDrawsBoard!.lastDraw,
      board: highestDrawsBoard!.board,
      lastDraw: highestDrawsBoard!.lastDraw,
      draws: highestDrawsBoard!.draws,
      boardNumber: result.indexOf(highestDrawsBoard!) + 1,
    };
  };

  parse(drawNumbers, {}, (err, drawNumbers) => {
    if (err) {
      console.log("Error: ", err);
      return;
    }
    // Convert string elements to numbers
    drawNumbers = drawNumbers.flat().map((number: string) => +number);

    // Read and process the BingoBoards.csv file
    const boardsFileContent = fs.readFileSync(bingoBoardsPath, "utf8");
    // Prepare the boards
    const bingoBoards = arrangeBoards(boardsFileContent, boardSize);
    // Handle the draw and get the result of all boards
    const result = handleDraw(drawNumbers, bingoBoards);

    if (result) {
      // Get the board with the highest number of draws and calculate the score
      const { score, board, lastDraw, draws, boardNumber } =
        calculateScore(result);
      // Not using string interpolation to avoid the board being printed as a string, and to get yellow numbers in the terminal
      console.log("\n", "Last bingo on board number", boardNumber, "\n", board);
      console.log("Score: ", score);
      console.log("Number of draws:", draws);
      console.log("Got bingo with:", lastDraw, "\n");
      return;
    }
    console.log("Something went wrong");
  });
};

SquidBingo();
