

var tablero = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];

var turno = 1;
var mode = {
  wins: 4, 
  tokens: 4
};

var p1_checks = [];
var p2_checks = [];
var p3_checks = [];

var n = 0;

$(document).ready(function(){

  if (localStorage.getItem("ttt4mode") != null) {
    const savedmode = localStorage.getItem("ttt4mode");
    let arr = savedmode.split("-");
    
    mode = {
      wins: arr[0], 
      tokens: arr[1]
    };

    $("#menu_mode").val(savedmode);
  }

  $("#clean").click(function(e) {
    e.preventDefault();
    start();
  });

  $("#menu_mode").change(function(e) {
    e.preventDefault();
    const selectedmode = $(this).val();

    let arr = selectedmode.split("-");
    
    mode = {
      wins: arr[0], 
      tokens: arr[1]
    };

    localStorage.setItem("ttt4mode", selectedmode);

    start();
  });

  start();

});

function start() {
  
  $("#container").removeClass("finalizado tie turno2 turno3 t1wins t2wins t3wins wins3 wins4")
    .removeClass("start end row0 row1 row2 row3 col0 col1 col2 col3 diag1 diag2 d00 d01 d02 d03 d10 d11 d12 d13")
    .addClass("wins"+ mode.wins);

  $("#container .win img").each(function() {
    $(this).attr("src", $(this).attr("src").replace(/wins[34]/, "wins"+mode.wins));
  });

  tablero = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  turno = 1;
  p1_checks = [];
  p2_checks = [];
  p3_checks = [];

  $("#tablero")
    .addClass("turno1");
  $("#container")
    .addClass("turno1");

  $("#tablero table tr td a").remove();

  $("#tablero table tr").each(function(i) {
    
    $(this).find("td").each(function(j) {
      
      $(this).data("cell", {r: i, c: j});
      $(this)
        .data("value", "empty")
        .addClass("empty")
        .removeClass("sel1 sel2 sel3 remove").
        append(`<a href="#"></a>`);

    });
  });
  
  $("#tablero table tr td a").click(function(e) {
    e.preventDefault();

    if ($("#container").hasClass("finalizado"))
      return false;

    var td = $(this).parent();

    if (!td.hasClass("empty"))
      return false;

    let remove = $("#tablero table td.remove");
    if (remove.length>0) {
      //clean
      remove.removeClass("remove sel1 sel2 sel3")
        .addClass("empty");
      
      if (turno==1) {
        p1_checks.splice(n, 1);
      } else if (turno==2) {
        p2_checks.splice(n, 1);
      } else {
        p3_checks.splice(n, 1);
      }
      
    }  

    td.removeClass("empty sel1 sel2 sel3")
      .data("value", "sel"+turno)
      .addClass("sel" + turno);

    const selected = td.data("cell");
    tablero[selected.r][selected.c] = turno;
    
    if (!checkLine()) {
      
      let cell = td.data("cell");

      n = getRandomInt(3);
    
      if (turno==1) {
        p1_checks.push(cell);
        
        if (p2_checks.length==mode.tokens) {
          marcaBorrar(p2_checks[n]);
        } 
      } else  if (turno==2) {
        p2_checks.push(cell);
        
        if (p3_checks.length==mode.tokens) {
          marcaBorrar(p3_checks[n]);
        }
      } else {
        p3_checks.push(cell);
        
        if (p1_checks.length==mode.tokens) {
          marcaBorrar(p1_checks[n]);
        }
      }

      if (turno==1) {
        turno=2;
      } else if (turno==2) {
        turno=3;
      } else {
        turno=1;
      }
      
      $("#container")
        .removeClass("turno1 turno2 turno3")
        .addClass("turno" + turno);
    }

  });
}

function checkLine() {

  let result = checkRows();
  if (result.isLine) {
    end(result);
    return true;
  } 

  result = checkCols();
  if (result.isLine) {
    end(result);
    return true;
  }

  result = checkDiagonals();
  if (result.isLine) {
    end(result);
    return true;
  }
  
  return false;
}

function checkRows() {
  for (r=0;r<tablero.length;r++) {
    let result = checkRow(r);

    if (result.isLine) {
      return result;
    }
  }
  return {isLine: false};
}

function checkCols() {
  for (c=0;c<tablero.length;c++) {
    let result = checkCol(c);

    if (result.isLine) {
      return result;
    }
  }
  return {isLine: false};
}

function checkDiagonals() {
  if (mode.wins==4) {
    return checkDiagonals4(r);
  } else {
    return checkDiagonals3(r);
  }
}

