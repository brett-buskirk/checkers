/* ================================================================================================
    CHECKER API
    -----------
      This file contains the checker API used as the foundation for the game logic, its public
      methods are as follows:

        generatePieces()
        capturedPieces()
        availableMoves()
        opportunity()
================================================================================================ */

const checker = (function() {
  // Private object containing the diagonal squares of each playable square on the board, 
  // representing the possible moves of each piece
  const pmoves = {
    1: [5, 6],
    2: [6, 7],
    3: [7, 8],
    4: [8],
    5: [1, 9],
    6: [1, 2, 9, 10],
    7: [2, 3, 10, 11],
    8: [3, 4, 11, 12],
    9: [5, 6, 13, 14],
    10: [6, 7, 14, 15],
    11: [7, 8, 15, 16],
    12: [8, 16],
    13: [9, 17],
    14: [9, 10, 17, 18],
    15: [10, 11, 18, 19],
    16: [11, 12, 19, 20],
    17: [13, 14, 21, 22],
    18: [14, 15, 22, 23],
    19: [15, 16, 23, 24],
    20: [16, 24],
    21: [17, 25],
    22: [17, 18, 25, 26],
    23: [18, 19, 26, 27],
    24: [19, 20, 27, 28],
    25: [21, 22, 29, 30],
    26: [22, 23, 30, 31],
    27: [23, 24, 31, 32],
    28: [24, 32],
    29: [25],
    30: [25, 26],
    31: [26, 27],
    32: [27, 28]
  };

  // Private object containing the possible capture moves of each piece.
  // The property is the pieces current square. The target property is the 
  // possible squares that a piece can jump to from their current square. The
  // jumps property is the square that the piece would jump over to reach the
  // target square (which has the same index of the target array)
  const cmoves = {
    1: {targets: [10], jumps: [6]},
    2: {targets: [9, 11], jumps: [6, 7]},
    3: {targets: [10, 12], jumps: [7, 8]},
    4: {targets: [11], jumps: [8]},
    5: {targets: [14], jumps: [9]},
    6: {targets: [13, 15], jumps: [9, 10]},
    7: {targets: [14, 16], jumps: [10, 11]},
    8: {targets: [15], jumps: [11]},
    9: {targets: [2, 18], jumps: [6, 14]},
    10: {targets: [1, 3, 17, 19], jumps: [6, 7, 14, 15]},
    11: {targets: [2, 4, 18, 20], jumps: [7, 8, 15, 16]},
    12: {targets: [3, 19], jumps: [8, 16]},
    13: {targets: [6, 22], jumps: [9, 17]},
    14: {targets: [5, 7, 21, 23], jumps: [9, 10, 17, 18]},
    15: {targets: [6, 8, 22, 24], jumps: [10, 11, 18, 19]},
    16: {targets: [7, 23], jumps: [11, 19]},
    17: {targets: [10, 26], jumps: [14, 22]},
    18: {targets: [9, 11, 25, 27], jumps: [14, 15, 22, 23]},
    19: {targets: [10, 12, 26, 28], jumps: [15, 16, 23, 24]},
    20: {targets: [11, 27], jumps: [16, 24]},
    21: {targets: [14, 30], jumps: [17, 25]},
    22: {targets: [13, 15, 29, 31], jumps: [17, 18, 25, 26]},
    23: {targets: [14, 16, 30, 32], jumps: [18, 19, 26, 27]},
    24: {targets: [15, 31], jumps: [19, 27]},
    25: {targets: [18], jumps: [22]},
    26: {targets: [17, 19], jumps: [22, 23]},
    27: {targets: [18, 20], jumps: [23, 24]},
    28: {targets: [19], jumps: [24]},
    29: {targets: [22], jumps: [25]},
    30: {targets: [21, 23], jumps: [25, 26]},
    31: {targets: [22, 24], jumps: [26, 27]},
    32: {targets: [23], jumps: [27]},
  };

  /* ================================================================================================
    PIECE CLASS
    -----------
        Class to generate individual game pieces 
        Structure: {loc: 1, color: 'red', king: false}
        Methods:   .moves(), .captures()
  ================================================================================================ */

  class Piece {
    constructor(loc, color) {
      this.loc = loc;     // number
      this.color = color; // string
      this.king = false;  // boolean
    }

    // Method determining if a piece can legally move to the target square
    // Does not check for occupation of the target square
    moves(target) {
      if (!pmoves[this.loc].includes(target)) return false;
      if (this.king) return true;
      if (this.color === 'red' && this.loc < target) return true;
      if (this.color === 'black' && this.loc > target) return true;
      return false;
    }

    // Method determining if a piece can jump to the target square in order
    // to potentially capture another piece.
    // Does not check for occupation of target square or jumped square.
    captures(target) {
      let idx = cmoves[this.loc].targets.indexOf(target);
      if (idx === -1) return -1;
      if (this.color === 'red' && !this.king) {
        if (this.loc > target) return -1;
      }
      if (this.color === 'black' && !this.king) {
        if (this.loc < target) return -1;
      }
      return cmoves[this.loc].jumps[idx];
    }
  }

  /* ================================================================================================
    GENERATE GAME PIECES
    --------------------
        INPUTS:  no input
        OUTPUTS: Object containing Piece objects for a new game
  ================================================================================================ */

  function generatePieces() {
    let pieces = {};
    for (let i = 1; i < 13; i++) {
      pieces[`p${i}`] = new Piece(i, 'red');
      pieces[`p${i + 20}`] = new Piece(i + 20, 'black');
    }
    return pieces;
  }

  /* ================================================================================================
    CHECK TO SEE IF A PIECE CAN BE CAPTURED
    ---------------------------------------
        INPUTS:  piece (object) = piece being moved
                 target (number) = target square piece is attempting to move to
                 all (object) = object containing all the game pieces currently in play
        OUTPUTS: Boolean FALSE if a capture cannot be made
                 String value indicating the captured piece's id value if a capture can be made
  ================================================================================================ */

  function capturedPiece(piece, target, all) {
    let x = piece.captures(target);
    if (x < 0) return false;
    for (prop in all) {
      if (all[prop].loc === x) {
        if (all[prop].color !== piece.color) return prop;
        else return false;
      }
    }
    return false;
  }

  /* ================================================================================================
    CHECK ALL AVAILABLE MOVES FOR A PIECE
    -------------------------------------
        INPUTS:  piece (object) = piece being moved
                 all (object) = object containing all the game pieces currently in play
        OUTPUTS: returns and Array of numbers for the available squares that the piece can legally
                 move to (checks for occupation of squares)
  ================================================================================================ */ 

  function availableMoves(piece, all) {
    const cpMoves = jQuery.extend(true, {}, pmoves);
    let move = cpMoves[piece.loc];
    for (let i = 0; i < move.length; i++) {
      for (let prop in all) {
        if (move[i] === all[prop].loc) delete move[i];
      }
    }
    move = move.filter(x => x);
    if (piece.color === 'red' && !piece.king) {
      move = move.filter(x => x > piece.loc);
    }
    if (piece.color === 'black' && !piece.king) {
      move = move.filter(x => x < piece.loc);
    }
    return move;
  }

  /* ================================================================================================
    CHECK CAPTURE OPPORTUNTIES FOR A GIVEN PIECE
    --------------------------------------------
        INPUTS:  piece (object) = piece being moved
                 all (object) = object containing all the game pieces currently in play
        OUTPUTS: returns and Array of numbers for the available squares that the piece can legally
                 move to in order to capture an opposing piece
  ================================================================================================ */

  function opportunity(piece, all) {
    const cpMoves = jQuery.extend(true, {}, cmoves);
    let {targets, jumps} = cpMoves[piece.loc];
    let empSquares = [];
    for (i=1; i<33; i++) empSquares.push(i);
    for (prop in all) delete empSquares[all[prop].loc - 1];
    empSquares = empSquares.filter(x => x);
    if (piece.color === 'red' && !piece.king) {
      targets = targets.filter(x => x > piece.loc);
      jumps = jumps.filter(x => x > piece.loc);
    }
    if (piece.color === 'black' && !piece.king) {
      targets = targets.filter(x => x < piece.loc);
      jumps = jumps.filter(x => x < piece.loc);
    }
    for (let i = 0; i < targets.length; i++) {
      for (let prop in all) {
        if (all[prop].loc !== targets[i]) continue;
        delete targets[i];
        delete jumps[i];
      }
    }
    targets = targets.filter(x => x);
    jumps = jumps.filter(x => x);  
    if (!targets.length) return [];
    for (let i = 0; i < jumps.length; i++) {
      for (let prop in all) {
        if (all[prop].loc !== jumps[i]) continue;
        if (all[prop].color === piece.color) delete targets[i];
      }
      if (empSquares.includes(jumps[i])) delete targets[i];
    }
    return targets.filter(x => x);
  }

  /* ================================================================================================
    METHODS EXPORTED BY THE CHECKER API
  ================================================================================================ */
  
  return {generatePieces, capturedPiece, availableMoves, opportunity};
})();