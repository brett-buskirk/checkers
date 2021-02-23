/* ================================================================================================
    INITIAL STATES OF GAME
================================================================================================ */

const pieces = checker.generatePieces();
const turn = {player: 'black', capture: false, opportunity: [], kinged: false};

/* ================================================================================================
    DRAGGABLE AND DROPPABLE FUNCTIONALITY
================================================================================================ */

// Draggable options
dragOpt = {
  cursor: '-webkit-grab',
  containment: '#board',
  opacity: 0.7,
  zIndex: 100,
  revert: 'invalid',
  revertDuration: 300
}

// Droppable options
dropOpt = {
  drop: function(event, ui) {
    let prop = $(ui.draggable).attr('id');
    let piece = pieces[prop];
    let home = piece.loc;
    let square = Number($(this).attr('id').replace(/sq-/,''));
    let validate = validateMove(piece, square);
    if (validate) {
      piece.loc = square;
      $(ui.draggable).css({top: 0, left: 0}).appendTo($(this));
      checkKing(piece, prop);
      checkGameState(prop);
      checkForExistingPiece();
    } else {
      $(ui.draggable).css({top: 0, left: 0}).appendTo($(`#${home}`));
    }
  }
}

/* ================================================================================================
   VALIDATION OF POTENTIAL MOVES
   -----------------------------
      INPUTS:  piece (object) = piece being moved
               target (number) = target square attempting to be moved to
      OUTPUTS: boolean FALSE if move cannot be made
               boolean TRUE if move can be made
      NOTES:   updates turn object's capture property
================================================================================================ */

function validateMove(piece, target) {
  if (piece.color !== turn.player) return false;
  if (turn.opportunity.length && !turn.opportunity.includes(target)) return false;
  if (piece.color === 'red' && !piece.king) {
    if (target < piece.loc) return false;
  }
  if (piece.color === 'black' && !piece.king) {
    if (target > piece.loc) return false;
  }
  let captured = checker.capturedPiece(piece, target, pieces);
  if (captured) {
    turn.capture = true;
    removeCapturedPiece(captured);
    return true;
  } else {
    turn.capture = false;
    let move = piece.moves(target);
    return move;
  }
}

/* ================================================================================================
   CHECK THE GAME STATE
   --------------------
      INPUTS:  piece (object) = piece being moved
      OUTPUTS: no output
      NOTES:   determines whose turn it is, updates turn object, checks for win
               sets page's h2 header, causes opportunity squares to flash
================================================================================================ */

function checkGameState(piece) {
  if (!turn.capture || turn.kinged) {
    turn.player = (turn.player === 'red') ? 'black' : 'red';
    turn.opportunity = checkAvailableOpportunities(turn.player);
  } else {
    turn.opportunity = checkAvailableOpportunities(turn.player, piece);
    if (!turn.opportunity.length) {
      turn.player = (turn.player === 'red') ? 'black' : 'red';
      turn.opportunity = checkAvailableOpportunities(turn.player);
    }
    turn.capture = false;
  }
  let win = checkWin();
  if (win) {
    $('h2').text(win);
  } else {
    $('h2').text(`${turn.player.charAt(0).toUpperCase() + turn.player.slice(1)}'s Turn`);
  }
  $('.square').removeClass('flash');
  turn.opportunity.forEach(s => $(`#sq-${s}`).addClass('flash'));
}

/* ================================================================================================
   CHECK FOR AVAILABLE CAPTURE OPPORTUNITIES
   -----------------------------------------
      INPUTS:  color (string) = color of current player's pieces
               piece (object) = piece being moved
      OUTPUTS: ARRAY of numbers indicating available capture opportunities for the given piece
================================================================================================ */

function checkAvailableOpportunities(color, piece) {
  let opps = [];
  if (piece) {
    opps.push(...checker.opportunity(pieces[piece], pieces));
  } else {
    for (let prop in pieces) {
      if (pieces[prop].color === color) {
        opps.push(...checker.opportunity(pieces[prop], pieces));
      }
    }
  }
  return opps;
}