function checkDiagonals4(r) {  
  let diag_TL_BR = [tablero[0][0], tablero[1][1], tablero[2][2], tablero[3][3]];
  let allEqual = diag_TL_BR.every( (v) => v>0 && v === diag_TL_BR[0]);
  if (allEqual) {
    return  {isLine: true, type: 'diag1', line: {from : {r: 0, c: 0}, to: {r: 3, c: 3}}, winner: diag_TL_BR[0]};
  } 

  let diag_TR_BL = [tablero[0][3], tablero[1][2], tablero[2][1], tablero[3][0]];
  allEqual = diag_TR_BL.every( (v) => v>0 && v === diag_TR_BL[0]);
  if (allEqual) {
    return  {isLine: true, type: 'diag2', line: {from : {r: 0, c: 3}, to: {r: 3, c: 0}}, winner: diag_TR_BL[0]};
  } 

  return {isLine: false};

}
function checkDiagonals3(r) {

  const diagonals = [
    {id: "d00", type: "diag1", line: {from : {r: 0, c: 0}, to: {r: 2, c: 2}}, cells: [tablero[0][0], tablero[1][1], tablero[2][2]]},  
    {id: "d01", type: "diag1", line: {from : {r: 0, c: 1}, to: {r: 2, c: 3}}, cells: [tablero[0][1], tablero[1][2], tablero[2][3]]},  
    {id: "d02", type: "diag2", line: {from : {r: 0, c: 2}, to: {r: 2, c: 0}}, cells: [tablero[0][2], tablero[1][1], tablero[2][0]]},  
    {id: "d03", type: "diag2", line: {from : {r: 0, c: 3}, to: {r: 2, c: 1}}, cells: [tablero[0][3], tablero[1][2], tablero[2][1]]},  
    {id: "d10", type: "diag1", line: {from : {r: 1, c: 0}, to: {r: 3, c: 2}}, cells: [tablero[1][0], tablero[2][1], tablero[3][2]]},  
    {id: "d11", type: "diag1", line: {from : {r: 1, c: 1}, to: {r: 3, c: 3}}, cells: [tablero[1][1], tablero[2][2], tablero[3][3]]},  
    {id: "d12", type: "diag2", line: {from : {r: 1, c: 2}, to: {r: 3, c: 0}}, cells: [tablero[1][2], tablero[2][1], tablero[3][0]]},  
    {id: "d13", type: "diag2", line: {from : {r: 1, c: 3}, to: {r: 3, c: 1}}, cells: [tablero[1][3], tablero[2][2], tablero[3][1]]}  
  ];

  let result = {isLine: false};
  diagonals.forEach(function(diagonal) {
    console.log('diagonal', diagonal);

    let allEqual = diagonal.cells.every( (v) => v>0 && v === diagonal.cells[0]);
    if (allEqual) {
      result = {isLine: true, type: diagonal.type, subtype: diagonal.id, line: diagonal.line, winner: diagonal.cells[0]};
    } 
  });

  return result;
}

function checkRow(r) {
  if (mode.wins==4) {
    return checkRow4(r);
  } else {
    return checkRow3(r);
  }
}

function checkRow4(r) {
  let row = tablero[r];
  const allEqual = row.every( (v) => v>0 && v === row[0]);
  if (allEqual) {
    return  {isLine: true, type: 'row' + r, line: {from : {r: r, c: 0}, to: {r: r, c: 3}}, winner: row[0]};
  } 

  return {isLine: false};
}
function checkRow3(r) {
  let rowstart = tablero[r].slice(0, tablero[r].length-1);
  let rowend = tablero[r].slice(1);
  console.log('rowstart', r, rowstart, rowend);
  let allEqual = rowstart.every( (v) => v>0 && v === rowstart[0]);
  if (allEqual) {
    return  {isLine: true, type: 'row' + r, subtype: 'start', line: {from : {r: r, c: 0}, to: {r: r, c: 2}}, winner: rowstart[0]};
  } 
  allEqual = rowend.every( (v) => v>0 && v === rowend[0]);
  if (allEqual) {
    return  {isLine: true, type: 'row' + r, subtype: 'end', line: {from : {r: r, c: 1}, to: {r: r, c: 3}}, winner: rowend[0]};
  } 

  return {isLine: false};
}


function checkCol(c) {
  if (mode.wins==4) {
    return checkCol4(r);
  } else {
    return checkCol3(r);
  }
}

function checkCol4(r) {
  let col = [tablero[0][c], tablero[1][c], tablero[2][c], tablero[3][c]];
  const allEqual = col.every( (v) => v>0 && v === col[0]);
  if (allEqual) {
    return  {isLine: true, type: 'col' + c, line: {from : {r: 0, c: c}, to: {r: 3, c: c}}, winner: col[0]};
  } 

  return {isLine: false};
}

function checkCol3(r) {
  let colstart = [tablero[0][c], tablero[1][c], tablero[2][c]];
  let colend = [tablero[1][c], tablero[2][c], tablero[3][c]];
  let allEqual = colstart.every( (v) => v>0 && v === colstart[0]);
  if (allEqual) {
    return  {isLine: true, type: 'col' + c, subtype: 'start', line: {from : {r: 0, c: c}, to: {r: 2, c: c}}, winner: colstart[0]};
  } 
  allEqual = colend.every( (v) => v>0 && v === colend[0]);
  if (allEqual) {
    return  {isLine: true, type: 'col' + c, subtype: 'end', line: {from : {r: 1, c: c}, to: {r: 3, c: c}}, winner: colend[0]};
  } 
  return {isLine: false};
}


function end(result) {
  
  $("#container").addClass("finalizado")
      .addClass(result.type)
      .addClass(result.subtype? result.subtype : '')
      .addClass("t" + result.winner+"wins");

    if (result.type=="col") {
      $("#tablero").addClass(result.type).addClass(result.subtype? result.subtype : '');
    }
    console.log("winner!", result);
}


function marcaBorrar(cell) {
  //console.log('cell', cell);
  tablero[cell.r][cell.c] = 0;
  
  $("#row"+ (cell.r +1) + "col" + (cell.c + 1)).addClass("remove");
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


function countZeros() {
  var c = 0;
  for (r=0;r<4;r++) {
    c += tablero[r].filter(v => v === 0).length;
  } 
  console.log('zeros', c);
  return c;
}