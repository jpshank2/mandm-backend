const BASE = (list) => {
    //let called = list
    let start = 0
    let win = []
    let winner = false

    let winColumn = (list) => {
        start = 0
        while (start < list.length) {
            let i = start
            win.push(list[i].BingoPosition)
            for (let j = i + 1; j < list.length; j++) {
                if (list[j].BingoPosition - list[i].BingoPosition === 1) {
                    win.push(list[j].BingoPosition)
                    i = j
                }
            }
            
            if (win.length === 5) {
                if (((win[0] === 1) || (win[0] === 6) || (win[0] === 11) || (win[0] === 16) || (win[0] === 21))
                && ((win[4] === 5) || (win[4] === 10) || (win[4] === 15) || (win[4] === 20) || (win[4] === 25))) {
                winner = true
            }
            } else {
                start += 1
                win = []
            }
        }
    }

    let winLeftDiag = (list) => {
        start = 0
        if (list[start].BingoPosition === 1) {
            win.push(list[start].BingoPosition)
            let i = start
            for (let j = i + 1; j < list.length; j++) {
                if (list[j].BingoPosition - list[i].BingoPosition === 6) {
                    win.push(list[j].BingoPosition)
                    i = j
                }
            }

            if (win.length === 5) {
                if (((win[0] === 1)) && ((win[4] === 25))) {
                    winner = true
                }
            } else {
                win = []
            }
        }
    }

    let winRightDiag = (list) => {
        start = 0 
        list.forEach((tile, index) => {
            if (tile.BingoPosition === 5) {
                let i = index
                win.push(list[i].BingoPosition)
                for (let j = i + 1; j < list.length; j++) {
                    if (list[j].BingoPosition - list[i].BingoPosition === 4) {
                        win.push(list[j].BingoPosition)
                        i = j
                    }
                }

                if (win.length === 5) {
                    if (((win[0] === 5)) && ((win[4] === 21))) {
                        winner = true
                    }
                } else {
                    win = []
                }
            }
        })
    }

    let winRow = (list) => {
        start = 0
        while (start < list.length) {
            let i = start
            win.push(list[i].BingoPosition)
            for (let j = i + 1; j < list.length; j++) {
                if (list[j].BingoPosition - list[i].BingoPosition === 5) {
                    win.push(list[j].BingoPosition)
                    i = j
                }
            }
            
            if (win.length === 5) {
                if (((win[0] === 1) || (win[0] === 2) || (win[0] === 3) || (win[0] === 4) || (win[0] === 5))
                    && ((win[4] === 21) || (win[4] === 22) || (win[4] === 23) || (win[4] === 24) || (win[4] === 25))) {
                    winner = true
                }
            } else {
                start += 1
                win = []
            }
        }
    }

    let check = (list) => {
        while (!winner && start < list.length) {
            winLeftDiag(list)
            winRightDiag(list)
            winRow(list)
            winColumn(list)
        }
        return winner
    }

    return check(list)
}

module.exports = {
    BASE: BASE
}