/* ================================================================================================
   REMOVE CAPTURED PIECES FROM THE BOARD
   -------------------------------------
      INPUTS:  captured (string) = id name of the captured piece
      OUTPUTS: no output
      NOTES:   removes the piece from the board and places it in the appropriate pen,
               deletes the piece from the pieces object,
               sets the turn object's capture property to TRUE
================================================================================================ */

function removeCapturedPiece(captured) {
  let piece = pieces[captured];
  if (piece.color === 'red') {
    $(`#${captured}`).css({float: 'left'}).appendTo($('#pen-black'));
  } else {
    $(`#${captured}`).css({float: 'left'}).appendTo($('#pen-red'));
  }
  delete pieces[captured];
  turn.capture = true;
}

/* ================================================================================================
   CHECK TO SEE IF A PIECE HAS BEEN KINGED
   ---------------------------------------
      INPUTS:  piece (object) = piece being moved
               prop (string) = id name of the piece being moved
      OUTPUTS: returns NULL if the piece is already a king
      NOTES:   if piece is kinged, sets piece's king property to TRUE and adds CSS class
               sets turn object's kinged property to TRUE/FALSE
================================================================================================ */

function checkKing(piece, prop) {
  if (piece.king) return null;
  if (piece.color === 'black') {
    if ([1,2,3,4].includes(piece.loc)) {
      piece.king = true;
      turn.kinged = true;
      $(`#${prop}`).addClass('king-black');
    } else {
      turn.kinged = false;
    }
  } else {
    if ([29,30,31,32].includes(piece.loc)) {
      piece.king = true;
      turn.kinged = true;
      $(`#${prop}`).addClass('king-red');
    } else {
      turn.kinged = false;
    }
  }
}

/* ================================================================================================
   CHECK TO SEE IF A PLAYER HAS WON THE GAME
   -----------------------------------------
      INPUTS:  no input
      OUTPUTS: returns String value 'Red Wins!' or 'Black Wins!', or
               returns Boolean FALSE if neither player wins
      NOTES:   also checks to see if a side has any available moves left, if not the opposite
               player wins the game
================================================================================================ */

function checkWin() {
  let blackPieces = 0;
  let redPieces = 0;
  for (let prop in pieces) {
    if (pieces[prop].color === 'red') {
      redPieces++;
    } else {
      blackPieces++;
    }
  }
  if (!blackPieces) return 'Red Wins!';
  if (!redPieces) return 'Black Wins!';

  let avMoves = [];
  if (turn.player === 'red') {
    for (let prop in pieces) {
      if (pieces[prop].color === 'red') {
        avMoves.push(...checker.availableMoves(pieces[prop], pieces));
      }
    }
    if (!avMoves.length) return 'Black Wins!'
  } else {
    for (let prop in pieces) {
      if (pieces[prop].color === 'black') {
        avMoves.push(...checker.availableMoves(pieces[prop], pieces));
      }
    }
    if (!avMoves.length) return 'Red Wins!'
  }
  return false;
}

/* ================================================================================================
   RESET THE GAME BOARD
   --------------------
      INPUTS:  no input
      OUTPUTS: no output
      NOTES:   creates all the game pieces and places them on the board in their starting positions
================================================================================================ */

function resetGame() {
  for (let r = 1; r < 13; r++) {
    $(`<div id="p${r}" class="piece p-red"></div>`).draggable(dragOpt).appendTo($(`#sq-${r}`));
  }
  for (let b = 21; b < 33; b++) {
    $(`<div id="p${b}" class="piece p-black"></div>`).draggable(dragOpt).appendTo($(`#sq-${b}`));
  }
}

/* ================================================================================================
CHECK FOR EXISTING PIECES ON THE BOARD
--------------------------------------
INPUTS:  no input
OUTPUTS: no output
NOTES:   resets the droppable zones based on piece containment and square color
================================================================================================ */

function checkForExistingPiece() {
  $('div[id|="sq"]').each(function(idx) {
    if ($(this).children().length > 0) {
      $(this).droppable('disable');
    } else {
      if ($(this).hasClass('black')) {
        $(this).droppable('enable');
      }
    }
  });
}

/* ================================================================================================
    INITIAL PAGE LOAD SETTINGS
================================================================================================ */

// Make each black square a droppable zone
$(".black").droppable(dropOpt);

// Set the board on page load
resetGame();

// Set board paramaters on page load
checkForExistingPiece();